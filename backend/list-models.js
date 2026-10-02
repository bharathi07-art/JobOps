require('dotenv').config();
const axios = require('axios');

axios.get(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
)
.then((r) => {
  const models = r.data.models
    .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
    .map(m => m.name);
  console.log('✅ Available models for generateContent:');
  models.forEach(m => console.log(' -', m));
})
.catch((e) => {
  console.error('❌ Error:', JSON.stringify(e?.response?.data || e.message, null, 2));
});
