const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const folders = ['src/pages', 'src/components'];
folders.forEach(folder => {
  walkDir(path.join(__dirname, folder), function(filePath) {
    if (filePath.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Specifically target known currency formats in our codebase
      let newContent = content
        .replace(/>\$/g, '>₹')
        .replace(/:\s\$/g, ': ₹')
        .replace(/>-\$/g, '>-₹')
        .replace(/:\s-\$/g, ': -₹')
        .replace(/>\$\$\{/g, '>₹${')
        .replace(/:\s\$\$\{/g, ': ₹${')
        .replace(/>-\$\$\{/g, '>-₹${')
        .replace(/:\s-\$\$\{/g, ': -₹${')
        .replace(/<span className="input-group-text">\$<\/span>/g, '<span className="input-group-text">₹</span>')
        // Special catch for Deal Kanban total
        .replace(/Total:\s\$\$\{/g, 'Total: ₹${')
        .replace(/Total:\s\$\{/g, 'Total: ₹${') // If mistakenly just ${ in text
        // Specific catches for table cells
        .replace(/<td className="text-success">\$<td className="text-danger">\$<td className="fw-bold text-success">\$<td className="text-danger">-\$/g, '₹');
        
      newContent = newContent.replace(/<td className="text-success">(\$)/g, '<td className="text-success">₹')
                             .replace(/<td className="text-danger">(\$)/g, '<td className="text-danger">₹')
                             .replace(/<td className="fw-bold text-success">(\$)/g, '<td className="fw-bold text-success">₹')
                             .replace(/<td className="text-danger">-\$/g, '<td className="text-danger">-₹')
                             .replace(/<div className="fw-bold text-success">\$<strong className="fs-5">\$<span className="text-danger">-\$/g, '₹')
                             .replace(/<div className="fw-bold text-success">(\$)/g, '<div className="fw-bold text-success">₹')
                             .replace(/<strong className="fs-5">(\$)/g, '<strong className="fs-5">₹')
                             .replace(/<span className="text-danger">-\$/g, '<span className="text-danger">-₹')
                             .replace(/<span>(\$)/g, '<span>₹')
                             .replace(/<span>-\$/g, '<span>-₹');
                             
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log('Fixed currency in', filePath);
      }
    }
  });
});
