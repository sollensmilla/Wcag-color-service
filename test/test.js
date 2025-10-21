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

console.log('--- Testing generatePalette ---')
const request = new ColorVariantRequest('#114542')
  .withLevel('AA')
  .withLargeText(false)

const palette = wcagService.generatePalette(request)
console.log(palette)


