/**
 * Utility class for color conversion and manipulation.
 *
 * @author Smilla Sollén
 * @version 2.0.0
 */

export default class ColorConverter {
  hexToRgb(hexColor) {
    const hexWithoutHash = hexColor.slice(1)
    const decimalValue = parseInt(hexWithoutHash, 16)

    return {
      red: (decimalValue >> 16) & 255,
      green: (decimalValue >> 8) & 255,
      blue: decimalValue & 255
    }
  }

  rgbToHex({ red, green, blue }) {
    const toHex = (channelValue) => channelValue.toString(16).padStart(2, '0')
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
  }

  hexToHsl(hexColor) {
    const { red, green, blue } = this.hexToRgb(hexColor)
    const r = red / 255
    const g = green / 255
    const b = blue / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const lightness = (max + min) / 2

    if (max === min) {
      return { hue: 0, saturation: 0, lightness }
    }

    const delta = max - min
    const saturation =
      lightness > 0.5
        ? delta / (2 - max - min)
        : delta / (max + min)

    let hue
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

    return { hue: hue / 6, saturation, lightness }
  }

  hslToHex({ hue, saturation, lightness }) {
    if (saturation === 0) {
      const gray = Math.round(lightness * 255)
      return this.rgbToHex({ red: gray, green: gray, blue: gray })
    }

    const temp2 =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation
    const temp1 = 2 * lightness - temp2

    const red = this.#hueToChannel(temp1, temp2, hue + 1 / 3)
    const green = this.#hueToChannel(temp1, temp2, hue)
    const blue = this.#hueToChannel(temp1, temp2, hue - 1 / 3)

    return this.rgbToHex({
      red: Math.round(red * 255),
      green: Math.round(green * 255),
      blue: Math.round(blue * 255)
    })
  }

  /**
   * Helper function for HSL to RGB conversion to get individual color channels.
   */
  #hueToChannel(temp1, temp2, hueFraction) {
    if (hueFraction < 0) hueFraction += 1
    if (hueFraction > 1) hueFraction -= 1

    if (hueFraction < 1 / 6) return temp1 + (temp2 - temp1) * 6 * hueFraction
    if (hueFraction < 1 / 2) return temp2
    if (hueFraction < 2 / 3) return temp1 + (temp2 - temp1) * (2 / 3 - hueFraction) * 6
    return temp1
  }
}