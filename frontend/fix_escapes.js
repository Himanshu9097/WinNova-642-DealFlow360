const fs = require('fs');
const path = require('path');

const files = [
  'src/app/deals/[id]/page.tsx',
  'src/app/customer/quote/[token]/page.tsx',
  'src/app/page.tsx',
  'src/app/deals/page.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(fullPath, content);
  console.log('Fixed', file);
});
