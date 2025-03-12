# Project Brief

## Objectives
1. Showcase artistic portfolio through structured galleries
2. Streamline commission request process
3. Document convention participation history
4. Maintain consistent branding across pages

## Content Strategy
- **Portfolio**: Organized by art type (chibi, illustrations, emotes)
- **Commissions**: Clear pricing tiers + examples
- **Conventions**: Chronological catalog with artifacts
- **Assets**: Managed through automated manifest system

## Technical Requirements
- **Core Stack**: HTML5 / CSS3 / JavaScript ES6+
- **Styling**: Tailwind CSS v3.3 with custom config
- **Build Tools**: npm scripts + generate-manifest.js
- **Performance**: 
  - Image optimization pipelines
  - Lazy loading for galleries
  - Critical CSS inlining

## Key Features
- Component-based architecture (header/footer)
- Responsive grid layouts
- Client-side image manifest system
- Convention timeline with filterable entries
- Commission calculator (future phase)

## Pages
### Public Pages
| Page | Purpose | Status |
|------|---------|--------|
| `index.html` | Landing + featured work | Live |
| `portfolio.html` | Categorized galleries | Needs tagging system |
| `commissions.html` | Price guides + TOS | Requires form integration | 
| `conventions.html` | Event archive | Partial catalog |

## Governance
- Content updates via JSON schemas
- Atomic design pattern compliance
- Automated accessibility checks (WIP)
