/**
 * Gobble Run — entry hand-in program.
 *
 * Copies game/ and screenshots/ from this repository into the output
 * directory (MAKEFUN_OUTPUT_DIR outside the grader, /output inside it)
 * and writes /output/dossier.json with buildDossier from the kit's
 * vendor/makefun-game.ts. Standard library only; no network, no secrets.
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 48 * 1024 * 1024,
  game_path_max_bytes: 1000
} as const;

function copyTree(sourceDir: string, targetDir: string): void {
  if (!existsSync(sourceDir)) {
    throw new Error(`main.ts: missing ${sourceDir}`);
  }
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true, dereference: false });
}

function handIn(): void {
  // Start from a clean directory so a stale file can never leak into a run:
  // the grader runs this program twice and both runs must write the same bytes.
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyTree(join(REPO_ROOT, 'game'), join(OUTPUT_DIR, 'game'));
  copyTree(join(REPO_ROOT, 'screenshots'), join(OUTPUT_DIR, 'screenshots'));
  const dossier = buildDossier(OUTPUT_DIR, DOSSIER_CAPS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
  console.log(`gobble-run: wrote ${OUTPUT_DIR} (dossier.json ${dossier.length} bytes)`);
}

handIn();
