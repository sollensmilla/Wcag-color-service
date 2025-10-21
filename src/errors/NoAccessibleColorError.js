export default class NoAccessibleColorError extends Error {
  constructor(baseColor, direction) {
    super(`No accessible ${direction} variant found for ${baseColor}`)
    this.name = 'NoAccessibleColorError'
  }
}
