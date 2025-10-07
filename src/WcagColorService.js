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
    const lighter = this.#tryFindVariant(request, 'lighter')
    const darker = this.#tryFindVariant(request, 'darker')

    if (!lighter && darker) return this.#handleMissingLighter(request, darker)
    if (!darker && lighter) return this.#handleMissingDarker(request, lighter)

    return this.#buildStandardPalette(request, lighter, darker)
  }


  #tryFindVariant(request, direction) {
    const variantRequest = this.#createVariantRequest(request, direction)
    try {
      return this.finder.findAccessibleVariant(variantRequest)
    } catch (error) {
      console.warn(`${error.message}`)
      return this.#fallbackToBlackOrWhite(request, direction)
    }
  }


  #handleMissingLighter(request, darker) {
    console.warn('No lighter found — generating two darker variants.')
    const secondDarker = this.#tryFindVariant({ ...request, basecolor: darker }, 'darker')

    return this.#buildPalette({
      base: request.basecolor,
      variants: [darker, secondDarker],
      labels: ['darker', 'darker2']
    })
  }

  #handleMissingDarker(request, lighter) {
    console.warn('No darker found — generating two lighter variants.')
    const secondLighter = this.#tryFindVariant({ ...request, basecolor: lighter }, 'lighter')

    return this.#buildPalette({
      base: request.basecolor,
      variants: [lighter, secondLighter],
      labels: ['lighter', 'lighter2']
    })
  }

  #buildStandardPalette(request, lighter, darker) {
    return this.#buildPalette({
      base: request.basecolor,
      variants: [lighter, darker],
      labels: ['lighter', 'darker']
    })
  }

#buildPalette({ base, variants }) {
  const sorted = this.#sortVariantsByBrightness(base, variants)
  const palette = { base }
  sorted.forEach((v, i) => {
    const label = i > 0 ? v.label + (i + 1) : v.label 
    palette[label] = v.color || `No accessible ${label} variant found`
  })
  return palette
}

#sortVariantsByBrightness(base, variants) {
  const baseL = this.colorConverter.hexToHsl(base).lightness
  return variants.map(v => ({
    color: v,
    label: this.colorConverter.hexToHsl(v).lightness > baseL ? 'lighter' : 'darker'
  }))
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

  #fallbackToBlackOrWhite(request, direction) {
    const black = '#000000'
    const white = '#ffffff'

    const blackAccessible = this.passesWcag({
      foreground: black,
      background: request.basecolor,
      level: request.level,
      isLargeText: request.isLargeText
    })

    const whiteAccessible = this.passesWcag({
      foreground: white,
      background: request.basecolor,
      level: request.level,
      isLargeText: request.isLargeText
    })

    if (blackAccessible && whiteAccessible) {
      return direction === 'lighten' ? white : black
    }

    if (blackAccessible) return black
    if (whiteAccessible) return white

    return black
  }
}
