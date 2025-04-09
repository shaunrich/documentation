#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all Markdown files
const mdFiles = glob.sync(path.join(__dirname, '../**/*.md'));

// Track renamed files for docs.json update
const renamedFiles = [];

// Process each file
mdFiles.forEach(file => {
  // Skip files in node_modules, .git or scripts directory
  if (file.includes('node_modules') || file.includes('.git') || file.includes('/scripts/')) {
    return;
  }
  
  // Skip README.md
  if (file.endsWith('README.md')) {
    console.log(`Skipping ${file} (README file)`);
    return;
  }
  
  const content = fs.readFileSync(file, 'utf8');
  
  // Create the new .mdx filename
  const mdxFile = file.replace(/\.md$/, '.mdx');
  
  // Write the content to the new file
  fs.writeFileSync(mdxFile, content, 'utf8');
  
  // Keep track of the filename change for docs.json update
  const relativeOldPath = path.relative(path.join(__dirname, '..'), file).replace(/\.md$/, '');
  const relativeNewPath = path.relative(path.join(__dirname, '..'), mdxFile).replace(/\.mdx$/, '');
  
  renamedFiles.push({
    old: relativeOldPath,
    new: relativeNewPath
  });
  
  console.log(`Converted ${file} to ${mdxFile}`);
  
  // Delete the original .md file
  fs.unlinkSync(file);
});

// Update docs.json
const docsJsonPath = path.join(__dirname, '../docs.json');
if (fs.existsSync(docsJsonPath)) {
  let docsJson = fs.readFileSync(docsJsonPath, 'utf8');
  
  renamedFiles.forEach(({old, new: newPath}) => {
    // Replace references in docs.json, being careful with similar names
    // Use word boundaries to avoid partial matches
    const oldPathRegex = new RegExp(`"${old}"`, 'g');
    docsJson = docsJson.replace(oldPathRegex, `"${newPath}"`);
  });
  
  fs.writeFileSync(docsJsonPath, docsJson, 'utf8');
  console.log('Updated docs.json with new file paths');
}

console.log(`\nConverted ${renamedFiles.length} files from MD to MDX format`);
