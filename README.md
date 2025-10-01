# WCAG Color Service

[![npm version](https://img.shields.io/npm/v/wcag-color-service.svg)](https://www.npmjs.com/package/wcag-color-service)
[![npm downloads](https://img.shields.io/npm/dm/wcag-color-service.svg)](https://www.npmjs.com/package/wcag-color-service)
WCAG Color Service is a lightweight JavaScript library designed to help developers generate accessible color palettes that meet [WCAG 2.1](https://www.w3.org/TR/WCAG21/) contrast guidelines.  
It simplifies the process of finding suitable complementary colors in a nice palette while still being accessible and easy to read.

---

## Features
- Generate WCAG-compliant color palettes automatically from only one hex-color
- Support for multiple WCAG levels (AA, AAA)
- Handles both normal text and large text accessibility
- Small, dependency-free, and easy to integrate
- Modular structure for flexibility and clarity

---

## Installation

Install via npm:

```bash
npm install wcag-color-service
```
## Usage

```bash
import { WcagColorService } from 'wcag-color-service'

const service = new WcagColorService()

const palette = service.generatePalette({
  basecolor: '#3498db',
  level: 'AA',
  isLargeText: false
})

console.log(palette)
```

### Example output:
```bash
{
  base: '#3498db',
  lighter: '#66b3ff',
  darker: '#2673b8'
}
```
## Supported Environments
|Requirement| Version   |
|-----------|-----  |
|Node.js	| >=18.x|
|npm	    | >=9.x. |
|Language   | JavaScript (ES Modules)|

## Project Structure
```bash
wcag-color-service/
├── index.js               # Entry point for the library
├── package.json
├── src/
    ├── WcagColorService.js        # Main service class
    ├── errors/
    │   └── NoAccessibleColorError.js
    └── utils/
        ├── ColorConverter.js
        ├── ColorVariantRequest.js
        └── WcagCheck.js
 ```

## Public API(for library users)

These are the only files and classes you should interact with:

- WcagColorService (main class)

- NoAccessibleColorError (error handling)

Everything inside utils/ is considered internal and should not be accessed directly.

## Testing

This project has been **manually tested**. 
You can read the detailed test reports here: [Test Report](./docs/test-report.md)

## Bug Reports & Issues

If you encounter a bug or want to request a new feature:

- Create a GitHub issue

- Describe the problem clearly

- Include steps to reproduce and, if possible, example code

For known issues, see [Bug Report](./docs/bug-report.md)

## Versioning

This project uses Semantic Versioning (SemVer).

| Versionm Type | Example     | When To Use|
|---------------|-------------| ---------|
| PATCH         |1.0.0 → 1.0.1| Bug fixes, no breaking changes   |
| MINOR         |1.0.0 → 1.1.0| New features, backwards compatible|
| MAJOR         |1.0.0 → 2.0.0| Breaking changes                  |

Current version: **1.0.0**

## Contributing

We welcome contributions from the community!
Before contributing, please read the [Contributing Guidelines](./docs/contributing-guidelines.md)

**How to contribute:**
1. Fork the repository

2. Create a new branch (git checkout -b feature/new-feature)

3. Make your changes

4. Write tests if needed

5. Submit a pull request

## License
This project is licensed under the MIT License.
See [LICENSE](./LICENSE) for full details.

## Additional Documentation

- [Test Report](./docs/test-report.md)

- [Bug Report](./docs/bug-report.md)

- [Contributing Guidelines](./docs/contributing-guidelines.md)

## Summary for Developers

- **Easy to use:** Only import WcagColorService and NoAccessibleColorError.

- **Internal logic is hidden:** The utils/ folder is private and should not be modified.

- **Clear structure:** Public API and internal files are separated.

- **Accessible first:** Built with WCAG compliance at the core.

---
Made with ❤️ for accessible design.