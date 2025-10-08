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
    for (let factor = 0.1; factor <= 1.0; factor += 0.1) {
      const candidate = request.direction === 'lighter'
        ? this.lightenColor(request.basecolor, factor)
        : this.darkenColor(request.basecolor, factor)

      if (this.isAccessible(request, candidate)) {
        return candidate
      }
    }
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
    const lighterRequest = this.#createVariantRequest(request, 'lighter')
    const darkerRequest = this.#createVariantRequest(request, 'darker')

    return {
      base: request.basecolor,
      lighter: this.#getVariantOrFallback(lighterRequest, 'No accessible lighter variant found'),
      darker: this.#getVariantOrFallback(darkerRequest, 'No accessible darker variant found')
    }
  }
}