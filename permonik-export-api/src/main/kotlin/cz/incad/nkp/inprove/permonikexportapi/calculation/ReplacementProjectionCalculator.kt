package cz.incad.nkp.inprove.permonikexportapi.calculation

import cz.incad.nkp.inprove.permonikdomain.SpecimenDamageType.*

class ReplacementProjectionCalculator(
    private val fillIndexCalculator: FillIndexCalculator = FillIndexCalculator(),
    private val specimenMatcher: SpecimenMatcher = SpecimenMatcher(),
) {
    /**
     * Applies prioritized source snapshots and calculates the resulting virtual volume and fill
     * index.
     */
    fun combine(
        primary: VolumeSnapshot,
        sources: List<VolumeSnapshot>,
        issues: IssueSelection,
        rules: SpecimenMatchingRules,
    ): CombinedVolume {
        val primaryFillIndex = fillIndexCalculator.calculate(primary)
        val warnings = primaryFillIndex.warnings.toMutableList()
        val requiredUnits = requirements(primary, issues).size
        var projection = AppliedProjection(primary)
        val dependentFillIndexes = linkedMapOf<String, Int>()
        sources.forEach { source ->
            if (isEligible(primary, source, rules)) {
                projection = applySource(current = projection, source, issues, rules, warnings)
                dependentFillIndexes[source.id] =
                    fillIndexCalculator.calculate(projection.snapshot).value
            }
        }
        val fillIndex = fillIndexCalculator.calculate(projection.snapshot)
        val remaining = requirements(projection.snapshot, issues)
        return CombinedVolume(
            snapshot = projection.snapshot,
            primaryFillIndex = primaryFillIndex,
            fillIndex = fillIndex,
            requiredUnits = requiredUnits,
            remainingUnits = remaining.size,
            warnings = (warnings + fillIndex.warnings).distinct(),
            replacementPlan =
                projection.plan.copy(
                    unresolved = remaining.map { UnresolvedReplacement(it.specimenId, it.page) },
                    dependentFillIndexes = dependentFillIndexes,
                ),
        )
    }

    /**
     * Evaluates one candidate relative to the primary volume and sources already selected before
     * it.
     */
    fun evaluateCandidate(
        primary: VolumeSnapshot,
        selectedSources: List<VolumeSnapshot>,
        candidate: VolumeSnapshot,
        issues: IssueSelection,
        rules: SpecimenMatchingRules,
    ): CandidateEvaluation =
        evaluateCandidate(
            primary,
            baseline = combine(primary, sources = selectedSources, issues, rules),
            candidate,
            issues,
            rules,
        )

    /**
     * Projects one candidate onto an already calculated baseline without replaying selected
     * sources.
     */
    private fun evaluateCandidate(
        primary: VolumeSnapshot,
        baseline: CombinedVolume,
        candidate: VolumeSnapshot,
        issues: IssueSelection,
        rules: SpecimenMatchingRules,
    ): CandidateEvaluation {
        val eligible = isEligible(primary, candidate, rules)
        val warnings = baseline.warnings.toMutableList()
        val projected =
            if (eligible) {
                applySource(
                        current = AppliedProjection(baseline.snapshot, baseline.replacementPlan),
                        source = candidate,
                        issues,
                        rules,
                        warnings,
                    )
                    .snapshot
            } else {
                baseline.snapshot
            }
        val fillIndex =
            if (eligible) {
                fillIndexCalculator.calculate(projected)
            } else {
                baseline.fillIndex
            }
        val baselineRequirements = requirements(baseline.snapshot, issues)
        val projectedRequirements = requirements(projected, issues)
        return CandidateEvaluation(
            volumeId = candidate.id,
            eligible = eligible,
            dependentFillIndex = fillIndex.value,
            coveredRequiredUnits = (baselineRequirements - projectedRequirements).size,
            remainingRequiredUnits = projectedRequirements.size,
            warnings = (warnings + fillIndex.warnings).distinct(),
        )
    }

    /**
     * Evaluates candidates independently and returns eligible candidates by projected index and
     * stable ID.
     */
    fun evaluateCandidates(
        primary: VolumeSnapshot,
        selectedSources: List<VolumeSnapshot>,
        candidates: List<VolumeSnapshot>,
        issues: IssueSelection,
        rules: SpecimenMatchingRules,
    ): List<CandidateEvaluation> {
        val baseline = combine(primary, sources = selectedSources, issues, rules)
        return candidates
            .map { evaluateCandidate(primary, baseline, candidate = it, issues, rules) }
            .filter(CandidateEvaluation::eligible)
            .sortedWith(
                compareByDescending(CandidateEvaluation::dependentFillIndex)
                    .thenBy(CandidateEvaluation::volumeId)
            )
    }

    /**
     * Checks mandatory title and overlap constraints plus optional owner and mutation constraints.
     */
    fun isEligible(
        primary: VolumeSnapshot,
        candidate: VolumeSnapshot,
        rules: SpecimenMatchingRules,
    ): Boolean =
        candidate.id != primary.id &&
            candidate.metaTitleId == primary.metaTitleId &&
            overlaps(primary, candidate) &&
            (!rules.matchOwner || candidate.ownerId == primary.ownerId) &&
            (!rules.matchMutation || candidate.mutationId == primary.mutationId) &&
            (!rules.matchMutationalEdition || candidate.mutationMark == primary.mutationMark)

    /**
     * Applies all usable whole and page replacements from one source snapshot to a virtual volume.
     */
    private fun applySource(
        current: AppliedProjection,
        source: VolumeSnapshot,
        issues: IssueSelection,
        rules: SpecimenMatchingRules,
        warnings: MutableList<CalculationWarning>,
    ): AppliedProjection {
        val plan = current.plan.items.associateBy { it.targetSpecimenId }.toMutableMap()
        val specimens =
            current.snapshot.specimens.map { target ->
                if (
                    !hasWholeRequirement(target, issues) && requiredPages(target, issues).isEmpty()
                ) {
                    return@map target
                }
                val matches = source.specimens.filter { specimenMatcher.matches(target, it, rules) }
                matches.forEach { specimen ->
                    warnings += specimen.unknownDamageWarnings()
                    if (specimen.pagesCount <= 0) {
                        warnings +=
                            CalculationWarning(
                                CalculationWarningCode.UNKNOWN_PAGE_COUNT,
                                specimen.id,
                            )
                    }
                    validPages(
                        specimenId = specimen.id,
                        pages = specimen.missingPages,
                        pageCount = specimen.pagesCount,
                        warnings,
                    )
                    validPages(
                        specimenId = specimen.id,
                        pages = specimen.damagedPages,
                        pageCount = specimen.pagesCount,
                        warnings,
                    )
                }
                if (matches.size > 1) {
                    warnings +=
                        CalculationWarning(
                            CalculationWarningCode.AMBIGUOUS_SPECIMEN_MATCH,
                            target.id,
                            source.id,
                        )
                    return@map target
                }
                val candidate = matches.singleOrNull() ?: return@map target
                val applied = applySpecimenSource(target, candidate, issues) ?: return@map target
                val previous = plan[target.id] ?: ReplacementPlanItem(target.id)
                plan[target.id] =
                    if (applied.pages.isEmpty()) {
                        previous.copy(
                            mainReplacement = ReplacementDecision(source.id, candidate.id)
                        )
                    } else {
                        previous.copy(
                            pageReplacements =
                                previous.pageReplacements +
                                    ReplacementDecision(source.id, candidate.id, applied.pages)
                        )
                    }
                applied.snapshot
            }
        return AppliedProjection(
            snapshot = current.snapshot.copy(specimens = specimens),
            plan = current.plan.copy(items = current.snapshot.specimens.mapNotNull { plan[it.id] }),
        )
    }

    /**
     * Replaces a whole deficient specimen or only the deficient pages available in the source
     * specimen.
     */
    private fun applySpecimenSource(
        target: SpecimenSnapshot,
        source: SpecimenSnapshot,
        issues: IssueSelection,
    ): AppliedSpecimen? {
        if (!source.numExists || source.numMissing || hasWholeRequirement(source, issues)) {
            return null
        }
        if (hasWholeRequirement(target, issues)) {
            return AppliedSpecimen(
                target.copy(
                    numExists = source.numExists,
                    numMissing = source.numMissing,
                    pagesCount = source.pagesCount,
                    missingPages = source.missingPages,
                    damagedPages = source.damagedPages,
                    damageTypes = source.damageTypes,
                )
            )
        }

        val sourceMissingPages = normalizePages(source.missingPages, source.pagesCount).values
        val sourceDamagedPages = normalizePages(source.damagedPages, source.pagesCount).values
        if (DAMAGED_DOCUMENT.code in source.damageTypes && sourceDamagedPages.isEmpty()) {
            return null
        }
        val availablePages =
            requiredPages(target, issues).filterTo(mutableSetOf()) { page ->
                page in 1..source.pagesCount &&
                    page !in sourceMissingPages &&
                    page !in sourceDamagedPages
            }
        if (availablePages.isEmpty()) {
            return null
        }
        val missingPages =
            if (issues.missingPages) {
                target.missingPages.filterNot(availablePages::contains)
            } else {
                target.missingPages
            }
        val damagedPages =
            if (issues.damagedPages) {
                target.damagedPages.filterNot(availablePages::contains)
            } else {
                target.damagedPages
            }
        val resolvedDamageTypes = target.damageTypes.toMutableSet()
        if (issues.missingPages && missingPages.isEmpty()) {
            resolvedDamageTypes.remove(MISSING_PAGES.code)
        }
        if (issues.damagedPages && damagedPages.isEmpty()) {
            resolvedDamageTypes.remove(DAMAGED_DOCUMENT.code)
        }
        return AppliedSpecimen(
            target.copy(
                missingPages = missingPages,
                damagedPages = damagedPages,
                damageTypes = resolvedDamageTypes,
            ),
            availablePages.sorted(),
        )
    }

    /** Identifies unresolved units by stable target specimen ID and whole or page scope. */
    private fun requirements(volume: VolumeSnapshot, issues: IssueSelection): Set<RequiredUnit> =
        buildSet {
            volume.specimens.forEach { specimen ->
                if (hasWholeRequirement(specimen, issues)) {
                    add(RequiredUnit(specimen.id))
                }
                requiredPages(specimen, issues).forEach { page ->
                    add(RequiredUnit(specimen.id, page))
                }
            }
        }

    /** Determines whether selected issue categories require replacing an entire specimen. */
    private fun hasWholeRequirement(specimen: SpecimenSnapshot, issues: IssueSelection): Boolean =
        (issues.missingSpecimen && specimen.numMissing) ||
            (issues.missingPages &&
                MISSING_PAGES.code in specimen.damageTypes &&
                normalizePages(specimen.missingPages, specimen.pagesCount).values.isEmpty()) ||
            (issues.damagedPages &&
                DAMAGED_DOCUMENT.code in specimen.damageTypes &&
                normalizePages(specimen.damagedPages, specimen.pagesCount).values.isEmpty()) ||
            (issues.illegiblyBound && ILLEGIBLE_BINDING.code in specimen.damageTypes) ||
            (issues.censored && specimen.damageTypes.any(CENSORSHIP_TYPES::contains)) ||
            (issues.degradation && DEGRADATION.code in specimen.damageTypes)

    /**
     * Returns distinct positive page numbers requiring replacement under the selected issue
     * categories.
     */
    private fun requiredPages(specimen: SpecimenSnapshot, issues: IssueSelection): Set<Int> =
        buildSet {
            if (issues.missingPages) {
                addAll(normalizePages(specimen.missingPages, specimen.pagesCount).values)
            }
            if (issues.damagedPages) {
                addAll(normalizePages(specimen.damagedPages, specimen.pagesCount).values)
            }
        }

    /** Checks inclusive overlap of the required stored date boundaries. */
    private fun overlaps(primary: VolumeSnapshot, candidate: VolumeSnapshot): Boolean =
        candidate.dateFrom <= primary.dateTo && candidate.dateTo >= primary.dateFrom
}

private data class AppliedProjection(
    val snapshot: VolumeSnapshot,
    val plan: ReplacementPlan = ReplacementPlan(),
)

private data class AppliedSpecimen(
    val snapshot: SpecimenSnapshot,
    val pages: List<Int> = emptyList(),
)

private data class RequiredUnit(val specimenId: String, val page: Int? = null)

private val CENSORSHIP_TYPES = setOf(CENSORED.code, CENSORED_COPY.code)
