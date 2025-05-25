import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the dist directory exists
fs.ensureDirSync('dist');

// Copy CNAME file to dist directory
fs.copyFileSync('CNAME', path.join('dist', 'CNAME'));

console.log('✅ CNAME file copied to dist directory'); 