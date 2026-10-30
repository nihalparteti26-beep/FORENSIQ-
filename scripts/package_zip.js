import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ZIP_PATH = path.join(ROOT_DIR, 'FORENSIQ-Brand-Intelligence-OS-Round3.zip');
const STAGE_DIR = path.join(ROOT_DIR, 'dist_stage');

if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
if (fs.existsSync(STAGE_DIR)) fs.rmSync(STAGE_DIR, { recursive: true, force: true });
fs.mkdirSync(STAGE_DIR, { recursive: true });

const itemsToCopy = [
  'app',
  'components',
  'lib',
  'public',
  'samples',
  'scripts',
  'tests',
  'data',
  'package.json',
  'package-lock.json',
  'README.md',
  'server.js',
  'test_all.js',
  'test_compiler.js',
  'tsconfig.json',
  '.env.example',
  '.gitignore'
];

for (const item of itemsToCopy) {
  const src = path.join(ROOT_DIR, item);
  const dest = path.join(STAGE_DIR, item);
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
  }
}

// Create ZIP using PowerShell .NET ZipFile
const psCmd = `powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${STAGE_DIR.replace(/\\/g, '/')}', '${ZIP_PATH.replace(/\\/g, '/')}')"`;
execSync(psCmd);

// Clean up staging dir
fs.rmSync(STAGE_DIR, { recursive: true, force: true });

const stats = fs.statSync(ZIP_PATH);
console.log(`Created ZIP package: ${ZIP_PATH} (${stats.size} bytes)`);
