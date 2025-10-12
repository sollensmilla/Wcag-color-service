/**
 * Utility class for handling fallback colors when no accessible color variants can be found.
 *
 * @author Smilla Sollén
 * @version 2.0.0
 */

import ColorVariantRequest from './ColorVariantRequest.js'

export default class GenerateVariants {
  constructor(finder, passesWcag, colorConverter) {
    this.finder = finder
    this.passesWcag = passesWcag
    this.colorConverter = colorConverter
  }

  tryFindVariant(request, direction) {
    const variantRequest = this.#createVariantRequest(request, direction)
    try {
      return this.finder.findAccessibleVariant(variantRequest)
    } catch (error) {
      console.warn(`${error.message}`)
      return this.#fallbackToBlackOrWhite(request, direction)
    }
  }

  #createVariantRequest(request, direction) {
    return new ColorVariantRequest(request.basecolor)
      .withLevel(request.level)
      .withLargeText(request.isLargeText)
      .withDirection(direction)
  }

  handleMissingLighter(request, darker) {
    console.warn('No lighter found — generating two darker variants.')
    const secondDarker = this.tryFindVariant({ ...request, basecolor: darker }, 'darker')

    return this.#buildPalette({
      base: request.basecolor,
      variants: [darker, secondDarker],
      labels: ['darker', 'darker2']
    })
  }

  handleMissingDarker(request, lighter) {
    console.warn('No darker found — generating two lighter variants.')
    const secondLighter = this.tryFindVariant({ ...request, basecolor: lighter }, 'lighter')

    return this.#buildPalette({
      base: request.basecolor,
      variants: [lighter, secondLighter],
      labels: ['lighter', 'lighter2']
    })
  }

  buildStandardPalette(request, lighter, darker) {
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
    const baseLightness = this.colorConverter.hexToHsl(base).lightness
    return variants.map(variant => ({
      color: variant,
      label: this.colorConverter.hexToHsl(variant).lightness > baseLightness ? 'lighter' : 'darker'
    }))
  }

  #fallbackToBlackOrWhite(request, direction) {
    const black = '#000000'
    const white = '#ffffff'

    const blackAccessible = this.#getBlackAccessible(request)
    const whiteAccessible = this.#getWhiteAccessible(request)

    if (blackAccessible && whiteAccessible) {
      return direction === 'lighten' ? white : black
    }

    if (blackAccessible) return black
    if (whiteAccessible) return white

    return black
  }

  #getBlackAccessible(request) {
    const black = '#000000'
    return this.passesWcag({
      foreground: black,
      background: request.basecolor,
      level: request.level,
      isLargeText: request.isLargeText
    })
  }

  #getWhiteAccessible(request) {
    const white = '#ffffff'
    return this.passesWcag({
      foreground: white,
      background: request.basecolor,
      level: request.level,
      isLargeText: request.isLargeText
    })
  }
}