/**
 * Test file for colorUtils.js
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

import { WcagColorService } from '../src/utils/WcagColorService.js'
import { WcagCheck } from '../src/utils/WcagCheck.js'

const wcagService = new WcagColorService()

console.log('Testing contrastRatio...')
console.log(wcagService.contrastRatio('#FFFFFF', '#000000')) // Expected: 21
console.log(wcagService.contrastRatio('#FF0000', '#00FF00')) // Expected: ~2.91

console.log('Testing passesWcag...')
const check1 = new WcagCheck('#FFFFFF', '#000000', { level: 'AAA' })
console.log(wcagService.passesWcag(check1)) // Expected: true

const check2 = new WcagCheck('#FF0000', '#00FF00', { isLargeText: true})
console.log(wcagService.passesWcag(check2)) // Expected: false
