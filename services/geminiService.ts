
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async explainAnswer(question: string, correctAnswer: string, explanation: string, userAnswer: string) {
    const prompt = `
      Context: I am studying with multiple choice flashcards.
      Question: ${question}
      Correct Answer: ${correctAnswer}
      My Answer: ${userAnswer}
      Provided Explanation: ${explanation}

      Task: Give me a concise, clear explanation of why the correct answer is ${correctAnswer} and if my answer (${userAnswer}) was wrong, briefly explain the misconception. Keep it under 100 words. Respond in Portuguese since the study content is in Portuguese.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Não foi possível obter a explicação da IA no momento.";
    }
  }

  async extractCardsFromText(text: string): Promise<any[]> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analise o conteúdo abaixo e extraia flashcards de múltipla escolha. 
        O conteúdo pode ser código Python (contendo listas, dicionários ou comentários com questões), texto simples ou CSV mal formatado.
        
        REGRAS:
        1. Se for código, procure por estruturas que representem perguntas e respostas.
        2. Se for texto, identifique perguntas claras e suas alternativas.
        3. A 'frente' deve conter a pergunta e a lista de opções (A, B, C, D, E).
        4. O 'gabarito' deve ser apenas a letra correspondente (ex: 'A').
        5. O 'verso' deve ser uma explicação curta em Português.

        Conteúdo para análise:
        ---
        ${text}
        ---`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                frente: { type: Type.STRING, description: "Texto da pergunta seguido das opções A) até E)" },
                gabarito: { type: Type.STRING, description: "Letra única da resposta correta" },
                verso: { type: Type.STRING, description: "Explicação por que essa é a resposta correta" }
              },
              required: ["frente", "gabarito", "verso"]
            }
          }
        }
      });
      
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Extraction error:", error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
