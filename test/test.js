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

console.log('--- Testing passesWcag ---')
const check1 = new WcagCheck('#FFFFFF', '#000000', { level: 'AAA' })
console.log(wcagService.passesWcag(check1)) // Expected: true

const check2 = new WcagCheck('#FF0000', '#00FF00', { isLargeText: true })
console.log(wcagService.passesWcag(check2)) // Expected: false

console.log('--- Testing generatePalette ---')
// skapa request utan background
const request = new ColorVariantRequest('#a83997')
  .withLevel('AA')
  .withLargeText(false)

const palette = wcagService.generatePalette(request)
console.log(palette)
// Expected: { base: '#944B89', lighter: <accessible lighter>, darker: <accessible darker> }

console.log('--- Testing invalid hex inputs ---')

try {
  wcagService.contrastRatio('red', '#000000') // Not a hex color
} catch (error) {
  console.log(error instanceof Error) // true
  console.log(error.name) // Expected: InvalidHexColorError
  console.log(error.message) // Expected: Invalid hex color provided: "red"
}

try {
  wcagService.contrastRatio('#12', '#000000') // Too short
} catch (error) {
  console.log(error.name) // Expected: InvalidHexColorError
}

try {
  wcagService.contrastRatio('#GGGGGG', '#000000') // Invalid characters
  console.log(error.name) // Expected: InvalidHexColorError
} catch (error) {
  console.log(error.name) // Expected: InvalidHexColorError
}
