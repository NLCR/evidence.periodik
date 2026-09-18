package cz.incad.nkp.inprove.permonikexportapi.planning

import cz.incad.nkp.inprove.permonikexportapi.core.CoreVolumeClient
import cz.incad.nkp.inprove.permonikexportapi.core.VolumeCalculationService
import org.springframework.context.annotation.Primary
import org.springframework.stereotype.Service

/**
 * Loads planning volumes from core, calculates individual indexes and groups the result by year and
 * owner.
 */
@Primary
@Service
class StoredTemplatePlanningService(
    private val core: CoreVolumeClient,
    private val calculations: VolumeCalculationService,
) : TemplatePlanningService {
    /** Returns a deterministic planning response without summing fill indexes across volumes. */
    override fun plan(query: TemplatePlanningQuery): TemplatePlanning {
        val metadata = core.queryPlanningVolumes(query)
        val contents =
            metadata
                .map(CoreVolumeClient.PlanningVolumeMetadata::id)
                .chunked(20)
                .flatMap(core::batchGetVolumeContents)
                .associateBy { it.id }
        val grouped = metadata.groupBy { it.year to (it.ownerId to it.ownerShorthand) }
        return grouped.entries
            .groupBy({ it.key.first }, { it.key.second to it.value })
            .toSortedMap()
            .map { (year, libraries) ->
                TemplatePlanningYear(
                    year = year.toString(),
                    libraries =
                        libraries
                            .sortedBy { it.first.first }
                            .map { libraryRows ->
                                val (library, rows) = libraryRows
                                TemplatePlanningLibrary(
                                    id = library.first,
                                    shorthand = library.second,
                                    volumes =
                                        rows
                                            .sortedBy { it.id }
                                            .map { row ->
                                                val volume = contents.getValue(row.id)
                                                TemplatePlanningVolume(
                                                    id = row.id,
                                                    barCode = row.barCode,
                                                    fillIndex =
                                                        calculations.calculateOwnFillIndex(volume),
                                                )
                                            },
                                )
                            },
                )
            }
    }
}
