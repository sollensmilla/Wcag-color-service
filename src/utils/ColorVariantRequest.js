export default class ColorVariantRequest {
  constructor(basecolor) {
    this.basecolor = basecolor
    this.level = 'AA'
    this.isLargeText = false
    this.direction = 'lighten'
  }

  withLevel(level) {
    this.level = level
    return this
  }

  withLargeText(isLargeText) {
    this.isLargeText = isLargeText
    return this
  }

  withDirection(direction) {
    this.direction = direction
    return this
  }
}