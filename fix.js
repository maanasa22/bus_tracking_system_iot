const fs = require('fs');
const path = require('path');

function fix(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      fix(p);
    } else if (f === 'page.tsx') {
      let c = fs.readFileSync(p, 'utf8');
      if (c.startsWith('export const dynamic = " force-dynamic;\r\n') || c.startsWith('export const dynamic = " force-dynamic;\n')) {
        c = c.replace('export const dynamic = " force-dynamic;\r\n', 'export const dynamic = "force-dynamic";\n');
        c = c.replace('export const dynamic = " force-dynamic;\n', 'export const dynamic = "force-dynamic";\n');
        fs.writeFileSync(p, c);
        console.log('Fixed', p);
      }
    }
  }
}

fix('src/app/(admin)');
