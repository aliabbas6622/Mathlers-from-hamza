const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.ts') && f !== 'Base.ts');

let fixedCount = 0;

for (const file of files) {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Ensure the delete block has the production guard
  const deleteRegexUnprotected = /if\s*\(\s*mongoose\.models\.(\w+)\s*\)\s*\{\s*delete\s+mongoose\.models\.\1;\s*\}/g;
  if (deleteRegexUnprotected.test(content)) {
    content = content.replace(deleteRegexUnprotected, (match, modelName) => {
      return `if (process.env.NODE_ENV !== 'production' && mongoose.models.${modelName}) {\n  delete mongoose.models.${modelName};\n}`;
    });
    changed = true;
  }

  // 2. Ensure the model assignment uses the fallback pattern
  // Match: const FooModel: Model<IFoo> = mongoose.model<IFoo>('Foo', FooSchema);
  // Match: const FooModel = mongoose.model<IFoo>('Foo', FooSchema);
  // We want to replace it with: const FooModel = mongoose.models.Foo || mongoose.model...
  
  const modelAssignmentRegex = /const\s+(\w+Model)(?:\s*:\s*Model<([^>]+)>)?\s*=\s*mongoose\.model(?:<[^>]+>)?\s*\(\s*['"](\w+)['"]\s*,\s*(\w+Schema)\s*\)\s*;/g;
  
  content = content.replace(modelAssignmentRegex, (match, modelVar, typeVar, modelStr, schemaVar) => {
    // If it already contains mongoose.models.X ||, we skip (it shouldn't match this regex anyway because it starts with mongoose.model)
    // Actually the regex requires `= mongoose.model`, so it will match.
    changed = true;
    if (typeVar) {
      return `const ${modelVar}: Model<${typeVar}> = (mongoose.models.${modelStr} as Model<${typeVar}>) || mongoose.model<${typeVar}>('${modelStr}', ${schemaVar});`;
    } else {
      return `const ${modelVar} = mongoose.models.${modelStr} || mongoose.model('${modelStr}', ${schemaVar});`;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
    fixedCount++;
  }
}

console.log(`Finished checking all models. Fixed ${fixedCount} files.`);
