const fs = require('fs');
const path = require('path');

function fixDynamic(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fixDynamic(fullPath);
    } else if (entry.isFile() && entry.name === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      const regex = /export const dynamic\s*=\s*"\s*force-dynamic";/g;
      if (regex.test(content)) {
        content = content.replace(regex, 'export const dynamic = "force-dynamic";');
        fs.writeFileSync(fullPath, content);
        console.log('Fixed dynamic export in', fullPath);
      }
    }
  }
}

fixDynamic(path.join(__dirname, 'src', 'app'));
