export default class InvalidHexColorError extends Error {
  constructor(hexColor) {
    super(`Invalid hex color provided: "${hexColor}"`)
    this.name = 'InvalidHexColorError'
  }
}
