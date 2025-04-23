import { z } from 'zod'
import i18next from '../i18next'
import { AuditableSchema } from './common'

export const OwnerSchema = AuditableSchema.extend({
  id: z.string(),
  name: z.string(),
  shorthand: z.string().min(1, i18next.t('schema.name_min_length')),
  sigla: z.string().min(1, i18next.t('schema.sigla_min_length')),
})

export const EditableOwnerSchema = OwnerSchema.partial({ id: true })

export type TOwner = z.infer<typeof OwnerSchema>
export type TEditableOwner = z.infer<typeof EditableOwnerSchema>
