const fs = require('fs');
const text = fs.readFileSync('C:/Users/bbrak/.gemini/antigravity/brain/5c573b9f-24e0-4c86-ac42-75ae75499b26/.system_generated/logs/transcript_full.jsonl', 'utf8');
const match = text.match(/import React, \{ useContext.*?export default CaptainHome/s);
if (match) {
  let cleaned = match[0].replace(/\\n/g, '\n').replace(/\\"/g, '"');
  fs.writeFileSync('frontend/src/pages/CaptainHome.jsx', cleaned);
  console.log('Restored CaptainHome.jsx directly!');
} else {
  console.log('Not found in transcript.');
}
