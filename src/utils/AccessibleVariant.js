import ColorVariantRequest from './ColorVariantRequest.js'
import NoAccessibleColorError from '../errors/NoAccessibleColorError.js'
import WcagCheck from './WcagCheck.js'

const lightnessStep = 0.05
const lightnessShift = 0.1
const fallbackColors = {
    black: '#000000',
    white: '#ffffff'
}

export default class AccessibleVariant {
    constructor(colorConverter, wcagColorService) {
        this.colorConverter = colorConverter
        this.wcagColorService = wcagColorService
    }

    findAccessibleVariant(request) {
        for (let factor = lightnessStep; factor <= 0.95; factor += lightnessStep) {
            const candidate = request.direction === 'lighten'
                ? this.lightenColor(request.basecolor, factor)
                : this.darkenColor(request.basecolor, factor)

            if (this.wcagColorService.isAccessible(request, candidate)) {
                return candidate
            }
        }

        const fallback = request.direction === 'lighten'
            ? fallbackColors.white
            : fallbackColors.black

        if (this.wcagColorService.isAccessible(request, fallback)) return fallback

        throw new NoAccessibleColorError(request.basecolor, request.direction)
    }

    lightenColor(hexColor, lightnessFactor = 0.2) {
        const hsl = this.colorConverter.hexToHsl(hexColor)
        hsl.lightness = Math.min(1, hsl.lightness + lightnessFactor)
        return this.colorConverter.hslToHex(hsl)
    }

    darkenColor(hexColor, darkeningFactor = 0.2) {
        const hsl = this.colorConverter.hexToHsl(hexColor)
        hsl.lightness = Math.max(0, hsl.lightness - darkeningFactor)
        return this.colorConverter.hslToHex(hsl)
    }

    generateAccessiblePalette(request) {
        const lighter = this.#tryFindVariant(request, 'lighten')
        const darker = this.#tryFindVariant(request, 'darken')

        if (lighter && darker) return this.#paletteNormal(request, lighter, darker)
        if (darker) return this.#paletteSingleType(request, 'darken', darker)
        if (lighter) return this.#paletteSingleType(request, 'lighten', lighter)

        return this.#findAccessibleFallback(request)
    }

    #tryFindVariant(request, direction) {
        try {
            const variantRequest = this.#createVariantRequest(request, direction)
            return this.findAccessibleVariant(variantRequest)
        } catch {
            return null
        }
    }

    #paletteNormal(request, lighter, darker) {
        return { base: request.basecolor, lighter, darker }
    }

    #paletteSingleType(request, direction, firstVariant) {
        const paletteLabelsByDirection = {
            lighten: ['lighter1', 'lighter2'],
            darken: ['darker1', 'darker2']
        }

        const secondVariant = this.#tryFindSecondVariant(request, direction, firstVariant)
        const [firstVariantLabel, secondVariantLabel] = paletteLabelsByDirection[direction]

        return {
            base: request.basecolor,
            [firstVariantLabel]: firstVariant,
            [secondVariantLabel]: secondVariant
        }
    }

    #tryFindSecondVariant(request, direction, firstVariant) {
        try {
            const variantRequest = this.#createVariantRequest(request, direction)
            const candidate = this.findAccessibleVariant({ ...variantRequest, factorStart: 0.5 })

            if (candidate.toLowerCase() === firstVariant.toLowerCase()) {
                return this.#shiftVariant(firstVariant, direction)
            }

            return candidate
        } catch {
            return this.#shiftVariant(firstVariant, direction)
        }
    }

    #createVariantRequest(request, direction) {
        return new ColorVariantRequest(request.basecolor)
            .withLevel(request.level)
            .withLargeText(request.isLargeText)
            .withDirection(direction)
    }

    #shiftVariant(hexColor, direction) {
        return direction === 'lighten'
            ? this.lightenColor(hexColor, lightnessShift)
            : this.darkenColor(hexColor, lightnessShift)
    }

    #findAccessibleFallback(request) {
        const whitePasses = this.#isFallbackAccessible(request, fallbackColors.white)
        const blackPasses = this.#isFallbackAccessible(request, fallbackColors.black)

        if (whitePasses && blackPasses)
            return { base: request.basecolor, lighter: fallbackColors.white, darker: fallbackColors.black }

        if (whitePasses)
            return { base: request.basecolor, lighter: fallbackColors.white, darker: 'No accessible darker variant found' }

        if (blackPasses)
            return { base: request.basecolor, lighter: 'No accessible lighter variant found', darker: fallbackColors.black }

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
}
