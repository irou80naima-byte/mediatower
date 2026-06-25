import { GoogleGenAI, Type } from "@google/genai";



const schema = {
  description: "A flow diagram representing logic or processes",
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["default", "input", "output"] },
          color: { type: Type.STRING, description: "Hex color for the node background" },
          x: { type: Type.NUMBER },
          y: { type: Type.NUMBER }
        },
        required: ["id", "label", "x", "y"]
      }
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          source: { type: Type.STRING },
          target: { type: Type.STRING },
          label: { type: Type.STRING }
        },
        required: ["id", "source", "target"]
      }
    }
  },
  required: ["nodes", "edges"]
};

export async function generateFlow(prompt: string, complexity: string = "Standard") {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a flow diagram for: ${prompt}. 
    Complexity: ${complexity}.
    The flow should be logical and follow standard UI/UX patterns if applicable.
    Assign reasonable x and y coordinates for a clean horizontal layout (left to right).
    Use varied hex colors that look professional (pastels or soft colors).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  return JSON.parse(result.text.trim());
}
