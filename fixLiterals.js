const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walkSync(filepath, filelist);
    } else if (filepath.endsWith('.jsx') || filepath.endsWith('.js')) {
      filelist.push(filepath);
    }
  }
  return filelist;
};

const files = walkSync(path.join(__dirname, 'frontend/src'));
let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  newContent = newContent.replace(/Bearer ₹\{/g, 'Bearer ${');
  newContent = newContent.replace(/`badge ₹\{/g, '`badge ${');
  newContent = newContent.replace(/badge rounded-pill ₹\{/g, 'badge rounded-pill ${');
  newContent = newContent.replace(/text-dark ₹\{/g, 'text-dark ${');

  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    changedFiles++;
    console.log('Fixed literals in:', file);
  }
}

console.log(`Fixed ${changedFiles} files.`);
