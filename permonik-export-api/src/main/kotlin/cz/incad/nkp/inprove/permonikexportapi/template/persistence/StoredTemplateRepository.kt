package cz.incad.nkp.inprove.permonikexportapi.template.persistence

import java.util.UUID
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository

interface StoredTemplateRepository : CrudRepository<StoredTemplate, UUID> {
    /** Returns only the active template; historical soft-deleted records remain stored but are not selected. */
    @Query("SELECT * FROM export_template WHERE primary_volume_id = :volumeId AND deleted_date IS NULL")
    fun findActiveByVolumeId(volumeId: String): StoredTemplate?
}
