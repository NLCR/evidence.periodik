package cz.incad.nkp.inprove.permonikexportapi.template

import cz.incad.nkp.inprove.permonikexportapi.calculation.CombinedVolume
import cz.incad.nkp.inprove.permonikexportapi.calculation.ReplacementDecision
import cz.incad.nkp.inprove.permonikexportapi.calculation.ReplacementPlanItem
import cz.incad.nkp.inprove.permonikexportapi.calculation.UnresolvedReplacement
import cz.incad.nkp.inprove.permonikexportapi.core.StoredMutationMark
import cz.incad.nkp.inprove.permonikexportapi.core.StoredPeriodicityItem
import cz.incad.nkp.inprove.permonikexportapi.core.StoredSpecimenSnapshot
import cz.incad.nkp.inprove.permonikexportapi.core.StoredVolumeSnapshot
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.TemplateContent
import org.springframework.stereotype.Component

/** Builds persisted template content from stored source snapshots and one calculation result. */
@Component
class TemplateGenerator {
    /**
     * Creates server-owned template content without inventing missing specimens or source metadata.
     */
    fun generate(
        primary: StoredVolumeSnapshot,
        sources: List<StoredVolumeSnapshot>,
        calculation: CombinedVolume,
        settings: ScanTemplateSettings,
    ): TemplateContent {
        val sourceById = sources.associateBy(StoredVolumeSnapshot::id)
        val selectedSources =
            settings.replacementSources
                .sortedBy { it.priority ?: Int.MAX_VALUE }
                .map { source ->
                    sourceById[source.volumeId]?.let {
                        source.withStoredMetadata(
                            it,
                            calculation.replacementPlan.dependentFillIndexes[it.id],
                        )
                    } ?: source
                }
        val replacementSourceById =
            selectedSources
                .mapNotNull { source ->
                    source.volumeId?.let { it to source }
                }
                .toMap()
        val plans =
            calculation.replacementPlan.items.associateBy(ReplacementPlanItem::targetSpecimenId)
        val unresolved =
            calculation.replacementPlan.unresolved.groupBy(UnresolvedReplacement::targetSpecimenId)

        return TemplateContent(
            primaryVolume = primary.toTemplateVolume(),
            primaryOwnerSigla = primary.owner.sigla,
            replacementSourcesParameters = settings.replacementSourcesParameters,
            primaryVolumeFillIndex = calculation.primaryFillIndex.value,
            combinedFillIndex = calculation.fillIndex.value,
            issues = settings.issues,
            replacementSources = selectedSources,
            items =
                primary.specimens
                    .filter { it.numExists || it.numMissing }
                    .sortedWith(compareSpecimenOrder)
                    .map {
                        it.toTemplateItem(
                            plans[it.id],
                            unresolved[it.id].orEmpty(),
                            replacementSourceById,
                        )
                    },
        )
    }

    /**
     * Converts one stored specimen and its calculated decisions into the frontend template item.
     */
    private fun StoredSpecimenSnapshot.toTemplateItem(
        plan: ReplacementPlanItem?,
        unresolved: List<UnresolvedReplacement>,
        sourceById: Map<String, ReplacementSource>,
    ): TemplateItem {
        val unresolvedWhole = unresolved.any { it.page == null }
        val mainReplacement =
            plan?.mainReplacement?.toMainReplacement(sourceById)
                ?: if (unresolvedWhole) {
                    MainReplacement(ReplacementSource(), emptyList(), ReplacementStatus.UNRESOLVED)
                } else {
                    null
                }
        val pageReplacements =
            buildList<Replacement> {
                plan?.pageReplacements?.forEach { add(it.toPageReplacement(sourceById)) }
                unresolved
                    .filter { it.page != null }
                    .mapNotNullTo(this) {
                        it.page?.let { page ->
                            Replacement(
                                ReplacementSource(),
                                listOf(page),
                                ReplacementStatus.UNRESOLVED,
                                locked = false,
                                visible = false,
                            )
                        }
                    }
            }.sortedWith(compareReplacementOrder)

        return TemplateItem(
            specimen = toTemplateSpecimen(),
            mainScan =
                mainReplacement?.let {
                    ReplacementMainScan(locked = false, visible = false, replacement = it)
                } ?: PrimaryMainScan(locked = false, visible = false),
            pageReplacements = pageReplacements,
        )
    }

    /** Converts a calculated whole-specimen decision to the frontend replacement representation. */
    private fun ReplacementDecision.toMainReplacement(
        sourceById: Map<String, ReplacementSource>
    ): MainReplacement =
        MainReplacement(
            sourceById.getValue(sourceVolumeId),
            emptyList(),
            ReplacementStatus.ASSIGNED,
        )

    /** Converts a calculated page decision to the frontend replacement representation. */
    private fun ReplacementDecision.toPageReplacement(
        sourceById: Map<String, ReplacementSource>
    ): Replacement =
        Replacement(
            volume = sourceById.getValue(sourceVolumeId),
            pages = pages,
            status = ReplacementStatus.ASSIGNED,
            locked = false,
            visible = false,
        )

    /**
     * Uses source metadata from core while retaining the selected source priority and dependent
     * index.
     */
    private fun ReplacementSource.withStoredMetadata(
        source: StoredVolumeSnapshot,
        dependentFillIndex: Int?,
    ): ReplacementSource =
        copy(
            signature = source.signature,
            owner = source.owner.sigla,
            barcode = source.barcode,
            mutation = source.mutationName.cs,
            mutationEdition = source.mutationMark.mark,
            dependentFillIndex = dependentFillIndex,
        )

    /** Converts stored source volume metadata to the direct frontend volume model. */
    private fun StoredVolumeSnapshot.toTemplateVolume() =
        Volume(
            id = id,
            barCode = barcode,
            dateFrom = dateFrom.toString(),
            dateTo = dateTo.toString(),
            metaTitleId = metaTitleId,
            metaTitleName = metaTitleName,
            subName = subName,
            mutationId = mutationId,
            mutationName = mutationName.cs,
            periodicity = periodicity.map { it.toTemplatePeriodicity() },
            firstNumber = firstNumber,
            lastNumber = lastNumber,
            note = note,
            attachmentsSort = VolumeAttachmentsSort.valueOf(attachmentsSort),
            signature = signature,
            ownerId = owner.id,
            ownerName = owner.name,
            year = year,
            mutationMark = mutationMark.toTemplateMark(),
            created = created.toString(),
            createdBy = createdBy,
            updated = updated?.toString(),
            updatedBy = updatedBy,
        )

    /** Converts one stored periodicity item without changing false, zero, or empty values. */
    private fun StoredPeriodicityItem.toTemplatePeriodicity() =
        VolumePeriodicity(
            numExists = numExists,
            isAttachment = isAttachment,
            editionId = editionId,
            day = VolumePeriodicityDay.fromValue(day),
            pagesCount = pagesCount,
            name = name,
            subName = subName,
        )

    /** Converts a stored mutation mark while preserving its explicit type and optional text. */
    private fun StoredMutationMark.toTemplateMark() =
        MutationMark(
            mark = mark,
            type = MutationMarkType.valueOf(type),
            description = description,
        )

    /** Converts stored specimen identity and recorded existence flags for the FE contract. */
    private fun StoredSpecimenSnapshot.toTemplateSpecimen() =
        TemplateSpecimen(
            id = id,
            number = number,
            attachmentNumber = attachmentNumber,
            publicationDate = publicationDate.toString(),
            mutationMark = mutationMark.toTemplateMark(),
            isAttachment = isAttachment,
            numExists = numExists,
            numMissing = numMissing,
        )
}

/** Keeps generated template items in the chronological order used by the export workflow. */
private val compareSpecimenOrder =
    compareBy<StoredSpecimenSnapshot> { it.publicationDate }
        .thenBy { it.isAttachment }
        .thenBy { it.number ?: "" }
        .thenBy { it.attachmentNumber ?: "" }
        .thenBy { it.id }

/** Groups page replacement rows by the configured replacement source priority. */
private val compareReplacementOrder =
    compareBy<Replacement> { it.volume.priority ?: Int.MAX_VALUE }
        .thenBy { it.pages.firstOrNull() ?: Int.MAX_VALUE }
