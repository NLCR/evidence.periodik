import { z } from 'zod'
import i18next from '../i18next'
import { AuditableSchema } from './common'

export const MutationSchema = AuditableSchema.extend({
  id: z.string(),
  name: z.object({
    cs: z.string().min(1, i18next.t('schema.cs_name_min_length')),
    sk: z.string().min(1, i18next.t('schema.sk_name_min_length')),
    en: z.string().min(1, i18next.t('schema.en_name_min_length')),
  }),
})

export const EditableMutationSchema = MutationSchema.partial({ id: true })

export type TMutation = z.infer<typeof MutationSchema>
export type TEditableMutation = z.infer<typeof EditableMutationSchema>
