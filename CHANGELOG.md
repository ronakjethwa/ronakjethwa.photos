# Changelog

## [1.0.2] - 2025-04-13
### Added
- Added support for `meta_keywords` and `meta_robots` fields in `feature.njk` and `gallery.njk` for better SEO.
- Updated `base.njk` to dynamically render `meta_keywords` and `meta_robots` meta tags.

### Updated
- Improved accessibility by ensuring all images have descriptive `alt` attributes.
- Implemented lazy loading for images in relevant `.njk` files to enhance performance.
- Minified inline CSS in `index.njk` for performance optimization.

### Fixed
- Ensured that `404.md` and `index.njk` source files reflect changes made to their corresponding HTML files in `_site/`.

### Notes
- Added `_site/` to `.gitignore` to prevent build artifacts from being tracked in the repository.

## [1.0.1] - 2025-04-13
### Added
- SEO enhancements: Added meta tags and canonical links.
- Image optimization: Implemented lazy loading and compressed images.
- Accessibility improvements: Reviewed and updated `alt` attributes and added ARIA roles.
- Performance optimization: Minified CSS, JavaScript, and HTML files.

### Updated
- README.md with detailed setup, usage, and contribution guidelines.