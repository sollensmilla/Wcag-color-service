import NoAccessibleColorError from '../errors/NoAccessibleColorError.js'

export default class AccessibleColorFinder {
    constructor(colorConverter, wcagUtils) {
        this.colorConverter = colorConverter
        this.wcagUtils = wcagUtils
    }

    findAccessibleVariant(request) {
        const byLightness = this.#findByLightness(request)
        if (byLightness) return byLightness

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
