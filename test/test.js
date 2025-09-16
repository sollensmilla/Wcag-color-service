/**
 * Test file for colorUtils.js
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

import { ColorUtils } from '../src/colorUtils.js';

const colorUtils = new ColorUtils();

console.log('Testing hexToRgb...');
console.log(colorUtils.hexToRgb('#FFFFFF')); // Expected: [255, 255, 255]
console.log(colorUtils.hexToRgb('#000000')); // Expected: [0, 0, 0]

console.log('Testing relativeLuminance...');
console.log(colorUtils.relativeLuminance([255, 255, 255])); // Expected: 1
console.log(colorUtils.relativeLuminance([0, 0, 0])); // Expected: 0

console.log('Testing contrastRatio...');
console.log(colorUtils.contrastRatio('#FFFFFF', '#000000')); // Expected: 21
console.log(colorUtils.contrastRatio('#FF0000', '#00FF00')); // Expected: ~2.91

console.log('Testing passesWcag...');
console.log(colorUtils.passesWcag({ foreground: '#FFFFFF', background: '#000000', level: 'AA' }));  // Expected: true

console.log(colorUtils.passesWcag({ foreground: '#FF0000', background: '#00FF00', level: 'AA' }));  // Expected: false
