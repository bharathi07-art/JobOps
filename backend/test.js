import "dotenv/config";
import axios from "axios";

const test = async () => {

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,

    {
      messages: [
        {
          role: "user",
          content: "Hello"
        }
      ]
    },

    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );

  console.log(response.data);
};

test();