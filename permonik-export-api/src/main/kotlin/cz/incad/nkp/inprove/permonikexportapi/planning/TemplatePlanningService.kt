package cz.incad.nkp.inprove.permonikexportapi.planning

fun interface TemplatePlanningService {
    /** Returns volumes grouped by year and library for the requested planning filters. */
    fun plan(query: TemplatePlanningQuery): TemplatePlanning
}
