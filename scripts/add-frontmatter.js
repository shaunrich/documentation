#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to check if file already has frontmatter
function hasFrontmatter(content) {
  return content.startsWith('---\n');
}

// Function to create a title from filename
function createTitleFromFilename(filename) {
  // Remove extension and convert dashes to spaces
  let title = path.basename(filename, path.extname(filename))
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return title;
}

// Function to create a description from first paragraph
function createDescriptionFromContent(content) {
  // Remove markdown headings and get first paragraph
  const lines = content.split('\n');
  let description = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('#') && !line.startsWith('![') && !line.startsWith('```')) {
      // Remove markdown formatting
      description = line.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
      break;
    }
  }
  
  // Truncate if too long
  if (description.length > 150) {
    description = description.substring(0, 147) + '...';
  }
  
  return description || 'Documentation for SVYP platform';
}

// Function to add frontmatter to a file
function addFrontmatterToFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has frontmatter
  if (hasFrontmatter(content)) {
    console.log(`Skipping ${filePath} - already has frontmatter`);
    return;
  }
  
  const title = createTitleFromFilename(filePath);
  const description = createDescriptionFromContent(content);
  
  const frontmatter = `---
title: "${title}"
description: "${description}"
---

`;
  
  const newContent = frontmatter + content;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Added frontmatter to ${filePath}`);
}

// Find all Markdown files
const mdFiles = glob.sync(path.join(__dirname, '../**/*.md'));

// Process each file
mdFiles.forEach(file => {
  // Skip files in node_modules or .git
  if (file.includes('node_modules') || file.includes('.git')) {
    return;
  }
  
  addFrontmatterToFile(file);
});

console.log('Finished adding frontmatter to Markdown files');
