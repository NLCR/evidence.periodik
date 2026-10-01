package cz.incad.nkp.inprove.permonikexportapi.template.persistence

import cz.incad.nkp.inprove.permonikexportapi.template.ReplacementSource
import cz.incad.nkp.inprove.permonikexportapi.template.ReplacementSourcesParameters
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateIssues
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateItem
import cz.incad.nkp.inprove.permonikexportapi.template.TemplateState
import cz.incad.nkp.inprove.permonikexportapi.template.Volume
import java.time.Instant
import java.util.UUID
import org.springframework.data.annotation.CreatedBy
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedBy
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.annotation.Version
import org.springframework.data.relational.core.mapping.Table

/**
 * Persistence aggregate; identity, concurrency and audit live outside the versioned JSON content.
 */
@Table("export_template")
data class StoredTemplate(
    @Id val id: UUID,
    val primaryVolumeId: String,
    val ownerId: String,
    @Version val version: Long? = null,
    val state: TemplateState,
    val content: TemplateContent,
    @CreatedDate val createdDate: Instant? = null,
    @CreatedBy val createdBy: String? = null,
    @LastModifiedDate val modifiedDate: Instant? = null,
    @LastModifiedBy val modifiedBy: String? = null,
    val deletedDate: Instant? = null,
    val deletedBy: String? = null,
)

/**
 * Captures displayed source data and editable decisions plus the inputs needed for later
 * regeneration.
 */
data class TemplateContent(
    val primaryVolume: Volume,
    val primaryOwnerSigla: String,
    val replacementSourcesParameters: ReplacementSourcesParameters,
    val primaryVolumeFillIndex: Int,
    val combinedFillIndex: Int,
    val items: List<TemplateItem>,
    val issues: TemplateIssues,
    val replacementSources: List<ReplacementSource>,
)
