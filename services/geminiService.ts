
import { GoogleGenAI, GenerateContentResponse, Schema } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    // This provides a clear error in the development console if the API key is missing.
    console.error("Gemini API key is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getAiResponse = async (prompt: string, schema: Schema): Promise<any> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 1.0,
                topP: 0.95,
            },
        });

        // The .text property directly gives the stringified JSON
        const jsonString = response.text;
        
        if (!jsonString) {
            throw new Error("Received empty response from AI.");
        }
        
        // Attempt to parse the JSON string
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error fetching AI response:", error);
        // Fallback or re-throw, depending on desired behavior
        throw new Error("Failed to get a valid move from the AI.");
    }
};
