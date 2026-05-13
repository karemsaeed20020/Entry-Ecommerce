import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: "e:/Entry/api/.env" });

async function test() {
  if (!process.env.GEMINI_API_KEY) {
    console.log("No API key found");
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Cancel order 123. Use the tool.",
      config: {
        tools: [
          {
            functionDeclarations: [
              {
                name: "cancelOrder",
                description: "Cancel order by ID",
                parameters: {
                  type: Type.OBJECT,
                  properties: { orderId: { type: Type.STRING } },
                  required: ["orderId"],
                },
              },
            ],
          },
        ],
      },
    });

    const functionCalls =
      (response as any).functionCalls ||
      response.candidates?.[0]?.content?.parts
        ?.filter((p: any) => p.functionCall)
        ?.map((p: any) => p.functionCall);

    console.log(
      "Detected functionCalls:",
      JSON.stringify(functionCalls, null, 2),
    );
  } catch (error) {
    console.error("Test Error:", error);
  }
}

test();
