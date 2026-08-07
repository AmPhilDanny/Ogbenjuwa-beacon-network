// Ensures www/ points at the real static site (public/) so Cordova
// prepares/loads the actual app. Uses a Windows directory junction so
// there is a single source of truth and no duplicate copy to drift.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const www = path.join(root, 'www');
const public = path.join(root, 'public');

if (!fs.existsSync(public)) {
  console.error('public/ not found. Run this from the user_app project root.');
  process.exit(1);
}

function isJunction(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

if (!fs.existsSync(www) || !isJunction(www)) {
  if (fs.existsSync(www)) {
    fs.rmSync(www, { recursive: true, force: true });
  }
  execFileSync('cmd', ['/c', 'mklink', '/J', www, public], { stdio: 'inherit' });
  console.log('Created www junction -> public');
} else {
  console.log('www junction already exists -> public');
}