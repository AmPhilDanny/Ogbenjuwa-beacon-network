import fs from 'fs';
import path from 'path';

const root = path.resolve('server/dist');
const fileRegexp = /\b(from|export\s+\*\s+from|export\s+\{[^}]*\}\s+from)\s+(['"])(\.\.?\/[^'"\n]+?)\2/g;

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  const updated = content.replace(fileRegexp, (match, prefix, quote, importPath) => {
    const ext = path.extname(importPath);
    if (ext) {
      return match;
    }

    if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
      return match;
    }

    const absoluteTarget = path.resolve(path.dirname(filePath), importPath);
    const jsTarget = `${absoluteTarget}.js`;
    const indexJsTarget = path.join(absoluteTarget, 'index.js');

    if (fs.existsSync(jsTarget)) {
      changed = true;
      return `${prefix} ${quote}${importPath}.js${quote}`;
    }
    if (fs.existsSync(indexJsTarget)) {
      changed = true;
      return `${prefix} ${quote}${importPath}/index.js${quote}`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const resolved = path.join(dir, name);
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      walk(resolved);
    } else if (stat.isFile() && resolved.endsWith('.js')) {
      processFile(resolved);
    }
  }
}

console.log('Fixing relative JS imports in server/dist...');
walk(root);
console.log('Done.');
