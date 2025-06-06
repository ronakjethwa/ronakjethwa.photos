const CleanCSS = require("clean-css");
const { minify } = require("terser");
const metagen = require("eleventy-plugin-metagen");
const respimg = require("eleventy-plugin-sharp-respimg");
const eleventyNavigation = require("@11ty/eleventy-navigation");

module.exports = (eleventyConfig) => {
   
    eleventyConfig.addPlugin(metagen);
    eleventyConfig.addPlugin(respimg);
    eleventyConfig.addPlugin(eleventyNavigation);
    
    eleventyConfig.setTemplateFormats([
        "md",
        "njk"
    ]);

    markdownTemplateEngine: "njk";

    // Perform manual passthrough file copy to include directories in the build output _site
    eleventyConfig.addPassthroughCopy("./src/images");
    eleventyConfig.addPassthroughCopy("./src/photos");
    eleventyConfig.addPassthroughCopy("./src/css");
    eleventyConfig.addPassthroughCopy("./src/js");
    eleventyConfig.addPassthroughCopy("./src/favicon_data");
    eleventyConfig.addPassthroughCopy({ "src/_includes/css": "css" });

    // Updated passthrough copy and output directory to align with the new folder structure
    eleventyConfig.addPassthroughCopy({
        "src/_includes/images": "_site/_includes/images",
        "src/_includes/favicons": "_site/_includes/favicons"
    });

    // Create css-clean CSS Minifier filter
    eleventyConfig.addFilter("cssmin", function(code) {
        return new CleanCSS({}).minify(code).styles;
    });

    // Create terser JS Minifier async filter (Nunjucks)
    eleventyConfig.addNunjucksAsyncFilter("jsmin", async function (
        code,
        callback
    )   {
        try {
            const minified = await minify(code);
            callback(null, minified.code);
        } catch (err) {
            console.log(`Terser error: ${err}`);
            // Fail gracefully
            callback(null, code);
        }
    });

    // Configure image in a template paired shortcode
    eleventyConfig.addPairedShortcode("image", (srcSet, src, alt, sizes="(min-width: 400px) 33.3vw, 100vw") => {
        return `<img srcset="${srcSet}" src="${src}" alt="${alt}" sizes="${sizes}" />`;
    });

    // Configure outgoing Pexels anchor elements in a template paried shortcode
    eleventyConfig.addPairedShortcode("link", (href, cls="image-link", rel="noopener", target="_blank", btnTxt="Pexels") => {
        return `<a class="${cls}" href="${href}" rel="${rel}" target="${target}">${btnTxt}</a>`;
    });

    // get the current year to be placed in the footer
    eleventyConfig.addShortcode("getYear", function() {
        const year = new Date().getFullYear();
        return `${year}`;
    });
    
    // Ensure the homepage is generated correctly
    return {
        dir: {
            input: "src",
            includes: "_includes",
            layouts: "_includes/layouts",
            output: "_site"
        },
        templateFormats: ["njk", "md", "html"],
        passthroughFileCopy: true
    };
};