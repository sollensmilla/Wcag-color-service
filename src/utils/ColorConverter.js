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
    const normalizedRgb = this.#normalizeRgb({ red, green, blue })

    const { maxColorValue, minColorValue } = this.#findExtremes(normalizedRgb)
    const lightness = this.#calculateLightness(maxColorValue, minColorValue)

    if (maxColorValue === minColorValue) {
      return { hue: 0, saturation: 0, lightness }
    }

    const colorRange = maxColorValue - minColorValue
    const saturation = this.#calculateSaturation(lightness, colorRange, maxColorValue, minColorValue)
    const hue = this.#calculateHue(normalizedRgb, maxColorValue, colorRange)

    return { hue, saturation, lightness }
  }

  hslToHex({ hue, saturation, lightness }) {
    if (saturation === 0) {
      const gray = Math.round(lightness * 255)
      return this.rgbToHex({ red: gray, green: gray, blue: gray })
    }

    const [minLightnessFactor, maxLightnessFactor] = this.#calculateTempValues(lightness, saturation)

    const red = this.#hueToChannel(minLightnessFactor, maxLightnessFactor, hue + 1 / 3)
    const green = this.#hueToChannel(minLightnessFactor, maxLightnessFactor, hue)
    const blue = this.#hueToChannel(minLightnessFactor, maxLightnessFactor, hue - 1 / 3)

    return this.rgbToHex({
      red: Math.round(red * 255),
      green: Math.round(green * 255),
      blue: Math.round(blue * 255)
    })
  }

 #normalizeRgb({ red, green, blue }) {
    return { r: red / 255, g: green / 255, b: blue / 255 }
  }

  #findExtremes({ r, g, b }) {
    return { maxColorValue: Math.max(r, g, b), minColorValue: Math.min(r, g, b) }
  }

  #calculateLightness(maxColorValue, minColorValue) {
    return (maxColorValue + minColorValue) / 2
  }

  #calculateSaturation(lightness, colorRange, maxColorValue, minColorValue) {
    return lightness > 0.5
      ? colorRange / (2 - maxColorValue - minColorValue)
      : colorRange / (maxColorValue + minColorValue)
  }

  #calculateHue({ r, g, b }, maxColorValue, colorRange) {
    let hue
    switch (maxColorValue) {
      case r:
        hue = (g - b) / colorRange + (g < b ? 6 : 0)
        break
      case g:
        hue = (b - r) / colorRange + 2
        break
      case b:
        hue = (r - g) / colorRange + 4
        break
    }
    return hue / 6
  }

  #calculateTempValues(lightness, saturation) {
    const maxLightnessFactor =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - lightness * saturation
    const minLightnessFactor = 2 * lightness - maxLightnessFactor
    return [minLightnessFactor, maxLightnessFactor]
  }

  #hueToChannel(minLightnessFactor, maxLightnessFactor, adjustedHue) {
    if (adjustedHue < 0) adjustedHue += 1
    if (adjustedHue > 1) adjustedHue -= 1

    if (adjustedHue < 1 / 6) return minLightnessFactor + (maxLightnessFactor - minLightnessFactor) * 6 * adjustedHue
    if (adjustedHue < 1 / 2) return maxLightnessFactor
    if (adjustedHue < 2 / 3) return minLightnessFactor + (maxLightnessFactor - minLightnessFactor) * (2 / 3 - adjustedHue) * 6
    return minLightnessFactor
  }
}
