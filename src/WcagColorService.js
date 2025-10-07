import ColorConverter from './utils/ColorConverter.js'
import AccessibleColorFinder from './utils/AccessibleColorFinder.js'
import ColorVariantRequest from './utils/ColorVariantRequest.js'


export class WcagColorService {
  constructor() {
    this.colorConverter = new ColorConverter()

    this.wcagUtils = {
      contrastRatio: this.contrastRatio.bind(this),
      passesWcag: this.passesWcag.bind(this)
    }

    this.finder = new AccessibleColorFinder(this.colorConverter, this.wcagUtils)

}

contrastRatio(foreground, background) {
  const fg = this.colorConverter.hexToRgb(foreground)
  const bg = this.colorConverter.hexToRgb(background)
  const luminanceFg = this.#relativeLuminance(fg)
  const luminanceBg = this.#relativeLuminance(bg)
  const brightest = Math.max(luminanceFg, luminanceBg)
  const darkest = Math.min(luminanceFg, luminanceBg)
  return (brightest + 0.05) / (darkest + 0.05)
}

passesWcag(wcagCheck) {
  const ratio = this.contrastRatio(wcagCheck.foreground, wcagCheck.background)
  if (wcagCheck.isLargeText) return ratio >= 3
  if (wcagCheck.level === 'AAA') return ratio >= 7
  return ratio >= 4.5
}

generatePalette(request) {
  const lighterRequest = this.#createVariantRequest(request, 'lighten')
  const darkerRequest = this.#createVariantRequest(request, 'darken')

  return {
    base: request.basecolor,
    lighter: this.#getVariantOrFallback(lighterRequest, 'No accessible lighter variant found'),
    darker: this.#getVariantOrFallback(darkerRequest, 'No accessible darker variant found')
  }
}

#getVariantOrFallback(request, fallbackMessage) {
  try {
    return this.finder.findAccessibleVariant(request)
  } catch (error) {
    console.error(error.message)
    return fallbackMessage
  }
}

#createVariantRequest(request, direction) {
  return new ColorVariantRequest(request.basecolor)
    .withLevel(request.level)
    .withLargeText(request.isLargeText)
    .withDirection(direction)
}

#relativeLuminance({ red, green, blue }) {
  const normalize = [red, green, blue].map(v => v / 255)
  const linearRgb = normalize.map(v =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  )
  return 0.2126 * linearRgb[0] + 0.7152 * linearRgb[1] + 0.0722 * linearRgb[2]
}
}
