/**
 * Custom error for invalid hex color inputs.
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */
export default class InvalidHexColorError extends Error {
  constructor(hexColor) {
    super(`Invalid hex color provided: "${hexColor}"`)
    this.name = 'InvalidHexColorError'
  }
}
