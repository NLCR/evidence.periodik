package cz.incad.nkp.inprove.permonikexportapi.template

interface TemplateService {
    /** Returns the active template belonging to the requested primary volume. */
    fun get(volumeId: String): Template

    /** Creates a template or regenerates its unlocked assignments from the supplied settings. */
    fun generate(volumeId: String, settings: ScanTemplateSettings): Template

    /** Stores the editable part of a template while preserving server-owned fields. */
    fun save(volumeId: String, submitted: Template): Template

    /** Refreshes unlocked assignments using the settings from the latest generation. */
    fun synchronize(volumeId: String, version: Long): Template

    /** Atomically applies optional edits and moves a template to the requested state. */
    fun transition(volumeId: String, transition: TemplateTransition): Template

    /** Soft-deletes the active template for a primary volume. */
    fun delete(volumeId: String)

    /** Finds ordered replacement volume candidates for the unresolved template issues. */
    fun replacementCandidates(
        volumeId: String,
        query: ReplacementCandidateQuery,
    ): List<ReplacementSource>

    /** Calculates the combined fill index for the selected replacement volumes. */
    fun fillIndex(volumeId: String, query: FillIndexQuery): Int
}
