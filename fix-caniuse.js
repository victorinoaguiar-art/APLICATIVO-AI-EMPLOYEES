const fs = require('fs');
const path = require('path');

const featuresFile = path.join(__dirname, 'node_modules', 'caniuse-lite', 'data', 'features.js');
const featuresDir = path.join(__dirname, 'node_modules', 'caniuse-lite', 'data', 'features');

if (fs.existsSync(featuresFile)) {
  const content = fs.readFileSync(featuresFile, 'utf8');
  const matches = content.matchAll(/require\("\.\/features\/([^"]+)"\)/g);
  let count = 0;
  for (const match of matches) {
    const featName = match[1];
    const featPath = path.join(featuresDir, `${featName}.js`);
    if (!fs.existsSync(featPath)) {
      fs.writeFileSync(featPath, 'module.exports = { A: {} };');
      count++;
    }
  }
  console.log(`Successfully fixed ${count} missing caniuse-lite feature files.`);
}
