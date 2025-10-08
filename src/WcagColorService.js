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
import AccessibleVariant from './utils/AccessibleVariant.js'

export class WcagColorService {
  constructor() {
    this.colorConverter = new ColorConverter()
    this.accessibleVariant = new AccessibleVariant(this.passesWcag.bind(this))
  }

  passesWcag(wcagCheck) {
    const ratio = this.#contrastRatio(wcagCheck.foreground, wcagCheck.background)
    if (wcagCheck.isLargeText) return ratio >= 3
    if (wcagCheck.level === 'AAA') return ratio >= 7
    return ratio >= 4.5
  }

  generatePalette(request) {
    const lighterRequest = this.accessibleVariant.createVariantRequest(request, 'lighter')
    const darkerRequest = this.accessibleVariant.createVariantRequest(request, 'darker')

    return {
      base: request.basecolor,
      lighter: this.accessibleVariant.getVariantOrFallback(lighterRequest, 'No accessible lighter variant found'),
      darker: this.accessibleVariant.getVariantOrFallback(darkerRequest, 'No accessible darker variant found')
    }
  }

  #contrastRatio(foreground, background) {
    const fg = this.colorConverter.hexToRgb(foreground)
    const bg = this.colorConverter.hexToRgb(background)

    const luminanceForeground = this.#relativeLuminance(fg)
    const luminanceBackground = this.#relativeLuminance(bg)

    const brightest = Math.max(luminanceForeground, luminanceBackground)
    const darkest = Math.min(luminanceForeground, luminanceBackground)
    return (brightest + 0.05) / (darkest + 0.05)
  }

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
}