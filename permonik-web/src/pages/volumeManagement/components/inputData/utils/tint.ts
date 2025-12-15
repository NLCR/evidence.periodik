export type InputDataItemTint = 'default' | 'warning' | 'error'

export const mapTintToColor = (tint: InputDataItemTint): string => {
  if (tint === 'error') return '#ffccccff'
  if (tint === 'warning') return '#ffeccfff'
  return 'transparent'
}
