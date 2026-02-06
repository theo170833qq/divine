import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { Attachment } from "../types";

let chatSession: Chat | null = null;

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey });
};

export const initializeChat = (): Chat => {
  const ai = getAiClient();
  chatSession = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: SYSTEM_PROMPT,
      // CRITICAL SETTINGS FOR ZERO HALLUCINATION
      temperature: 0.0, // Zero creativity. Deterministic output only.
      topP: 0.4, // Restrict token selection to the highest probability only.
      topK: 20, // Strict vocabulary.
      tools: [{ googleSearch: {} }], // Grounding is mandatory.
    },
  });
  return chatSession;
};

export const sendMessageStream = async function* (message: string, attachment?: Attachment) {
  try {
    if (!chatSession) {
      initializeChat();
    }

    if (!chatSession) {
      throw new Error("Failed to initialize chat session.");
    }

    let inputMessage: string | any[] = message;

    // If there is an attachment, construct a multi-part message
    if (attachment) {
      inputMessage = [
        {
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.data,
          },
        },
        {
          text: message,
        },
      ];
    }

    const result = await chatSession.sendMessageStream({ message: inputMessage });
    
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
      // Note: We could handle c.groundingMetadata here to show sources, 
      // but strictly following the text stream keeps the UI stable.
      // The model will be prompted to cite sources in the text.
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};