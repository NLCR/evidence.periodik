package cz.incad.nkp.inprove.permonikexportapi.planning

import cz.incad.nkp.inprove.permonikexportapi.core.CoreVolumeClient
import cz.incad.nkp.inprove.permonikexportapi.core.VolumeCalculationService
import java.time.ZoneOffset
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
    /** Lists each volume in every selected year its stored date range overlaps. */
    override fun plan(query: TemplatePlanningQuery): TemplatePlanning {
        val metadata = core.queryPlanningVolumes(query)
        val contents =
            metadata
                .map(CoreVolumeClient.PlanningVolumeMetadata::id)
                .chunked(20)
                .flatMap(core::batchGetVolumeContents)
                .associateBy { it.id }
        val volumesByYear =
            sortedMapOf<
                Int,
                MutableMap<Pair<String, String>, MutableList<TemplatePlanningVolume>>,
            >()
        val orderedVolumes =
            metadata.sortedWith(
                compareBy<CoreVolumeClient.PlanningVolumeMetadata> {
                        contents.getValue(it.id).dateFrom
                    }
                    .thenBy { it.id }
            )
        for (row in orderedVolumes) {
            val volume = contents.getValue(row.id)
            val from = volume.dateFrom.atZone(ZoneOffset.UTC)
            val to = volume.dateTo.atZone(ZoneOffset.UTC)
            val firstYear = maxOf(from.year, query.yearFrom)
            val lastYear = minOf(to.year, query.yearTo)
            if (firstYear > lastYear) continue

            val fillIndex = calculations.calculateOwnFillIndex(volume)
            val pagesCount =
                volume.specimens.sumOf {
                    if (it.numExists) it.pagesCount.toLong() else 0L
                }
            val library = row.ownerId to row.ownerShorthand
            for (year in firstYear..lastYear) {
                val volumes =
                    volumesByYear
                        .getOrPut(year) { linkedMapOf() }
                        .getOrPut(library) { mutableListOf() }
                volumes +=
                    TemplatePlanningVolume(
                        id = row.id,
                        barCode = row.barCode,
                        fillIndex = fillIndex,
                        monthFrom = if (year == from.year) from.monthValue else 1,
                        monthTo = if (year == to.year) to.monthValue else 12,
                        pagesCount = pagesCount,
                        continuesFromPreviousYear = from.year < year,
                        continuesIntoNextYear = to.year > year,
                    )
            }
        }
        return volumesByYear.map { (year, libraries) ->
            TemplatePlanningYear(
                year = year.toString(),
                libraries =
                    libraries.map { (library, volumes) ->
                        val (ownerId, shorthand) = library
                        TemplatePlanningLibrary(
                            id = ownerId,
                            shorthand = shorthand,
                            volumes = volumes,
                        )
                    },
            )
        }
    }
}
