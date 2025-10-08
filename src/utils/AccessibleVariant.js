import WcagCheck from './WcagCheck.js'
import ColorVariantRequest from './ColorVariantRequest.js'
import NoAccessibleColorError from '../errors/NoAccessibleColorError.js'
import ColorConverter from './ColorConverter.js'

export default class AccessibleVariant {
  constructor(passesWcag) {
    this.colorConverter = new ColorConverter()
    this.passesWcag = passesWcag
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

  createVariantRequest(request, direction) {
    return new ColorVariantRequest(request.basecolor)
      .withLevel(request.level)
      .withLargeText(request.isLargeText)
      .withDirection(direction)
  }

  getVariantOrFallback(request, fallbackMessage) {
    try {
      return this.findAccessibleVariant(request)
    } catch (error) {
      console.error(error.message)
      return fallbackMessage
    }
  }
}
