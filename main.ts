// Emberfall Clash hand-in: copies the static game and its screenshots into the
// output directory, then writes the dossier the scorer rebuilds and compares.
// Runs on Node 22 with the standard library only; MAKEFUN_OUTPUT_DIR stands in
// for /output outside the grader.
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Fail loudly before copying anything when a required input directory is absent,
// so a broken repository never produces a half-written output tree.
for (const required of ["game", "screenshots"]) {
  if (!existsSync(join(repoRoot, required))) {
    throw new Error("Emberfall Clash hand-in: missing " + required + "/ beside main.ts");
  }
}

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "game"), join(outputDir, "game"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(outputDir, "screenshots"), { recursive: true });

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
console.log("Emberfall Clash: wrote game/, screenshots/ and dossier.json to " + outputDir);
