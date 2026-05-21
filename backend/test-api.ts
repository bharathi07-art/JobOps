import "dotenv/config";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const testFile = "C:/Users/Bharathi/OneDrive/Desktop/software engineer inovation/Document 4.pdf";

const form = new FormData();
form.append("resume", fs.createReadStream(testFile), {
  filename: "resume.pdf",
  contentType: "application/pdf",
});

console.log("Testing /api/jobresult/analyze ...\n");

axios
  .post("http://localhost:5000/api/jobresult/analyze", form, {
    headers: form.getHeaders(),
    timeout: 90000,
  })
  .then((res) => {
    console.log("✅ Status:", res.status);
    console.log("✅ Success:", res.data.success);
    console.log("\n--- AI Result (first 800 chars) ---");
    console.log(String(res.data.result).substring(0, 800));
  })
  .catch((err) => {
    console.error("❌ Error:", err?.response?.data || err.message);
  });
