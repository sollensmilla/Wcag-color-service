# Unable to find accessible lighter and darker variants for certain colors

The current implementation of the WcagColorService module only adjusts a color by lightening or darkening it along the HSL lightness axis to generate accessible variants. This approach makes it practically impossible to find both a lighter and a darker variant that passes WCAG contrast requirements for certain base colors.

Currently, if a variant cannot be found, the module throws a NoAccessibleColorError. While this handles the error, it limits the usability of the service because it does not attempt any other color adjustments beyond simple lightening or darkening.

## Steps to Reproduce:

Use WcagColorService.generatePalette() with a base color.

Observe that either the lighter or darker variant cannot be generated and the module returns the fallback error message.

## Expected Behavior:
The module should attempt minor adjustments to the hue or saturation, in addition to lightness, in order to find accessible variants even when simple lightening/darkening is insufficient. This would increase the likelihood of generating both accessible lighter and darker colors for any given base color.

## Actual Behavior:
The module only lightens or darkens along the lightness axis, resulting in cases where one variant cannot meet WCAG contrast requirements. The system relies on fallback messages instead of producing a usable color variant.

## Suggested Fix / Improvement:

Extend the module to slightly adjust hue or saturation if lightening or darkening alone cannot produce an accessible variant.
