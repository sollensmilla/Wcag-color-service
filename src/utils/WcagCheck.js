export default class WcagCheck {
  constructor (foreground, background, { level = 'AA', isLargeText = false } = {}) {
    this.foreground = foreground
    this.background = background
    this.level = level
    this.isLargeText = isLargeText
  }
}
