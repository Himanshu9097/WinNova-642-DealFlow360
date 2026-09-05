const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'backend/src/features/models');
const filesToUpdate = ['Customer.js', 'Deal.js', 'Product.js', 'Quotation.js', 'Requirement.js'];

filesToUpdate.forEach(file => {
  const filepath = path.join(modelsDir, file);
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Check if companyId already exists
    if (!content.includes('companyId:')) {
      // Find the schema definition and insert companyId
      const newField = `companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },\n  `;
      content = content.replace(/new mongoose\.Schema\(\{/, `new mongoose.Schema({\n  ${newField}`);
      fs.writeFileSync(filepath, content);
      console.log(`Updated ${file} to include companyId.`);
    } else {
      console.log(`${file} already has companyId.`);
    }
  }
});
