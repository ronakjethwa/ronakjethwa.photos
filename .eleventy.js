const CleanCSS = require("clean-css");
const { minify } = require("terser");
const metagen = require("eleventy-plugin-metagen");
const eleventyImg = require("@11ty/eleventy-img");
const generateImage = eleventyImg.default;
const { generateHTML } = eleventyImg;
const path = require("path");
const eleventyNavigation = require("@11ty/eleventy-navigation");

module.exports = (eleventyConfig) => {
   
    eleventyConfig.addPlugin(metagen);
    eleventyConfig.addPlugin(eleventyNavigation);
    
    eleventyConfig.setTemplateFormats([
        "md",
        "njk"
    ]);

    markdownTemplateEngine: "njk";

    // Perform manual passthrough file copy to include directories in the build output _site
    eleventyConfig.addPassthroughCopy("./src/robots.txt");
    // Ship only the generated responsive variants. The full-size originals stay in
    // src/images for sharp to read at build time, but never need to reach the CDN.
    // NOTE: no passthrough for images. @11ty/eleventy-img writes the resized
    // variants straight into _site/images at build time. The full-size
    // originals stay in src/images as the source and never ship.
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

    // Responsive images via @11ty/eleventy-img.
    //
    // Replaces eleventy-plugin-sharp-respimg, which bundled its own Eleventy
    // 1.0.2 (the source of most of the repo's dependabot alerts) and fired
    // sharp without awaiting it, so Eleventy could exit before the files were
    // written. Builds only worked because the variants were committed.
    //
    // filenameFormat keeps the existing `<name>-<width>.<format>` scheme, so
    // every image URL already in the wild stays valid.
    const IMG_WIDTHS = [320, 480, 640, 1024];
    // Quality scales are NOT comparable across formats. At a shared 78, WebP came
    // out larger than the JPEG and AVIF larger still -- and since <source> wins the
    // <picture> negotiation, browsers downloaded the biggest file. Tuned per format.
    const JPEG_QUALITY = 78;
    const WEBP_QUALITY = 78;
    const AVIF_QUALITY = 55;

    eleventyConfig.addAsyncShortcode("respimg", async function (data) {
        const src = `./src/images/${data.src}`;
        const metadata = await generateImage(src, {
            widths: data.widths || IMG_WIDTHS,
            formats: ["avif", "webp", "jpeg"],
            outputDir: "./_site/images/",
            urlPath: "/images/",
            filenameFormat: (id, imgSrc, width, format) =>
                `${path.basename(imgSrc, path.extname(imgSrc))}-${width}.${format}`,
            sharpAvifOptions: { quality: AVIF_QUALITY },
            sharpWebpOptions: { quality: WEBP_QUALITY },
            sharpJpegOptions: { quality: JPEG_QUALITY, progressive: true },
        });

        return generateHTML(metadata, {
            alt: data.alt,
            sizes: data.sizes,
            class: data.className,
            loading: data.eager ? "eager" : "lazy",
            decoding: "async",
            ...(data.eager ? { fetchpriority: "high" } : {}),
        });
    });

    // Configure image in a template paired shortcode
    eleventyConfig.addPairedShortcode("image", (srcSet, src, alt, sizes="(min-width: 400px) 33.3vw, 100vw") => {
        return `<img srcset="${srcSet}" src="${src}" alt="${alt}" sizes="${sizes}" />`;
    });

    // Configure outgoing Pexels anchor elements in a template paried shortcode
    eleventyConfig.addPairedShortcode("link", (href, cls="image-link", rel="noopener", target="_blank", btnTxt="Pexels") => {
        return `<a class="${cls}" href="${href}" rel="${rel}" target="${target}">${btnTxt}</a>`;
    });

    // Largest generated variant for a source image, used for og:image.
    // eleventy-img never upscales, so an image narrower than 1024 has no 1024
    // variant (32.jpeg is 768px wide, 33.jpeg is 665px). Pick the widest
    // variant that actually exists for that source.
    eleventyConfig.addFilter("variant", function (src, sourceWidth) {
        const base = String(src).replace(/\.(jpe?g|png)$/i, "");
        const available = IMG_WIDTHS.filter((w) => !sourceWidth || w <= sourceWidth);
        const width = available.length ? Math.max(...available) : Math.min(...IMG_WIDTHS);
        return `${base}-${width}.jpeg`;
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