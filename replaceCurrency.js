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

  // Replace $ followed by { (when it's JSX text like <td>${value}</td>)
  // But wait, template literals also use ${...}. We shouldn't replace those.
  // How to differentiate? Template literals are inside backticks: `...${...}...`
  // A simple hack for this project is to replace only specific known instances of $
  
  // 1. >$
  newContent = newContent.replace(/>\$/g, '>₹');
  // 2. >-$
  newContent = newContent.replace(/>-\$/g, '>-₹');
  // 3. "$
  newContent = newContent.replace(/"\$/g, '"₹');
  // 4. ' $'
  newContent = newContent.replace(/ \$/g, ' ₹');
  // 5. '>$'
  newContent = newContent.replace(/>\$/g, '>₹');

  // Let's also fix the specific occurrences we saw in the grep:
  newContent = newContent.replace(/\$ \{(deals\.reduce)/g, '₹ {$1');
  newContent = newContent.replace(/>\$\{(deals\.reduce)/g, '>₹{$1');

  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    changedFiles++;
    console.log('Updated currency in:', file);
  }
}

console.log(`Updated ${changedFiles} files with ₹ currency symbol.`);
