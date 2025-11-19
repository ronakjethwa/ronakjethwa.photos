const sharp = require("sharp");
const fs = require("fs");

module.exports = (eleventyConfig) => {
    eleventyConfig.addShortcode("respimg", (data) => {
        const extRegex = /[^.]+$/gm;
        const fileRegex = /^\w+[^.]+/gm;
        const imgFormats = [
            "png",
            "jpg",
            "jpeg",
            "webp",
            "avif"
        ];
        const reqArgs = [
            "src",
            "alt",
            "inputDir",
            "imgDir",
            "widths",
            "sizes",
            "width",
            "height"
        ];
        let format = data.src.match(extRegex);
        let fileNameArr = data.src.match(fileRegex);

        for (const prop of reqArgs) {
            if (typeof data[prop] == 'undefined') {
                throw new Error(`Missing '${prop}' argument`);
            }
        }

        if (!imgFormats.includes(format[0])) {
            throw new Error("Invalid image format: Accepted formats are png, jpg, jpeg, avif, webp");
        }

        let widths = data.widths
            .sort((a, b) => b - a)
            .map(w => {
                return typeof w == 'string' ? parseInt(w, 10) : w;
            });

        function bytesToKB(bytes) {
            const kbRatio = 1 * Math.pow(10, -3);
            return (bytes * kbRatio).toFixed(2);
        }

        function jpeg(stream, file, width) {
            return stream
                .clone()
                .jpeg({ quality: data.quality ? data.quality : 85 })
                .resize({ width: width })
                .toFile(`${data.inputDir}${data.imgDir}${file}-${width}.jpeg`)
                .then((sharpObj) => {
                    sharpObj.file = `${data.inputDir}${data.imgDir}${file}-${width}.jpeg`;
                    sharpObj.size = `${bytesToKB(sharpObj.size)} KB`;
                    sharpObj.quality = data.quality ? data.quality : 85;
                    data.debug ? console.log(sharpObj) : null;
                })
                .catch((err) => {
                    console.log(`Error transforming ${data.inputDir}${data.imgDir}${data.src}`, err);
                })
        };

        function webp(stream, file, width) {
            return stream
                .clone()
                .webp({ quality: data.quality ? data.quality : 85 })
                .resize({ width: width })
                .toFile(`${data.inputDir}${data.imgDir}${file}-${width}.webp`)
                .then((sharpObj) => {
                    sharpObj.file = `${data.inputDir}${data.imgDir}${file}-${width}.webp`;
                    sharpObj.size = `${bytesToKB(sharpObj.size)} KB`;
                    sharpObj.quality = data.quality ? data.quality : 85;
                    data.debug ? console.log(sharpObj) : null;
                })
                .catch((err) => {
                    console.log(`Error transforming ${data.inputDir}${data.imgDir}${data.src}`, err);
                })
        };

        function avif(stream, file, width) {
            return stream
                .clone()
                .avif({ quality: data.quality ? data.quality : 85 })
                .resize({ width: width })
                .toFile(`${data.inputDir}${data.imgDir}${file}-${width}.avif`)
                .then((sharpObj) => {
                    sharpObj.file = `${data.inputDir}${data.imgDir}${file}-${width}.avif`;
                    sharpObj.size = `${bytesToKB(sharpObj.size)} KB`;
                    sharpObj.quality = data.quality ? data.quality : 85;
                    data.debug ? console.log(sharpObj) : null;
                })
                .catch((err) => {
                    console.log(`Error transforming ${data.inputDir}${data.imgDir}${data.src}`, err);
                })
        };

        function transform(img) {
            let filenameArr = img.match(fileRegex);
            let filename = filenameArr[0];
            let stream = sharp(`${data.inputDir}${data.imgDir.concat(img)}`);

            widths.forEach((width) => {
                jpeg(stream, filename, width);
                webp(stream, filename, width);
                // AVIF disabled - Netlify's sharp version doesn't support AVIF encoding
                // if (data.formats && data.formats.includes('avif')) {
                //     avif(stream, filename, width);
                // }
            });
        };

        function markupGenerator(widths) {
            let filename = fileNameArr[0];
            let imgSrcSet = "";
            let webpSrcSet = "";

            widths.forEach((width) => {
                imgSrcSet += `${data.imgDir}${filename}-${width}.jpeg ${width}w, `;
                webpSrcSet += `${data.imgDir}${filename}-${width}.webp ${width}w, `;
            });

            const img =
                `<img 
                srcSet="${imgSrcSet.slice(0, imgSrcSet.length - 2)}"
                sizes="${data.sizes}"
                src="${data.imgDir}${fileNameArr}-${data.fallbackSrcWidth || widths[0]}.jpeg"
                alt="${data.alt}"
                loading="${data.loading || 'lazy'}"
                class="${data.className ? data.className : ''}"
                width="${data.width}"
                height="${data.height}" ${data.id ? `id='${data.id}'` : ''}>`;

            const sources = `<source 
                    type="image/webp"
                    srcSet="${webpSrcSet.slice(0, imgSrcSet.length - 2)}"
                    sizes="${data.sizes}"
                >`;

            const picture =
                `<picture>
                ${sources}
                ${img}
            </picture>`;

            return picture;
        };

        function generator(widths) {
            let fileObj = {};
            let filename = fileNameArr[0];
            widths.forEach((width) => {
                fileObj[`${width}_jpeg`] = `${data.inputDir}${data.imgDir}${filename}-${width}.jpeg`;
                fileObj[`${width}_webp`] = `${data.inputDir}${data.imgDir}${filename}-${width}.webp`;
            });
            return fileObj;
        }

        const html = markupGenerator(widths);
        const files = generator(widths);
        const fileArrSize = Object.keys(files).length;
        let srcFileExists = fs.existsSync(`${data.inputDir}${data.imgDir.concat(data.src)}`);
        let fileExistsCount = 0;

        if (srcFileExists) {
            for (const name in files) {
                if (fs.existsSync(files[name])) {
                    fileExistsCount += 1;
                }
            }
            console.log(`Checking images for ${data.src}. Expected: ${fileArrSize}, Found: ${fileExistsCount}`);
            for (const name in files) {
                if (!fs.existsSync(files[name])) {
                    console.log(`Missing: ${files[name]}`);
                }
            }

            // Logic to check if we need to regenerate
            // Simplified: if any file missing, regenerate all (or just call transform which overwrites)
            if (
                !data.overwrite && fileExistsCount !== fileArrSize ||
                data.overwrite && fileExistsCount == fileArrSize
            ) {
                transform(data.src);
                console.log(`Generating responsive images for '${data.inputDir}${data.imgDir}${data.src}'`);
            }
        } else {
            throw new Error(`Image doesn't exist! Cannot locate ${data.inputDir}${data.imgDir.concat(data.src)}`);
        }
        return html;
    });
};
