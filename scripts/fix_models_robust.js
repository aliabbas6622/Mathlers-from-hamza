const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.ts') && f !== 'Base.ts');

let fixedCount = 0;

for (const file of files) {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Remove the old delete blocks completely as they are unnecessary with try/catch
  const deleteBlock = /if\s*\([^)]*\)\s*\{\s*delete\s+mongoose\.models\.\w+;\s*\}\n?/g;
  if (deleteBlock.test(content)) {
    content = content.replace(deleteBlock, '');
    changed = true;
  }
  
  const deleteBlock2 = /if\s*\(process\.env\.NODE_ENV[^)]*\)\s*\{\s*delete\s+[^;]+;\s*\}\n?/g;
  if (deleteBlock2.test(content)) {
    content = content.replace(deleteBlock2, '');
    changed = true;
  }

  // Regex to match existing const Model declarations
  // Matches both:
  // const XModel = mongoose.models.X || mongoose.model('X', Schema);
  // const XModel: Model<IX> = (mongoose.models.X as Model<IX>) || mongoose.model<IX>('X', Schema);
  // const XModel: Model<IX> = mongoose.model<IX>('X', Schema);
  const modelRegex = /const\s+(\w+Model)(?:\s*:\s*Model<([^>]+)>)?\s*=\s*(?:(?:\(|mongoose\.models)[^|]+\|\|\s*)?mongoose\.model(?:<[^>]+>)?\s*\(\s*['"](\w+)['"]\s*,\s*(\w+Schema)\s*\)\s*;/g;

  content = content.replace(modelRegex, (match, modelVar, typeVar, modelStr, schemaVar) => {
    changed = true;
    const typeStr = typeVar ? `<${typeVar}>` : '';
    const typeDecl = typeVar ? `: Model<${typeVar}>` : '';
    
    return `let ${modelVar}${typeDecl};
try {
  ${modelVar} = mongoose.model${typeStr}('${modelStr}');
} catch {
  ${modelVar} = mongoose.model${typeStr}('${modelStr}', ${schemaVar});
}`;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
  }
}

console.log(`Updated ${fixedCount} models with robust try-catch pattern.`);
