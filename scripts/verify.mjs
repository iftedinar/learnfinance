import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "package.json",
  "app/layout.tsx",
  "app/page.tsx",
  "app/api/process-content/route.ts",
  "app/api/export/route.ts",
  "database/schema.sql",
  "README.md",
  ".env.example"
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`Missing required files: ${missing.join(", ")}`);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const dependency of ["next", "react", "typescript", "tailwindcss"]) {
  if (!pkg.dependencies?.[dependency] && !pkg.devDependencies?.[dependency]) {
    console.error(`Missing package dependency: ${dependency}`);
    process.exit(1);
  }
}

const schema = fs.readFileSync(path.join(root, "database/schema.sql"), "utf8");
for (const table of ["youtube_sources", "channels", "videos", "video_chunks", "strategies", "saved_notes"]) {
  if (!schema.includes(`public.${table}`)) {
    console.error(`Missing schema table: ${table}`);
    process.exit(1);
  }
}

console.log("Project scaffold verification passed.");
