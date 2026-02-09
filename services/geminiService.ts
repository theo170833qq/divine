import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { Attachment } from "../types";

let chatSession: Chat | null = null;

// SAFE KEY RETRIEVAL:
// This function avoids referencing 'process' directly in a way that would cause
// a ReferenceError in strict browser environments.
const getSafeApiKey = (): string => {
  let key = '';
  
  // 1. Try import.meta (Vite/ESM)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      key = import.meta.env.API_KEY || '';
    }
  } catch (e) {}

  if (key) return key;

  // 2. Try window.process (Polyfilled in index.html)
  try {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.process && window.process.env) {
      // @ts-ignore
      key = window.process.env.API_KEY || '';
    }
  } catch (e) {}

  if (key) return key;

  // 3. Try global process (Node/Webpack) - wrapped in try/catch and type checks
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process && process.env) {
      // @ts-ignore
      key = process.env.API_KEY || '';
    }
  } catch (e) {}

  return key;
};

const getAiClient = () => {
  const apiKey = getSafeApiKey();
  
  if (!apiKey) {
    console.warn("AVISO CRÍTICO: API_KEY não encontrada. O chat não funcionará.");
    // Return a dummy client to prevent immediate crash, but calls will fail.
    return new GoogleGenAI({ apiKey: 'missing_key_placeholder' });
  }
  
  return new GoogleGenAI({ apiKey: apiKey });
};

export const initializeChat = (): Chat => {
  try {
      const ai = getAiClient();
      // Ensure the 'chats' property exists on the AI instance (SDK version check)
      if (!ai.chats) {
        throw new Error("SDK Version Mismatch: ai.chats is undefined.");
      }

      chatSession = ai.chats.create({
        model: "gemini-2.0-flash", 
        config: {
          systemInstruction: SYSTEM_PROMPT,
          // CRITICAL SETTINGS FOR ZERO HALLUCINATION
          temperature: 0.0, 
          topP: 0.4, 
          topK: 20, 
          tools: [{ googleSearch: {} }], 
        },
      });
  } catch (e) {
      console.error("Failed to create chat session:", e);
      chatSession = null;
  }
  return chatSession as Chat;
};

export const sendMessageStream = async function* (message: string, attachment?: Attachment) {
  try {
    if (!chatSession) {
      initializeChat();
    }

    if (!chatSession) {
      throw new Error("Sessão de chat não pôde ser inicializada. Verifique se a API Key está configurada corretamente.");
    }

    let inputMessage: string | any[] = message;

    // Se houver anexo, constrói mensagem multipart
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
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};