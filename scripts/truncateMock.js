const fs = require('fs');

const path = 'data/mockData.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Truncate INSTRUCTORS
const instRegex = /(export const INSTRUCTORS: Instructor\[\] = \[)([\s\S]*?)(\n\];)/;
const instMatch = content.match(instRegex);
if (instMatch) {
  // Rough splitting by "  },\n  {"
  const items = instMatch[2].split(/  \},\n  \{/);
  const truncated = items.slice(0, 3).join('  },\n  {');
  content = content.replace(instMatch[0], `${instMatch[1]}${truncated}\n  }\n];`);
}

// 2. Truncate LEARNERS
const learnRegex = /(export const LEARNERS: Learner\[\] = \[)([\s\S]*?)(\n\];)/;
const learnMatch = content.match(learnRegex);
if (learnMatch) {
  const items = learnMatch[2].split(/  \},\n  \{/);
  const truncated = items.slice(0, 3).join('  },\n  {');
  content = content.replace(learnMatch[0], `${learnMatch[1]}${truncated}\n  }\n];`);
}

fs.writeFileSync(path, content);
console.log('Successfully truncated mockData.ts');
