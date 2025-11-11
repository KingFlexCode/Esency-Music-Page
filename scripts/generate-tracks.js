// scripts/generate-tracks.js
import fs from "fs";
import path from "path";
import { parseFile } from "music-metadata";
import sharp from "sharp";

const musicDir = path.resolve("./assets/music");
const coverDir = path.resolve("./assets/covers");
const outputFile = path.join(musicDir, "tracks.json");

// ensure dirs exist
if (!fs.existsSync(musicDir)) {
  console.error("❌ Music folder not found:", musicDir);
  process.exit(1);
}
if (!fs.existsSync(coverDir)) {
  fs.mkdirSync(coverDir, { recursive: true });
  console.log("📁 Created missing covers folder:", coverDir);
}

// simple sanitizer: lowercase + replace spaces & special chars with "-"
function sanitizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-") // only letters, numbers, dot, dash
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const supportedFormats = [".mp3", ".m4a", ".wav"];
const audioFiles = fs
  .readdirSync(musicDir)
  .filter(f => supportedFormats.includes(path.extname(f).toLowerCase()));

const tracks = [];

for (const file of audioFiles) {
  const fullPath = path.join(musicDir, file);
  const baseName = path.parse(file).name;
  const sanitizedBase = sanitizeName(baseName);
  const ext = path.extname(file).toLowerCase();
  const newFileName = `${sanitizedBase}${ext}`;
  const newFilePath = path.join(musicDir, newFileName);

  // rename file if necessary
  if (file !== newFileName) {
    fs.renameSync(fullPath, newFilePath);
    console.log(`✏️  Renamed: ${file} → ${newFileName}`);
  }

  const coverPath = path.join(coverDir, `${sanitizedBase}.jpg`);
  let coverRelPath = `assets/covers/${sanitizedBase}.jpg`;

  try {
    const metadata = await parseFile(newFilePath);
    const { common = {}, format = {} } = metadata;

    const title =
      common.title ||
      baseName.replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const artist = common.artist || "Esency";
    const album = common.album || "Singles";

    const durationSeconds = Math.floor(format.duration || 0);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = String(durationSeconds % 60).padStart(2, "0");
    const duration = `${minutes}:${seconds}`;

    // === extract or compress cover ===
    if (!fs.existsSync(coverPath)) {
      const picture = common.picture?.[0];
      if (picture?.data) {
        await sharp(picture.data)
          .resize(500, 500, { fit: "cover" })
          .jpeg({ quality: 80 })
          .toFile(coverPath);
        console.log(`🖼️  Extracted + compressed cover: ${sanitizedBase}.jpg`);
      } else {
        coverRelPath = "assets/covers/default.jpg";
      }
    } else {
      const buffer = await sharp(coverPath)
        .resize(500, 500, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer();
      fs.writeFileSync(coverPath, buffer);
      console.log(`🎨 Compressed existing cover: ${sanitizedBase}.jpg`);
    }

    tracks.push({
      title,
      artist,
      album,
      duration,
      file: `assets/music/${newFileName}`,
      cover: coverRelPath
    });

    console.log(`🎵 Processed: ${title} (${duration})`);
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
  }
}

tracks.sort((a, b) => a.title.localeCompare(b.title));
fs.writeFileSync(outputFile, JSON.stringify(tracks, null, 2));
console.log(`\n✅ ${tracks.length} tracks written to ${outputFile}`);





//run this command in terminal to auto generate music track.json
// node scripts/generate-tracks.js
