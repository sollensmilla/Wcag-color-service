/**
 * WCAG Color Service
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

import ColorConverter from './utils/ColorConverter.js'
import WcagCheck from './utils/WcagCheck.js'
import AccessibleVariant from './utils/AccessibleVariant.js'

export class WcagColorService {
  constructor() {
    this.colorConverter = new ColorConverter()
    this.accessibleVariant = new AccessibleVariant(this.colorConverter, this)
  }

  isAccessible(request, candidate) {
    const wcagCheck = new WcagCheck(candidate, request.basecolor, {
      level: request.level,
      isLargeText: request.isLargeText
    })
    return this.passesWcag(wcagCheck)
  }

  generatePalette(request) {
    return this.accessibleVariant.generateAccessiblePalette(request)
  }

  passesWcag(wcagCheck) {
    const ratio = this.#contrastRatio(wcagCheck.foreground, wcagCheck.background)
    if (wcagCheck.isLargeText) return ratio >= 3
    if (wcagCheck.level === 'AAA') return ratio >= 7
    return ratio >= 4.5
  }

  #contrastRatio(foreground, background) {
    const fg = this.colorConverter.hexToRgb(foreground)
    const bg = this.colorConverter.hexToRgb(background)
    const luminanceFg = this.#relativeLuminance(fg)
    const luminanceBg = this.#relativeLuminance(bg)
    const brightest = Math.max(luminanceFg, luminanceBg)
    const darkest = Math.min(luminanceFg, luminanceBg)
    return (brightest + 0.05) / (darkest + 0.05)
  }

  #relativeLuminance({ red, green, blue }) {
    const normalize = [red, green, blue].map(v => v / 255)
    const linearRgb = normalize.map(v =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    )
    return 0.2126 * linearRgb[0] + 0.7152 * linearRgb[1] + 0.0722 * linearRgb[2]
  }
}
