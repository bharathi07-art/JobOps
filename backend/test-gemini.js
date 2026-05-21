require('dotenv').config();
const axios = require('axios');

console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
console.log('Key starts with:', process.env.GEMINI_API_KEY?.substring(0, 8));

axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
  { contents: [{ role: 'user', parts: [{ text: 'Say hello in one word' }] }] },
  { headers: { 'Content-Type': 'application/json' } }
)
.then((r) => {
  console.log('\n✅ Gemini API works!');
  console.log('Response:', r.data.candidates[0].content.parts[0].text);
})
.catch((e) => {
  console.error('\n❌ Gemini API Error:');
  console.error(JSON.stringify(e?.response?.data || e.message, null, 2));
});
