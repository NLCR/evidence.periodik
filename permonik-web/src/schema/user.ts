import { z } from 'zod'
import i18next from '../i18next'

export const EditableUserSchema = z.object({
  id: z.string(),
  email: z.string().email(i18next.t('schema.email')),
  userName: z.string(),
  firstName: z.string().min(1, i18next.t('schema.first_name_min_length')),
  lastName: z.string().min(1, i18next.t('schema.last_name_min_length')),
  role: z.enum(['user', 'admin', 'super_admin']),
  active: z.boolean(),
  owners: z.string().array().nullable(),
})

export const MeSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(i18next.t('schema.email')),
  authorities: z.string().array(),
  owners: z.string().array().nullable(),
  enabled: z.boolean(),
  username: z.string(),
  role: z.enum(['user', 'admin', 'super_admin']),
  accountNonExpired: z.boolean(),
  accountNonLocked: z.boolean(),
  credentialsNonExpired: z.boolean(),
})

export type TUser = z.infer<typeof EditableUserSchema>
export type TMe = z.infer<typeof MeSchema>
