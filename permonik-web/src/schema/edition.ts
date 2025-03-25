import { z } from 'zod'
import i18next from '../i18next'
import { AuditableSchema } from './common'

export const EditionSchema = AuditableSchema.extend({
  id: z.string(),
  name: z.object({
    cs: z.string().min(1, i18next.t('schema.cs_name_min_length')),
    sk: z.string().min(1, i18next.t('schema.sk_name_min_length')),
    en: z.string().min(1, i18next.t('schema.en_name_min_length')),
  }),
  isDefault: z.boolean(),
  isAttachment: z.boolean(),
  isPeriodicAttachment: z.boolean(),
})

export const EditableEditionSchema = EditionSchema.partial({ id: true })

export type TEdition = z.infer<typeof EditionSchema>
export type TEditableEdition = z.infer<typeof EditableEditionSchema>
