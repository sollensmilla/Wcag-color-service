/**
 * Utility class for color manipulation and conversion according to WCAG guidelines.
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

import WcagCheck from './utils/WcagCheck.js'
import ColorVariantRequest from './utils/ColorVariantRequest.js'
import NoAccessibleColorError from './errors/NoAccessibleColorError.js'

/**
 * A Utility class for color manipulation and conversion.
 */
export class WcagColorService {
  /**
   * Converts a hex color to an RGB object.
   *
   * @param {string} hexColor - The hex color code (e.g., '#RRGGBB').
   * @returns {{ red: number, green: number, blue: number }} - The RGB components.
   */
  #hexToRgb (hexColor) {
    const hexWithoutHash = hexColor.slice(1)
    const decimalValue = parseInt(hexWithoutHash, 16)

    const red = (decimalValue >> 16) & 255
    const green = (decimalValue >> 8) & 255
    const blue = decimalValue & 255

    return { red, green, blue }
  }

  /**
   * Converts an RGB object to hex.
   *
   * @param {{ red: number, green: number, blue: number }} rgbColor
   * @returns {string} - Hex color string.
   */
  #rgbToHex ({ red, green, blue }) {
    const toHex = (channelValue) => channelValue.toString(16).padStart(2, '0')
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
  }

  /**
   * Converts a hex color to HSL.
   *
   * @param {string} hexColor
   * @returns {{ hue: number, saturation: number, lightness: number }}
   */
  #hexToHsl (hexColor) {
    const { red, green, blue } = this.#hexToRgb(hexColor)
    const r = red / 255
    const g = green / 255
    const b = blue / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let hue, saturation
    let lightness = (max + min) / 2

    if (max === min) {
      hue = saturation = 0
    } else {
      const delta = max - min
      saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)

      switch (max) {
        case r:
          hue = (g - b) / delta + (g < b ? 6 : 0)
          break
        case g:
          hue = (b - r) / delta + 2
          break
        case b:
          hue = (r - g) / delta + 4
          break
      }
      hue /= 6
    }

    return { hue, saturation, lightness }
  }

  /**
   * Converts an HSL color to hex.
   *
   * @param {{ hue: number, saturation: number, lightness: number }} hslColor
   * @returns {string}
   */
  #hslToHex ({ hue, saturation, lightness }) {
    const hueToRgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    let r, g, b
    if (saturation === 0) {
      r = g = b = lightness
    } else {
      const q = lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation
      const p = 2 * lightness - q
      r = hueToRgb(p, q, hue + 1 / 3)
      g = hueToRgb(p, q, hue)
      b = hueToRgb(p, q, hue - 1 / 3)
    }

    return this.#rgbToHex({
      red: Math.round(r * 255),
      green: Math.round(g * 255),
      blue: Math.round(b * 255)
    })
  }

  /**
   * Lightens a color by increasing its HSL lightness.
   *
   * @param {string} hexColor
   * @param {number} factor - How much to lighten (0.2 = +20%).
   * @returns {string}
   */
  lightenColor (hexColor, factor = 0.2) {
    const hslColor = this.#hexToHsl(hexColor)
    hslColor.lightness = Math.min(1, hslColor.lightness + factor)
    return this.#hslToHex(hslColor)
  }

  /**
   * Darkens a color by decreasing its HSL lightness.
   *
   * @param {string} hexColor
   * @param {number} factor - How much to darken (0.2 = -20%).
   * @returns {string}
   */
  darkenColor (hexColor, factor = 0.2) {
    const hslColor = this.#hexToHsl(hexColor)
    hslColor.lightness = Math.max(0, hslColor.lightness - factor)
    return this.#hslToHex(hslColor)
  }

  /**
   * Calculates relative luminance according to WCAG.
   *
   * @param {{ red: number, green: number, blue: number }} rgbColor
   * @returns {number}
   */
  #relativeLuminance ({ red, green, blue }) {
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

  contrastRatio (foreground, background) {
    const luminanceForeground = this.#relativeLuminance(this.#hexToRgb(foreground))
    const luminanceBackground = this.#relativeLuminance(this.#hexToRgb(background))
    const brightest = Math.max(luminanceForeground, luminanceBackground)
    const darkest = Math.min(luminanceForeground, luminanceBackground)
    return (brightest + 0.05) / (darkest + 0.05)
  }

  passesWcag (wcagCheck) {
    const ratio = this.contrastRatio(wcagCheck.foreground, wcagCheck.background)
    if (wcagCheck.isLargeText) return ratio >= 3
    if (wcagCheck.level === 'AAA') return ratio >= 7
    return ratio >= 4.5
  }

  isAccessible (request, candidate) {
    const wcagCheck = new WcagCheck(
      candidate,
      request.basecolor,
      { level: request.level, isLargeText: request.isLargeText }
    )
    return this.passesWcag(wcagCheck)
  }

  findAccessibleVariant (request) {
    for (let factor = 0.1; factor <= 1.0; factor += 0.1) {
      const candidate = request.direction === 'lighten'
        ? this.lightenColor(request.basecolor, factor)
        : this.darkenColor(request.basecolor, factor)

      if (this.isAccessible(request, candidate)) {
        return candidate
      }
    }
    throw new NoAccessibleColorError(request.basecolor, request.direction)
  }

generatePalette (request) {
  const lighterRequest = new ColorVariantRequest(request.basecolor)
    .withLevel(request.level)
    .withLargeText(request.isLargeText)
    .withDirection('lighten')

  const darkerRequest = new ColorVariantRequest(request.basecolor)
    .withLevel(request.level)
    .withLargeText(request.isLargeText)
    .withDirection('darken')

  let lighterVariant, darkerVariant

  try {
    lighterVariant = this.findAccessibleVariant(lighterRequest)
  } catch (error) {
    if (error instanceof NoAccessibleColorError) {
      console.error(error.message)
      lighterVariant = 'No accessible lighter color'
    } else {
      throw error
    }
  }

  try {
    darkerVariant = this.findAccessibleVariant(darkerRequest)
  } catch (error) {
    if (error instanceof NoAccessibleColorError) {
      console.error(error.message)
      darkerVariant = 'No accessible darker color'
    } else {
      throw error
    }
  }

  return {
    base: request.basecolor,
    lighter: lighterVariant,
    darker: darkerVariant
  }
 }
}