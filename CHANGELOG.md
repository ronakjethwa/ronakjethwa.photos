# Changelog

## [1.1.3] - 2025-04-13
### Updated
- Generalized `text-decoration: auto` for all hyperlinks globally in the CSS.
- Removed redundant and duplicate styles from `style.css` to improve maintainability.

### Notes
- Verified that the changes do not affect the visual consistency of the site.

## [1.1.2] - 2025-04-13
### Fixed
- Resolved issue where the homepage was being generated under `/templates/` instead of the root directory.
- Deleted redundant `templates/index.html` file.

### Notes
- Verified that the homepage now correctly generates as `_site/index.html` and works without `/templates/` in the URL path.

## [1.1.1] - 2025-04-13
### Updated
- Improved folder structure by organizing CSS, images, and favicons under `_site/_includes`.
- Removed unused `email.js` file.
- Updated `.eleventy.js` to align passthrough copy and output directory with the new folder structure.
- Updated `CONTRIBUTING.md` and `CHANGELOG.md` to reflect folder structure changes.

### Fixed
- Resolved `TypeError: Cannot read properties of undefined (reading 'getWithTTL')` by verifying dependencies and external scripts.

### Notes
- Verified successful build and deployment after folder structure changes.

## [1.0.6] - 2025-04-13
### Fixed
- Removed preload directives for `apple-touch-icon.png`, `favicon-32x32.png`, and `style.css` in `base.njk` to resolve warnings about unused preloaded resources.

### Updated
- Refactored folder structure: CSS, images, and favicons are now organized under `_site/_includes` for better maintainability.

## [1.0.5] - 2025-04-13
### Fixed
- Resolved MIME type issue for `style.css` by updating Eleventy configuration to include `src/_includes/css` in passthrough copy.

## [1.0.4] - 2025-04-13
### Updated
- Removed gzip compression configuration from `netlify.toml` to avoid deployment issues.
- Fixed accessibility issue in the footer by ensuring all links have proper underline decoration.

## [1.0.3] - 2025-04-13
### Added
- Enabled Brotli compression in `netlify.toml` for better performance.
- Added preload links for critical resources (images and CSS) in `base.njk`.

### Updated
- Ensured lazy loading is applied to all images in `home-gallery.njk`.
- Updated `sitemap.xml` to include the gallery page.
- Updated `robots.txt` to allow crawling of the gallery and disallow private directories.

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