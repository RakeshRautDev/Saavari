const fs = require('fs');
const log = fs.readFileSync('C:/Users/bbrak/.gemini/antigravity/brain/5c573b9f-24e0-4c86-ac42-75ae75499b26/.system_generated/logs/transcript_full.jsonl', 'utf8');
const match = log.match(/import React.*?const CaptainHome = \(\) => \{.*?(?=export default CaptainHome)export default CaptainHome/s);
if (match) {
  let content = match[0].replace(/\\n/g, '\n').replace(/\\"/g, '"');
  fs.writeFileSync('frontend/src/pages/CaptainHome.jsx', content);
  console.log('Restored CaptainHome!');
} else {
  console.log('Not found');
}
