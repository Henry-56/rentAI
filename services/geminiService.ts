
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";
import { MOCK_ITEMS } from "../constants";

// Helper to format items for the AI context
const itemsContext = MOCK_ITEMS.map(item => 
  `- ${item.title} (${item.category}): S/ ${item.pricePerDay}/día. Ubicación: ${item.location}. ID: ${item.id}. Disponible: ${item.available ? 'Sí' : 'No'}`
).join('\n');

const SYSTEM_INSTRUCTION = `
Eres "RentBot", el asistente virtual de la plataforma RentAI. 
Tu objetivo es ayudar a los usuarios a encontrar artículos para alquilar, resolver dudas sobre el proceso y dar recomendaciones.

Contexto de inventario actual:
${itemsContext}

Reglas:
1. Responde de manera amigable y concisa en Español.
2. Si te preguntan por un artículo, busca en el contexto y sugiere opciones específicas con su precio.
3. Si el usuario quiere alquilar, indícale que puede hacer clic en el artículo para ver detalles.
4. Explica que los pagos son seguros a través de Stripe/Culqi.
5. Si no encuentras algo, sugiere una categoría similar.
`;

export const sendMessageToGemini = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    /* Initialize GoogleGenAI with Vite environment variable */
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });
    
    /* Using recommended model 'gemini-3-flash-preview' for basic text tasks */
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }))
    });

    const result = await chat.sendMessage({
      message: newMessage
    });

    /* Correctly accessing .text property on the response as per guidelines */
    return result.text || "Lo siento, no pude procesar tu solicitud en este momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Lo siento, hubo un error conectando con mi cerebro de IA. Intenta más tarde.";
  }
};
