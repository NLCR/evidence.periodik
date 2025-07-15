import { z } from 'zod'

export const inputDataSchema = z.object({})
export type TInputData = z.infer<typeof inputDataSchema>
