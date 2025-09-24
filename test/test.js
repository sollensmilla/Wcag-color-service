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
// skapa request utan background
const request = new ColorVariantRequest('#944B89')
  .withLevel('AA')
  .withLargeText(false)

const palette = wcagService.generatePalette(request)
console.log(palette)
// Expected: { base: '#944B89', lighter: <accessible lighter>, darker: <accessible darker> }
