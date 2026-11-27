export const parsePages = (value: string): number[] | undefined => {
  const normalized = value.trim()
  if (!normalized) return []

  const pages = normalized.split(/[\s,;]+/).map(Number)
  return pages.every(
    (pageNumber, index) =>
      Number.isInteger(pageNumber) &&
      pageNumber > 0 &&
      (index === 0 || pages[index - 1] < pageNumber)
  )
    ? pages
    : undefined
}

export const formatPages = (pages: number[]): string => pages.join(', ')
