# Test Report for `WcagColorService.js`

**Author:** Smilla Sollén  
**Version:** 2.0.1
**Date:** October 21, 2025  

---

## Summary

This report documents testing of the `WcagColorService.js` module, focusing on how it handles various hex color inputs — valid, invalid, very light, and very dark.  
All tests were performed manually in Node.js using console output.

| Test Case | Description | Result |
|------------|-------------|--------|
| Valid mid-tone hex (`#386fc7`) | Generates accessible lighter/darker variants | ✅ Passed |
| Invalid hex (`"red"`) | Throws `InvalidHexColorError` | ✅ Passed |
| Light color (`#1ea4b3`) | Returns no lighter variant | ✅ Passed |
| Dark color (`#114542`) | Returns no darker variant | ✅ Passed |

---

## Test Environment

- **Operating System:** macOS  
- **Node.js Version:** v24.7.0  
- **Execution:** Manual via `npm test`  
- **Dependencies:** Installed from npm registry (`wcag-color-service`)

---

## Test Details

### 1. Valid Hex – Medium Color

**Input:** `#386fc7`, `largeText(true)`, `level('AA')`
**Expected:** Palette with both lighter and darker variants.  
**Output:**
```js
{ base: '#386fc7', lighter: '#c3d4ee', darker: '#11213c' }
```
**Result:** Passed

### 2. Invalid Hex
**Input:** `'red'` 
**Expected:** Throws custom `InvalidHexColorError`
**Output:**
```
InvalidHexColorError: Invalid hex color provided: "red"
```
**Result:** Passed

### 3. Light Color

**Input:**  `#1ea4b3`, `largeText(false)`, `level(AA)``
**Expected:** No accessible lighter variant possible.
**Output**
```js
{ base: '#1ea4b3', darker1: '#082c30', darker2: '#010404' }
```
**Result:** Passed

### 4. Dark Color

**Input:**  `#114542`, `largeText(false)`, `level(AA)``
**Expected:** No accessible darker variant possible.
**Output**
```js
{ base: '#114542', lighter1: '#2fc0b7', lighter2: '#4ed4cb' }
```
**Result:** Passed

## Conclusion

The `WcagColorService` correctly handles different types of color inputs:

- Generates accessible variants for valid colors
- Returns clear feedback for extreme (too light/dark) colors
- Throws descriptive errors for malformed hex codes

Overall Result:  All tests passed — module behavior is stable and predictable.