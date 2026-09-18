package cz.incad.nkp.inprove.permonikexportapi.template

/** Validates template structure and state without owning persistence or source selection. */
object TemplateRules {
    /** Rejects stale or omitted versions before applying any changes. */
    fun checkVersion(current: Long?, submitted: Long?) {
        if (submitted == null || current != submitted) {
            throw VersionConflictException()
        }
    }

    /** Keeps finalized templates immutable outside their explicit reopening transition. */
    fun checkEditable(state: TemplateState) {
        if (state == TemplateState.FINALIZED) {
            throw StateConflictException(state, state)
        }
    }

    /** Checks exactly the state transitions allowed by the export contract. */
    fun checkTransition(current: TemplateState, target: TemplateState) {
        val allowed =
            when (current) {
                TemplateState.CREATED ->
                    target == TemplateState.WAITING_FOR_RESCAN || target == TemplateState.FINALIZED
                TemplateState.WAITING_FOR_RESCAN,
                TemplateState.LATE_FIXES -> target == TemplateState.FINALIZED
                TemplateState.FINALIZED -> target == TemplateState.LATE_FIXES
            }
        if (!allowed) {
            throw StateConflictException(current, target)
        }
    }

    /**
     * Applies complete editable item lists while retaining stored specimen identity, flags and
     * ordering.
     */
    fun applyItems(current: List<TemplateItem>, submitted: List<TemplateItem>): List<TemplateItem> {
        val byId = submitted.associateBy { it.specimen.id }
        if (
            byId.size != submitted.size ||
                byId.keys != current.mapTo(mutableSetOf()) { it.specimen.id }
        ) {
            throw InvalidTemplateException("items must contain every specimen exactly once")
        }
        return current.map { item ->
            byId.getValue(item.specimen.id).copy(specimen = item.specimen).withoutVisibility()
        }
    }

    /**
     * Merges regenerated assignments while preserving every decision explicitly locked by the
     * operator.
     */
    fun mergeLockedItems(
        current: List<TemplateItem>,
        generated: List<TemplateItem>,
    ): List<TemplateItem> {
        val currentById = current.associateBy { it.specimen.id }
        if (
            currentById.size != current.size ||
                currentById.keys != generated.mapTo(mutableSetOf()) { it.specimen.id }
        ) {
            throw InvalidTemplateException(
                "Generated items must contain every stored specimen exactly once"
            )
        }
        return generated.map { item ->
            val previous = currentById.getValue(item.specimen.id)
            val lockedReplacements = previous.pageReplacements.filter { it.locked }
            val lockedPages = lockedReplacements.flatMapTo(mutableSetOf()) { it.pages }
            val generatedReplacements =
                item.pageReplacements.mapNotNull { replacement ->
                    replacement
                        .copy(pages = replacement.pages.filterNot(lockedPages::contains))
                        .takeIf { it.pages.isNotEmpty() }
                }
            item.copy(
                mainScan =
                    if (previous.mainScan.locked) {
                        previous.mainScan
                    } else {
                        item.mainScan
                    },
                pageReplacements = lockedReplacements + generatedReplacements,
                note = previous.note,
            )
        }
    }

    /** Enforces source constraints that cannot be disabled by template settings. */
    fun validateParameters(parameters: ReplacementSourcesParameters) {
        if (!parameters.metatitle || !parameters.timeOverlap) {
            throw InvalidTemplateException("metatitle and timeOverlap must be true")
        }
    }

    /**
     * Checks structural invariants independently of generation, storage or target-state resolution.
     */
    fun validate(parameters: ReplacementSourcesParameters, items: List<TemplateItem>) {
        validateParameters(parameters)
        items.forEachIndexed { index, item ->
            if (item.specimen.numExists == item.specimen.numMissing) {
                throw InvalidTemplateException(
                    "items[$index].specimen numExists and numMissing must differ"
                )
            }
            val pages = mutableSetOf<Int>()
            item.pageReplacements.forEachIndexed { replacementIndex, replacement ->
                if (
                    replacement.pages.isEmpty() ||
                        replacement.pages.any { it <= 0 } ||
                        replacement.pages != replacement.pages.distinct().sorted()
                ) {
                    throw InvalidTemplateException(
                        "items[$index].pageReplacements[$replacementIndex].pages is invalid"
                    )
                }
                if (replacement.pages.any { !pages.add(it) }) {
                    throw InvalidTemplateException("A page can be replaced only once per specimen")
                }
                validateAssignedSource(replacement.status, replacement.volume)
            }
            (item.mainScan as? ReplacementMainScan)?.replacement?.let {
                if (it.pages.isNotEmpty()) {
                    throw InvalidTemplateException("Main replacement pages must be empty")
                }
                validateAssignedSource(it.status, it.volume)
            }
        }
    }

    /**
     * Reports unresolved assignments using stable frontend paths before closing or finalizing a
     * template.
     */
    fun validateTargetState(items: List<TemplateItem>, target: TemplateState) {
        if (target != TemplateState.WAITING_FOR_RESCAN && target != TemplateState.FINALIZED) {
            return
        }
        val violations = buildList {
            items.forEachIndexed { index, item ->
                val main = (item.mainScan as? ReplacementMainScan)?.replacement
                if (main != null) {
                    violation(
                            "items[$index].mainScan.replacement",
                            main.status,
                            main.volume,
                            target,
                        )
                        ?.let(::add)
                }
                item.pageReplacements.forEachIndexed { replacementIndex, replacement ->
                    violation(
                            "items[$index].pageReplacements[$replacementIndex]",
                            replacement.status,
                            replacement.volume,
                            target,
                        )
                        ?.let(::add)
                }
            }
        }
        if (violations.isNotEmpty()) {
            throw TemplateValidationException(violations)
        }
    }

    /** Distinguishes invalid target statuses from assignments missing their required source. */
    private fun violation(
        path: String,
        status: ReplacementStatus,
        source: ReplacementSource,
        target: TemplateState,
    ): TemplateViolation? =
        when {
            status == ReplacementStatus.UNRESOLVED ||
                (status == ReplacementStatus.WAITING_FOR_RESCAN &&
                    target == TemplateState.FINALIZED) ->
                TemplateViolation(path, "INVALID_REPLACEMENT_STATUS")
            status == ReplacementStatus.ASSIGNED && !source.hasIdentity() ->
                TemplateViolation(path, "REPLACEMENT_SOURCE_REQUIRED")
            else -> null
        }

    /** Requires internal identity or nonblank manual metadata for an assigned replacement. */
    private fun validateAssignedSource(status: ReplacementStatus, source: ReplacementSource) {
        if (status == ReplacementStatus.ASSIGNED && !source.hasIdentity()) {
            throw InvalidTemplateException("ASSIGNED replacement requires a source")
        }
    }
}

/** Reports whether a source identifies an internal volume or a manual external source. */
internal fun ReplacementSource.hasIdentity() =
    !volumeId.isNullOrBlank() ||
        listOf(barcode, signature, owner, mutation, mutationEdition).any { !it.isNullOrBlank() }

/** Discards frontend-only preview state while retaining editable assignment values. */
internal fun TemplateItem.withoutVisibility() =
    copy(
        mainScan =
            when (mainScan) {
                is PrimaryMainScan -> mainScan.copy(visible = false)
                is ReplacementMainScan -> mainScan.copy(visible = false)
            },
        pageReplacements = pageReplacements.map { it.copy(visible = false) },
    )

/** Locks main and page assignments on successful finalization. */
internal fun TemplateItem.locked() =
    copy(
        mainScan =
            when (mainScan) {
                is PrimaryMainScan -> mainScan.copy(locked = true, visible = false)
                is ReplacementMainScan -> mainScan.copy(locked = true, visible = false)
            },
        pageReplacements = pageReplacements.map { it.copy(locked = true, visible = false) },
    )
