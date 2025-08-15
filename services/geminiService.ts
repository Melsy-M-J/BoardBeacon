

import { GoogleGenAI, GenerateContentResponse, Schema } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    // This provides a clear error in the development console if the API key is missing.
    console.error("Gemini API key is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getAiResponse = async (prompt: string, schema: Schema): Promise<any> => {
    let jsonString: string | undefined;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.3, // Lowered for more deterministic JSON
            },
        });

        jsonString = response.text;
        
        if (!jsonString) {
            throw new Error("Received empty response from AI.");
        }
        
        // Attempt to parse the JSON string
        return JSON.parse(jsonString);

    } catch (error) {
        // If parsing fails, log the malformed string for easier debugging
        if (error instanceof SyntaxError && jsonString) {
             console.error("Failed to parse AI response as JSON. Response text:", jsonString);
        } else {
            console.error("Error fetching AI response:", error);
        }
        // Fallback or re-throw, depending on desired behavior
        throw new Error("Failed to get a valid move from the AI.");
    }
};