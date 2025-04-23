import { z } from 'zod'

export const AuditableSchema = z
  .object({
    created: z.string().nullable(),
    createdBy: z.string().nullable(),
    updated: z.string().nullable(),
    updatedBy: z.string().nullable(),
    deleted: z.string().nullable(),
    deletedBy: z.string().nullable(),
  })
  .partial()

export type TAuditable = z.infer<typeof AuditableSchema>

export const copyAuditable = <T extends TAuditable>(input: T): TAuditable => {
  return {
    created: input.created,
    createdBy: input.createdBy,
    updated: input.updated,
    updatedBy: input.updatedBy,
    deleted: input.deleted,
    deletedBy: input.deletedBy,
  }
}
