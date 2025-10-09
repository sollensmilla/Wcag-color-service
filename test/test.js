/**
 * Test file for WcagColorService.js
 *
 * @author Smilla Sollén
 * @version 1.2.0
 */

import { WcagColorService } from '../src/WcagColorService.js'
import WcagCheck from '../src/utils/WcagCheck.js'
import ColorVariantRequest from '../src/utils/ColorVariantRequest.js'

const wcagService = new WcagColorService()

console.log('--- Testing contrastRatio ---')
console.log(wcagService.contrastRatio('#FFFFFF', '#000000')) // Expected: 21
console.log(wcagService.contrastRatio('#FF0000', '#00FF00')) // Expected: ~2.91

console.log('--- Testing passesWcag ---')
const check1 = new WcagCheck('#FFFFFF', '#000000', { level: 'AAA' })
console.log(wcagService.passesWcag(check1)) // Expected: true

const check2 = new WcagCheck('#FF0000', '#00FF00', { isLargeText: true })
console.log(wcagService.passesWcag(check2)) // Expected: false

console.log('--- Testing generatePalette ---')
const request = new ColorVariantRequest('#b861a1')
  .withLevel('AA')
  .withLargeText(false)

const palette = wcagService.generatePalette(request)
console.log(palette)

console.log('--- Testing invalid hex inputs ---')

try {
  wcagService.contrastRatio('red', '#000000') // Not a hex color
} catch (error) {
  console.log(error instanceof Error) // true
  console.log(error.name) // Expected: InvalidHexColorError
  console.log(error.message) // Expected: Invalid hex color provided: "red"
}

try {
  wcagService.contrastRatio('#12', '#440c51ff') // Too short
} catch (error) {
  console.log(error.name) // Expected: InvalidHexColorError
}

try {
  wcagService.contrastRatio('#GGGGGG', '#000000ff') // Invalid characters
  console.log(error.name) // Expected: InvalidHexColorError
} catch (error) {
  console.log(error.name) // Expected: InvalidHexColorError
}
