# Test Report for `WcagColorService.js`

**Author:** Smilla Sollén
**Version:** 1.0.0
**Date:** September 29, 2025

---

## 1. Introduction

This report documents the tests performed for the `WcagColorService.js` module. The purpose of the tests was to validate core functionality, confirm WCAG compliance checks, and ensure that the library can be imported and used in external projects.

---

## 2. Test Environment

* **Operating System:** macOS
* **Node.js version:** v24.7.0
* **Test runner:** Manual execution using `npm test` (Node)
* **Dependencies:** None outside of project source files

---

## 3. Test Scope

The following functionalities were tested:

1. **Contrast Ratio Calculation** – verifies that the service correctly computes contrast ratios between two colors.
2. **WCAG Compliance Check** – validates that the service correctly determines whether color combinations meet WCAG requirements.
3. **Palette Generation** – confirms that the service can generate accessible lighter/darker variants of a base color.
4. **Library Integration** – validates that the module can be packaged and successfully imported into another project.

---

## 4. Test Cases and Results

### 4.1 Contrast Ratio

**Input:**

* `#FFFFFF` vs `#000000`
* `#FF0000` vs `#00FF00`

**Expected Output:**

* `21`
* ~`2.91`

**Actual Output:**

* `21`
* `2.9139375476009137`

**Result:** ✅ Passed

---

### 4.2 WCAG Compliance Check

**Input:**

* White vs Black, Level `AAA`
* Red vs Green, Large Text = `true`

**Expected Output:**

* `true`
* `false`

**Actual Output:**

* `true`
* `false`

**Result:** ✅ Passed

---

### 4.3 Palette Generation

**Input:**
Base color: `#a34b96`, Level: `AA`, Large Text: `false`

**Expected Output:**

* Palette object with base, lighter, and darker variants
* In case of failure, message indicating no accessible variant found

**Actual Output:**

```
{
  base: '#a34b96',
  lighter: '#faf3f9',
  darker: 'No accessible darker variant found'
}
```

**Result:** ⚠️ Partially Passed (lighter generated correctly, darker variant not accessible for this color)

---

### 4.4 Library Integration

**Procedure:**

* Zipped and imported the module into a separate project.
* Used `import { WcagColorService } from 'wcag-color-service'`.
* Successfully generated a palette from a base color (`#3498db`), but with no lightervariant .

**Expected Output:**

* Palette object with base, lighter, and darker variants
* In case of failure, message indicating no accessible variant found

**Actual Output:**

```
Generated WCAG Palette: {
  base: '#3498db',
  lighter: 'No accessible lighter variant found',
  darker: '#0a2639'
}
```

**Result:** ⚠️ Partially Passed (lighter generated correctly, darker variant not accessible for this color)

---

## 5. Error Handling

The tests confirmed that the service gracefully handles two types of error cases:

1. **Invalid Hex input:**
When an invalid hex code is passed to the ColorConverter, the custom error InvalidHexColorError is thrown with a descriptive message, e.g.:
```
InvalidHexColorError: Invalid hex color provided: "red"
```
This ensures developers receive clear feedback on malformed input instead of silent failures.

2. **No Accessible Variant:**
When no accessible lighter or darker variant can be generated, the service returns a clear message:
```
No accessible lighter variant found

No accessible darker variant found
```
This error handling strategy prevents null/undefined values from propagating and ensures predictable behavior across all tested scenarios.

---

## 6. Conclusion

The tests confirm that the core functionality of `WcagColorService.js` works as intended:

* Contrast ratio and WCAG compliance checks are accurate.
* Palette generation works, with appropriate handling of cases where variants cannot be found.
* The library can be packaged and imported successfully into external projects.

Further testing is recommended for:

* Full coverage of all utility classes (`WcagCheck`, `ColorVariantRequest`).
* Automated test suite integration.

**Overall Result:** ✅ The module is stable and functional for its intended use.
