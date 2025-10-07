import NoAccessibleColorError from '../errors/NoAccessibleColorError.js'

export default class AccessibleColorFinder {
    constructor(colorConverter, wcagUtils) {
        this.colorConverter = colorConverter
        this.wcagUtils = wcagUtils
    }

    findAccessibleVariant(request) {
        const byLightness = this.#findByLightness(request)
        if (byLightness) return byLightness

        const byHueSaturation = this.#findByHueAndSaturation(request)
        if (byHueSaturation) return byHueSaturation

        throw new NoAccessibleColorError(request.basecolor, request.direction)
    }

    #findByLightness(request) {
        for (let factor = 0.1; factor <= 1.0; factor += 0.1) {
            const candidate = request.direction === 'lighten'
                ? this.#lightenColor(request.basecolor, factor)
                : this.#darkenColor(request.basecolor, factor)
            if (this.#isAccessible(request, candidate)) return candidate
        }
        return null
    }

    #findByHueAndSaturation(request) {
        const baseHsl = this.colorConverter.hexToHsl(request.basecolor)
        for (let hueShift = -0.1; hueShift <= 0.1; hueShift += 0.02) {
            for (let satAdjust = -0.2; satAdjust <= 0.2; satAdjust += 0.05) {
                const adjusted = this.#adjustHueAndSaturation(baseHsl, hueShift, satAdjust)
                const candidate = this.#findAccessibleWithAdjustedHsl(request, adjusted)
                if (candidate) return candidate
            }
        }
        return null
    }

    #adjustHueAndSaturation(baseHsl, hueShift, satAdjust) {
        return {
            hue: (baseHsl.hue + hueShift + 1) % 1,
            saturation: Math.min(1, Math.max(0, baseHsl.saturation + satAdjust)),
            lightness: baseHsl.lightness
        }
    }

    #findAccessibleWithAdjustedHsl(request, adjustedHsl) {
        for (let factor = 0.1; factor <= 1.0; factor += 0.1) {
            const hsl = { ...adjustedHsl }
            hsl.lightness = request.direction === 'lighten'
                ? Math.min(1, hsl.lightness + factor)
                : Math.max(0, hsl.lightness - factor)

            const candidate = this.colorConverter.hslToHex(hsl)
            if (this.#isAccessible(request, candidate)) return candidate
        }
        return null
    }

    #isAccessible(request, candidate) {
        const ratio = this.wcagUtils.contrastRatio(candidate, request.basecolor)
        if (request.isLargeText) return ratio >= 3
        if (request.level === 'AAA') return ratio >= 7
        return ratio >= 4.5
    }

    #lightenColor(hexColor, factor) {
        const hsl = this.colorConverter.hexToHsl(hexColor)
        hsl.lightness = Math.min(1, hsl.lightness + factor)
        return this.colorConverter.hslToHex(hsl)
    }

    #darkenColor(hexColor, factor) {
        const hsl = this.colorConverter.hexToHsl(hexColor)
        hsl.lightness = Math.max(0, hsl.lightness - factor)
        return this.colorConverter.hslToHex(hsl)
    }
}
