import fs from 'fs';
if (!fs.existsSync('dist/index.html')) {
  console.error('Build failed: dist/index.html not found');
  process.exit(1);
}
console.log('Build OK: dist/index.html');
