import ColorVariantRequest from './ColorVariantRequest.js'
import NoAccessibleColorError from '../errors/NoAccessibleColorError.js'
import WcagCheck from './WcagCheck.js'

export default class AccessibleVariant {
  constructor(colorConverter, wcagColorService) {
    this.colorConverter = colorConverter
    this.wcagColorService = wcagColorService
  }

    findAccessibleVariant(request) {
    for (let lightnessFactor = 0.05; lightnessFactor <= 0.95; lightnessFactor += 0.05) {
      const candidate = request.direction === 'lighten'
        ? this.lightenColor(request.basecolor, lightnessFactor)
        : this.darkenColor(request.basecolor, lightnessFactor)

      if (this.wcagColorService.isAccessible(request, candidate)) {
        return candidate
      }
    }

    const fallback = request.direction === 'lighten' ? '#ffffff' : '#000000'
    if (this.wcagColorService.isAccessible(request, fallback)) return fallback

    throw new NoAccessibleColorError(request.basecolor, request.direction)
  }

  lightenColor(hexColor, lightnessFactor = 0.2) {
    const hslColor = this.colorConverter.hexToHsl(hexColor)
    hslColor.lightness = Math.min(1, hslColor.lightness + lightnessFactor)
    return this.colorConverter.hslToHex(hslColor)
  }

  darkenColor(hexColor, darkeningFactor = 0.2) {
    const hslColor = this.colorConverter.hexToHsl(hexColor)
    hslColor.lightness = Math.max(0, hslColor.lightness - darkeningFactor)
    return this.colorConverter.hslToHex(hslColor)
  }

  generateAccessiblePalette(request) {
    const lighter = this.#tryFindVariant(request, 'lighten')
    const darker = this.#tryFindVariant(request, 'darken')

    if (lighter && darker) return this.#paletteNormal(request, lighter, darker)
    if (darker) return this.#paletteSingleType(request, 'darken', darker)
    if (lighter) return this.#paletteSingleType(request, 'lighten', lighter)

    return this.#findAccessibleFallback(request)
  }

  #tryFindVariant(request, colorDirection) {
    try {
      const variantRequest = this.#createVariantRequest(request, colorDirection)
      return this.findAccessibleVariant(variantRequest)
    } catch {
      return null
    }
  }

  #paletteNormal(request, lighter, darker) {
    return { base: request.basecolor, lighter, darker }
  }

  #paletteSingleType(request, paletteType, firstVariant) {
    const secondVariant = this.#tryFindSecondVariant(request, paletteType, firstVariant)
    const colorKey1 = paletteType === 'lighten' ? 'lighter1' : 'darker1'
    const colorKey2 = paletteType === 'lighten' ? 'lighter2' : 'darker2'

    return {
      base: request.basecolor,
      [colorKey1]: firstVariant,
      [colorKey2]: secondVariant
    }
  }

  #tryFindSecondVariant(request, colorDirection, firstVariant) {
    try {
      const variantRequest = this.#createVariantRequest(request, colorDirection)
      const candidate = this.findAccessibleVariant({ ...variantRequest, factorStart: 0.5 })

      if (candidate.toLowerCase() === firstVariant.toLowerCase()) {
        return this.#shiftVariant(firstVariant, colorDirection)
      }

      return candidate
    } catch {
      return this.#shiftVariant(firstVariant, colorDirection)
    }
  }

  #shiftVariant(hexColor, colorDirection) {
    const lighteningFactor = 0.1
    return colorDirection === 'lighten'
      ? this.lightenColor(hexColor, lighteningFactor)
      : this.darkenColor(hexColor, lighteningFactor)
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
    const wcagCheck = new WcagCheck(candidate, request.basecolor, {
      level: request.level,
      isLargeText: request.isLargeText
    })
    return this.wcagColorService.passesWcag(wcagCheck)
  }

  #createVariantRequest(request, direction) {
    return new ColorVariantRequest(request.basecolor)
      .withLevel(request.level)
      .withLargeText(request.isLargeText)
      .withDirection(direction)
  }
}
