const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "public", "images");

// filename -> max width (px). Images are displayed well under these sizes;
// downscaling avoids serving multi-megapixel source files to the optimizer.
const maxWidths = {
  "Anarkali_Suit.png": 900,
  "Chikankari-kurti.png": 900,
  "Nehru-Waistcoat.png": 900,
  "Pathani_Suit.png": 900,
  "Sherwani_Hero.png": 1400,
  "Wedding-Collection-Hero.png": 1400,
  "Logo.png": 800,
  "Logo-icon.png": 200,
};

(async () => {
  const files = fs.readdirSync(dir).filter((f) => /\.png$/i.test(f));
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const before = fs.statSync(filePath).size;
    totalBefore += before;

    const maxWidth = maxWidths[file];
    const meta = await sharp(filePath).metadata();

    let pipeline = sharp(filePath);
    if (maxWidth && meta.width && meta.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth });
    }

    const buffer = await pipeline.webp({ quality: 82 }).toBuffer();

    const outPath = filePath.replace(/\.png$/i, ".webp");
    fs.writeFileSync(outPath, buffer);
    fs.unlinkSync(filePath);
    const after = buffer.length;
    totalAfter += after;

    console.log(
      `${file} -> ${path.basename(outPath)}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`,
    );
  }

  console.log(
    `\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB`,
  );
})();
