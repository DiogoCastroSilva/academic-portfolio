import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const CONTENT_SOURCES = [
  {
    src: "libs/projects/src/md",
    dest: "apps/main/public/projects",
  },
  {
    src: "libs/publications/src/md",
    dest: "apps/main/public/publications",
  },
];

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
]);

function isContentImage(filename) {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

for (const { src, dest } of CONTENT_SOURCES) {
  const srcDir = path.join(root, src);
  const destDir = path.join(root, dest);

  fs.mkdirSync(destDir, { recursive: true });

  if (!fs.existsSync(srcDir)) {
    continue;
  }

  const copied = new Set();

  for (const file of fs.readdirSync(srcDir)) {
    if (!isContentImage(file)) {
      continue;
    }
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    copied.add(file);
  }

  for (const file of fs.readdirSync(destDir)) {
    if (file === ".gitkeep" || !isContentImage(file)) {
      continue;
    }
    if (!copied.has(file)) {
      fs.unlinkSync(path.join(destDir, file));
    }
  }

  const names = [...copied].sort().join(", ") || "(none)";
  console.log(`Synced ${path.relative(root, destDir)}: ${names}`);
}
