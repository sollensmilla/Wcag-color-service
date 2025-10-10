/**
 * WCAG Color Service
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */
import ColorConverter from './utils/ColorConverter.js'
import WcagCheck from './utils/WcagCheck.js'
import ColorVariantRequest from './utils/ColorVariantRequest.js'
import NoAccessibleColorError from './errors/NoAccessibleColorError.js'

export class WcagColorService {
  constructor() {
    this.colorConverter = new ColorConverter()
  }

  lightenColor(hexColor, factor = 0.2) {
    const hslColor = this.colorConverter.hexToHsl(hexColor)
    hslColor.lightness = Math.min(1, hslColor.lightness + factor)
    return this.colorConverter.hslToHex(hslColor)
  }

  darkenColor(hexColor, factor = 0.2) {
    const hslColor = this.colorConverter.hexToHsl(hexColor)
    hslColor.lightness = Math.max(0, hslColor.lightness - factor)
    return this.colorConverter.hslToHex(hslColor)
  }

  /**
   * Calculates relative luminance according to WCAG.
   */
  #relativeLuminance({ red, green, blue }) {
    const normalize = [red, green, blue].map(value => value / 255)
    const linearRgb = normalize.map(value =>
      value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
    )
    return (
      0.2126 * linearRgb[0] +
      0.7152 * linearRgb[1] +
      0.0722 * linearRgb[2]
    )
  }

  /**
   * Calculates the contrast ratio between two colors.
   */
  contrastRatio(foreground, background) {
    const fg = this.colorConverter.hexToRgb(foreground)
    const bg = this.colorConverter.hexToRgb(background)

    const luminanceForeground = this.#relativeLuminance(fg)
    const luminanceBackground = this.#relativeLuminance(bg)

    const brightest = Math.max(luminanceForeground, luminanceBackground)
    const darkest = Math.min(luminanceForeground, luminanceBackground)
    return (brightest + 0.05) / (darkest + 0.05)
  }

  passesWcag(wcagCheck) {
    const ratio = this.contrastRatio(wcagCheck.foreground, wcagCheck.background)
    if (wcagCheck.isLargeText) return ratio >= 3
    if (wcagCheck.level === 'AAA') return ratio >= 7
    return ratio >= 4.5
  }

  isAccessible(request, candidate) {
    const wcagCheck = new WcagCheck(
      candidate,
      request.basecolor,
      { level: request.level, isLargeText: request.isLargeText }
    )
    return this.passesWcag(wcagCheck)
  }

findAccessibleVariant(request) {
  for (let factor = 0.05; factor <= 0.95; factor += 0.05) {
    const candidate = request.direction === 'lighten'
      ? this.lightenColor(request.basecolor, factor)
      : this.darkenColor(request.basecolor, factor)

    if (this.isAccessible(request, candidate)) {
      return candidate
    }
  }

  const fallback = request.direction === 'lighten' ? '#ffffff' : '#000000'
  if (this.isAccessible(request, fallback)) return fallback

  throw new NoAccessibleColorError(request.basecolor, request.direction)
}



  #createVariantRequest(request, direction) {
    return new ColorVariantRequest(request.basecolor)
      .withLevel(request.level)
      .withLargeText(request.isLargeText)
      .withDirection(direction)
  }

  #getVariantOrFallback(request, fallbackMessage) {
    try {
      return this.findAccessibleVariant(request)
    } catch (error) {
      console.error(error.message)
      return fallbackMessage
    }
  }

generatePalette(request) {
  const lighter = this.#tryFindVariant(request, 'lighten')
  const darker = this.#tryFindVariant(request, 'darken')

  if (lighter && darker) return this.#paletteNormal(request, lighter, darker)
  if (darker) return this.#paletteSingleType(request, 'darken', darker)
  if (lighter) return this.#paletteSingleType(request, 'lighten', lighter)

  return this.#findAccessibleFallback(request)
}

#tryFindVariant(request, direction) {
  try {
    const variantRequest = this.#createVariantRequest(request, direction)
    return this.findAccessibleVariant(variantRequest)
  } catch {
    return null
  }
}

#paletteNormal(request, lighter, darker) {
  return {
    base: request.basecolor,
    lighter,
    darker
  }
}

#paletteSingleType(request, type, firstVariant) {
  const secondVariant = this.#tryFindSecondVariant(request, type, firstVariant)
  const key1 = type === 'lighten' ? 'lighter1' : 'darker1'
  const key2 = type === 'lighten' ? 'lighter2' : 'darker2'

  return {
    base: request.basecolor,
    [key1]: firstVariant,
    [key2]: secondVariant
  }
}

#tryFindSecondVariant(request, direction, firstVariant) {
  try {
    const variantRequest = this.#createVariantRequest(request, direction)
    const candidate = this.findAccessibleVariant({ ...variantRequest, factorStart: 0.5 })

    if (candidate.toLowerCase() === firstVariant.toLowerCase()) {
      return this.#shiftVariant(firstVariant, direction)
    }

    return candidate
  } catch {
    return this.#shiftVariant(firstVariant, direction)
  }
}

#shiftVariant(hexColor, direction) {
  const step = 0.1
  return direction === 'lighten'
    ? this.lightenColor(hexColor, step)
    : this.darkenColor(hexColor, step)
}

#findAccessibleFallback(request) {
  const white = '#ffffff'
  const black = '#000000'

  const whitePasses = this.#isFallbackAccessible(request, white)
  const blackPasses = this.#isFallbackAccessible(request, black)

  if (whitePasses && blackPasses)
    return { base: request.basecolor, lighter: white, darker: black }
  if (whitePasses)
    return { base: request.basecolor, lighter: white, darker: 'No accessible darker variant found' }
  if (blackPasses)
    return { base: request.basecolor, lighter: 'No accessible lighter variant found', darker: black }

  return {
    base: request.basecolor,
    lighter: 'No accessible lighter variant found',
    darker: 'No accessible darker variant found'
  }
}

#isFallbackAccessible(request, candidate) {
  const check = new WcagCheck(candidate, request.basecolor, {
    level: request.level,
    isLargeText: request.isLargeText
  })
  return this.passesWcag(check)
}
}