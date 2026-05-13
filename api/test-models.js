import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Let's test standard model names
    const modelsToTest = [
      "gemini-2.0-flash", 
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-2.5-flash"
    ];
    
    for (const m of modelsToTest) {
      try {
        await ai.models.generateContent({ model: m, contents: "hi" });
        console.log(`✅ Model ${m} is working!`);
      } catch (e) {
        console.log(`❌ Model ${m} failed: ${e.message}`);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

listModels();
