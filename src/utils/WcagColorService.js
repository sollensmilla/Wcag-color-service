/**
 * Utility class for color manipulation and conversion according to WCAG guidelines.
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

import WcagCheck from './WcagCheck.js'
import ColorVariantRequest from './ColorVariantRequest.js'

/**
 * A Utility class for color manipulation and conversion.
 */
export class WcagColorService {
  /**
   * Returns the RGB representation of a hex color code.
   *
   * @param {string} hexColor - The hex color code (e.g., '#RRGGBB').
   * @returns {{red: number, green: number, blue: number}} - The RGB components.
   */
  #hexToRgb (hexColor) {
    const hashlessHex = hexColor.slice(1)
    const decimalColorValue = parseInt(hashlessHex, 16)

    const red = (decimalColorValue >> 16) & 255
    const green = (decimalColorValue >> 8) & 255
    const blue = decimalColorValue & 255

    return { red, green, blue }
  }

  /**
   * Converts a channel value (0-255) to its hexadecimal representation.
   *
   * @param {number} channelValue - The channel value (0-255).
   * @returns {string} The hexadecimal representation of the channel value.
   */
  #toHex (channelValue) {
    return channelValue.toString(16).padStart(2, '0')
  }

  /**
   * Converts an RGB color object to its hex representation.
   *
   * @param {object} rgbColor - The RGB color object.
   * @param {number} rgbColor.red - The red component (0-255).
   * @param {number} rgbColor.green - The green component (0-255).
   * @param {number} rgbColor.blue - The blue component (0-255).
   * @returns {string} The hex color code.
   */
  #rgbToHex ({ red, green, blue }) {
    return `#${this.#toHex(red)}${this.#toHex(green)}${this.#toHex(blue)}`
  }

  /**
   * Calculates the relative luminance of an RGB color according to WCAG guidelines and linearizes the color values.
   *
   * @param {number[]} rgbColor - An array containing the red, green, and blue components.
   * @param {number} rgbColor.0 - The red component (0-255).
   * @param {number} rgbColor.1 - The green component (0-255).
   * @param {number} rgbColor.2 - The blue component (0-255).
   * @returns {number} The relative luminance value.
   */
  #relativeLuminance ({ red, green, blue }) {
    const standardRgb = [red, green, blue].map(value => value / 255) // Normalize

    const linearRgb = standardRgb.map(value => {
      return value <= 0.03928
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4) // Linearize
    })

    return (
      0.2126 * linearRgb[0] +
      0.7152 * linearRgb[1] +
      0.0722 * linearRgb[2]
    )
  }

  /**
   * Calculates the contrast ratio between a foreground color and a background color
   * according to WCAG guidelines.
   *
   * @param {string} foreground - The foreground (e.g., text) color in hex format.
   * @param {string} background - The background color in hex format.
   * @returns {number} The contrast ratio between the two colors.
   */
  contrastRatio (foreground, background) {
    const luminanceForeground = this.#relativeLuminance(this.#hexToRgb(foreground))
    const luminanceBackground = this.#relativeLuminance(this.#hexToRgb(background))

    const brightestLuminance = Math.max(luminanceForeground, luminanceBackground)
    const darkestLuminance = Math.min(luminanceForeground, luminanceBackground)

    return (brightestLuminance + 0.05) / (darkestLuminance + 0.05)
  }

  /**
   * Checks if the contrast ratio between two colors meets the WCAG guidelines for a given level and text size.
   *
   * @param { WcagCheck } wcagCheck - An object containing the parameters for the WCAG check.
   * @returns {boolean} True if the colors pass the WCAG guidelines, false otherwise.
   */
  passesWcag (wcagCheck) {
    const checkInstance = new WcagCheck(
      wcagCheck.foreground,
      wcagCheck.background,
      { level: wcagCheck.level, isLargeText: wcagCheck.isLargeText }
    )

    const ratio = this.contrastRatio(checkInstance.foreground, checkInstance.background)

    if (checkInstance.isLargeText) return ratio >= 3
    if (checkInstance.level === 'AAA') return ratio >= 7
    return ratio >= 4.5
  }

  /**
   * Checks if a color variant request is accessible according to WCAG guidelines.
   *
   * @param {ColorVariantRequest} request - The color variant request containing the base color and other parameters.
   * @returns {boolean} True if the color variant is accessible, false otherwise.
   */
  isAccessible (request) {
    const wcagCheck = new WcagCheck(
      request.basecolor,
      request.background,
      { level: request.level, isLargeText: request.isLargeText }
    )
    return this.passesWcag(wcagCheck)
  }

  /**
   * Adjusts the brightness of a color channel (R, G, or B).
   *
   * @param {*} channelValue - The original channel value (0-255).
   * @param {*} adjustmentFactor - The factor by which to adjust the channel value.
   * @returns {number} The adjusted channel value, clamped between 0 and 255.
   */
  #adjustColorChannel (channelValue, adjustmentFactor) {
    const adjustedValue = channelValue + (channelValue * adjustmentFactor)

    return Math.round(Math.min(Math.max(adjustedValue, 0), 255))
  }

  /**
   * Adjusts the brightness of an RGB color.
   *
   * @param {*} rgbColor - The RGB color object.
   * @param {*} adjustmentFactor - The factor by which to adjust the brightness (positive to lighten, negative to darken).
   * @returns {object} The adjusted RGB color object.
   */
  #adjustColorBrightness (rgbColor, adjustmentFactor) {
    return {
      red: this.#adjustColorChannel(rgbColor.red, adjustmentFactor),
      green: this.#adjustColorChannel(rgbColor.green, adjustmentFactor),
      blue: this.#adjustColorChannel(rgbColor.blue, adjustmentFactor)
    }
  }

  /**
   * Lightens a hex color by a given factor. Default factor 0.2 is 20% lighter.
   *
   * @param {*} hexColor - The hex color to lighten.
   * @param {*} factor - The factor by which to lighten the color.
   * @returns {string} The lightened hex color.
   */
  lightenColor (hexColor, factor = 0.2) {
    const rgb = this.#hexToRgb(hexColor)
    const lightenedColor = this.#adjustColorBrightness(rgb, factor)
    return this.#rgbToHex(lightenedColor)
  }

  /**
   * Darkens a hex color by a given factor. Default factor 0.2 is 20% darker.
   *
   * @param {*} hexColor - The hex color to darken.
   * @param {*} factor - The factor by which to darken the color.
   * @returns {string} The darkened hex color.
   */
  darkenColor (hexColor, factor = 0.2) {
    const rgb = this.#hexToRgb(hexColor)
    const darkenedColor = this.#adjustColorBrightness(rgb, -factor)
    return this.#rgbToHex(darkenedColor)
  }

  /**
   * Finds an accessible color variant based on the given request.
   *
   * @param {ColorVariantRequest} request - The color variant request containing the base color and other parameters.
   * @returns {string|undefined} The accessible color variant in hex format, or undefined if no variant is found.
   */
  findAccessibleVariant (request) {
    for (let factor = 0.1; factor <= 0.9; factor += 0.1) {
      const adjusted = request.direction === 'lighten'
        ? this.lightenColor(request.basecolor, factor)
        : this.darkenColor(request.basecolor, factor)

      const newRequest = new ColorVariantRequest(adjusted)
        .withBackground(request.background)
        .withLevel(request.level)
        .withLargeText(request.isLargeText)

      if (this.isAccessible(newRequest)) {
        return adjusted
      }
    }
    console.warn('No accessible variant found')
  }

  /**
   * Generates a color palette with lighter and darker shades of the base color.
   *
   * @param {ColorVariantRequest} request - The color variant request containing the base color.
   * @returns {object} An object containing the base color, a lighter variant, and a darker variant.
   */
  generatePalette (request) {
    const lighterRequest = new ColorVariantRequest(request)
      .withBackground(request.background)
      .withLevel(request.level)
      .withLargeText(request.isLargeText)
      .withDirection('lighten')

    const darkerRequest = new ColorVariantRequest(request)
      .withBackground(request.background)
      .withLevel(request.level)
      .withLargeText(request.isLargeText)
      .withDirection('darken')

    return {
      base: request.basecolor,
      lighter: this.findAccessibleVariant(lighterRequest),
      darker: this.findAccessibleVariant(darkerRequest)
    }
  }
}
