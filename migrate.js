const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, 'frontend');

// 1. Rename files from .tsx/.ts to .jsx/.js and remove types
const walk = (dir) => {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Remove TS types like <any>, : any, : number
        content = content.replace(/<any>/g, '');
        content = content.replace(/: any/g, '');
        content = content.replace(/: number/g, '');
        
        // Also fix the layout props if any (e.g., Readonly<{children: React.ReactNode}>)
        if (fullPath.includes('layout.tsx') || fullPath.includes('layout.jsx')) {
          content = content.replace(/Readonly<\{[\s\S]*?children: React\.ReactNode;[\s\S]*?\}>/, '');
          content = content.replace(/export default function RootLayout\(\{[\s\S]*?children,[\s\S]*?\}\)/, 'export default function RootLayout({ children })');
          // Also remove import type Metadata
          content = content.replace(/import type \{ Metadata \} from "next";\n*/, '');
          content = content.replace(/export const metadata: Metadata = \{/g, 'export const metadata = {');
        }

        // Replace the color #714b67 with #D6536D (case insensitive)
        content = content.replace(/#714b67/gi, '#D6536D');
        content = content.replace(/#704A67/gi, '#D6536D');

        const newPath = fullPath.replace('.tsx', '.jsx').replace('.ts', '.js');
        fs.writeFileSync(newPath, content);
        if (fullPath !== newPath) {
          fs.unlinkSync(fullPath);
        }
        console.log('Renamed and updated ' + fullPath + ' to ' + newPath);
      }
    }
  });
};

walk(path.join(frontendDir, 'src'));

// 2. Remove tsconfig.json and create jsconfig.json
const tsconfig = path.join(frontendDir, 'tsconfig.json');
if (fs.existsSync(tsconfig)) {
  fs.unlinkSync(tsconfig);
  fs.writeFileSync(path.join(frontendDir, 'jsconfig.json'), JSON.stringify({
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "@/*": ["./src/*"]
      }
    }
  }, null, 2));
  console.log('Replaced tsconfig.json with jsconfig.json');
}

// 3. Remove TS dependencies from package.json
const pkgPath = path.join(frontendDir, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = ['typescript', '@types/node', '@types/react', '@types/react-dom'];
  let changed = false;
  
  if (pkg.dependencies) {
    deps.forEach(d => {
      if (pkg.dependencies[d]) {
        delete pkg.dependencies[d];
        changed = true;
      }
    });
  }
  if (pkg.devDependencies) {
    deps.forEach(d => {
      if (pkg.devDependencies[d]) {
        delete pkg.devDependencies[d];
        changed = true;
      }
    });
  }
  
  if (changed) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log('Removed TS dependencies from package.json');
  }
}

console.log('Migration to JS complete!');
