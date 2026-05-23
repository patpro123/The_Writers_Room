const fs = require('fs');
const content = fs.readFileSync('frontend/src/components/BengaliLearning.tsx', 'utf8');
const lines = content.split('\n');
const line = lines[82]; // Chander Pahar
console.log('Original line:', line);
console.log('Character codes:');
for (let i = 0; i < line.length; i++) {
  console.log(`${line[i]}: ${line.charCodeAt(i).toString(16)}`);
}
