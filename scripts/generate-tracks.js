// scripts/generate-tracks.js
import fs from "fs";
import path from "path";
import { parseFile } from "music-metadata";
import sharp from "sharp";

const musicDir = path.resolve("./assets/music");
const coverDir = path.resolve("./assets/covers");
const outputFile = path.join(musicDir, "tracks.json");

if (!fs.existsSync(musicDir)) {
  console.error("❌ Music folder not found:", musicDir);
  process.exit(1);
}
if (!fs.existsSync(coverDir)) {
  fs.mkdirSync(coverDir, { recursive: true });
  console.log("📁 Created missing covers folder:", coverDir);
}

const supportedFormats = [".mp3", ".m4a", ".wav"];
const audioFiles = fs
  .readdirSync(musicDir)
  .filter(f => supportedFormats.includes(path.extname(f).toLowerCase()));

const tracks = [];

for (const file of audioFiles) {
  const fullPath = path.join(musicDir, file);
  const baseName = path.parse(file).name;
  const coverPath = path.join(coverDir, `${baseName}.jpg`);
  let coverRelPath = `../assets/covers/${baseName}.jpg`;

  try {
    const metadata = await parseFile(fullPath);
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

    // === Extract and compress cover art ===
    if (!fs.existsSync(coverPath)) {
      const picture = common.picture?.[0];
      if (picture?.data) {
        // write and compress embedded art
        await sharp(picture.data)
          .resize(500, 500, { fit: "cover" })
          .jpeg({ quality: 80 })
          .toFile(coverPath);
        console.log(`🖼️  Extracted + compressed cover art for: ${title}`);
      } else {
        coverRelPath = "../assets/covers/default.jpg";
      }
    } else {
      // compress existing external cover
      const buffer = await sharp(coverPath)
        .resize(500, 500, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer();
      fs.writeFileSync(coverPath, buffer);
      console.log(`🎨 Compressed existing cover: ${baseName}.jpg`);
    }

    tracks.push({
      title,
      artist,
      album,
      duration,
      file: `../assets/music/${file}`,
      cover: coverRelPath,
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
