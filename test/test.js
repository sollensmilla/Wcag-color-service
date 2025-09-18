/**
 * Test file for colorUtils.js
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

import { ColorUtils } from '../src/utils/colorUtils.js'
import { WcagCheck } from '../src/utils/WcagCheck.js'

const colorUtils = new ColorUtils()

console.log('Testing contrastRatio...')
console.log(colorUtils.contrastRatio('#FFFFFF', '#000000')) // Expected: 21
console.log(colorUtils.contrastRatio('#FF0000', '#00FF00')) // Expected: ~2.91

console.log('Testing passesWcag...')
const check1 = new WcagCheck('#FFFFFF', '#000000', { level: 'AAA' })
console.log(colorUtils.passesWcag(check1)) // Expected: true

const check2 = new WcagCheck('#FF0000', '#00FF00', { isLargeText: true})
console.log(colorUtils.passesWcag(check2)) // Expected: false
