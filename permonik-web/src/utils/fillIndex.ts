const SCALE_MIN = 50000
const SCALE_MAX = 100999

const DARK_RED = { r: 139, g: 0, b: 0 }
const ORANGE = { r: 255, g: 165, b: 0 }
const BRIGHT_GREEN = { r: 0, g: 200, b: 83 }

const interpolateChannel = (from: number, to: number, ratio: number) =>
  Math.round(from + (to - from) * ratio)

const toRgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`

export const fillIndexGradient = `linear-gradient(90deg, ${toRgb(
  DARK_RED.r,
  DARK_RED.g,
  DARK_RED.b
)} 0%, ${toRgb(ORANGE.r, ORANGE.g, ORANGE.b)} 50%, ${toRgb(
  BRIGHT_GREEN.r,
  BRIGHT_GREEN.g,
  BRIGHT_GREEN.b
)} 100%)`

export const clampFillIndex = (value: number) =>
  Math.min(SCALE_MAX, Math.max(0, Math.round(value)))

export const getFillIndexColor = (value: number) => {
  const clampedValue = clampFillIndex(value)

  if (clampedValue <= SCALE_MIN) {
    return toRgb(DARK_RED.r, DARK_RED.g, DARK_RED.b)
  }

  if (clampedValue >= SCALE_MAX) {
    return toRgb(BRIGHT_GREEN.r, BRIGHT_GREEN.g, BRIGHT_GREEN.b)
  }

  const midpoint = (SCALE_MIN + SCALE_MAX) / 2

  if (clampedValue <= midpoint) {
    const ratio = (clampedValue - SCALE_MIN) / (midpoint - SCALE_MIN)
    return toRgb(
      interpolateChannel(DARK_RED.r, ORANGE.r, ratio),
      interpolateChannel(DARK_RED.g, ORANGE.g, ratio),
      interpolateChannel(DARK_RED.b, ORANGE.b, ratio)
    )
  }

  const ratio = (clampedValue - midpoint) / (SCALE_MAX - midpoint)
  return toRgb(
    interpolateChannel(ORANGE.r, BRIGHT_GREEN.r, ratio),
    interpolateChannel(ORANGE.g, BRIGHT_GREEN.g, ratio),
    interpolateChannel(ORANGE.b, BRIGHT_GREEN.b, ratio)
  )
}
