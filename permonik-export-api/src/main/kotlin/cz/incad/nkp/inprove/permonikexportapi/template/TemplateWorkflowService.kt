package cz.incad.nkp.inprove.permonikexportapi.template

import cz.incad.nkp.inprove.permonikexportapi.template.persistence.StoredTemplate
import cz.incad.nkp.inprove.permonikexportapi.template.persistence.StoredTemplateRepository
import java.time.Instant
import org.springframework.dao.OptimisticLockingFailureException
import org.springframework.data.domain.AuditorAware
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Stores editable template decisions and state transitions; export entry points require
 * TEMPLATE_MANAGE globally.
 */
@Service
@Transactional
class TemplateWorkflowService(
    private val templates: StoredTemplateRepository,
    private val auditor: AuditorAware<String>,
) {
    /**
     * Saves editable fields without trusting submitted audit, state, source snapshots or calculated
     * indexes.
     */
    fun save(volumeId: String, submitted: Template): StoredTemplate {
        val current = load(volumeId, submitted.version)
        TemplateRules.checkEditable(current.state)
        val updated = applyChanges(current, submitted)
        TemplateRules.validateTargetState(updated.content.items, updated.state)
        TemplateRules.validate(updated.content.replacementSourcesParameters, updated.content.items)
        return persist(updated)
    }

    /**
     * Applies edits, validates the transition and writes content, locks and state in one versioned
     * transaction.
     */
    fun transition(volumeId: String, transition: TemplateTransition): StoredTemplate {
        val current = load(volumeId, transition.version)
        TemplateRules.checkTransition(current.state, transition.targetState)
        val changed = transition.changes?.let { applyChanges(current, it) } ?: current
        TemplateRules.validateTargetState(changed.content.items, transition.targetState)
        TemplateRules.validate(changed.content.replacementSourcesParameters, changed.content.items)
        return persist(
            changed.copy(
                state = transition.targetState,
                content =
                    if (transition.targetState == TemplateState.FINALIZED) {
                        changed.content.copy(
                            items = changed.content.items.map(TemplateItem::locked)
                        )
                    } else changed.content,
            )
        )
    }

    /**
     * Soft-deletes the active template and records the authenticated user as the deletion actor.
     */
    fun delete(volumeId: String) {
        val current =
            templates.findActiveByVolumeId(volumeId) ?: throw TemplateNotFoundException(volumeId)
        val deletedBy =
            auditor.currentAuditor.orElseThrow {
                InvalidTemplateException("Template deletion requires an authenticated user")
            }
        persist(current.copy(deletedDate = Instant.now(), deletedBy = deletedBy))
    }

    /** Loads only active templates and rejects stale client revisions before mutation. */
    private fun load(volumeId: String, version: Long?): StoredTemplate {
        val current =
            templates.findActiveByVolumeId(volumeId) ?: throw TemplateNotFoundException(volumeId)
        TemplateRules.checkVersion(current.version, version)
        return current
    }

    /**
     * Keeps server-owned identity and generation inputs while merging editable settings and
     * complete item lists.
     */
    private fun applyChanges(current: StoredTemplate, submitted: Template): StoredTemplate {
        if (submitted.primaryVolume.id != current.primaryVolumeId) {
            throw InvalidTemplateException("primaryVolume is server-owned")
        }
        return current.copy(
            content =
                current.content.copy(
                    replacementSourcesParameters = submitted.replacementSourcesParameters,
                    items = TemplateRules.applyItems(current.content.items, submitted.items),
                )
        )
    }

    /**
     * Translates the database's final optimistic-lock check, including races after the initial
     * read.
     */
    private fun persist(template: StoredTemplate): StoredTemplate =
        try {
            templates.save(template)
        } catch (_: OptimisticLockingFailureException) {
            throw VersionConflictException()
        }
}
