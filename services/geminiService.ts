import { GoogleGenAI } from "@google/genai";
import { ToolParams, GlobalSettings, ComparisonResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeComparison = async (
  toolA: ToolParams,
  toolB: ToolParams,
  settings: GlobalSettings,
  results: ComparisonResult
): Promise<string> => {
  
  const prompt = `
    Atue como um Engenheiro Sênior de Processos de Usinagem.
    Analise o comparativo de custo entre duas ferramentas de corte abaixo e forneça um parecer técnico resumido (máximo 3 parágrafos) em Português.
    
    Dados Gerais:
    - Lote: ${settings.batchSize} peças
    - Custo Hora-Máquina: R$ ${settings.machineHourlyRate.toFixed(2)}
    - Tempo de Ciclo: ${settings.cycleTime} min
    
    Ferramenta A (${toolA.name}):
    - Preço: R$ ${toolA.price}
    - Arestas: ${toolA.edges}
    - Vida Útil: ${toolA.lifePerEdge} ${settings.lifeUnit}
    - Custo Total Calculado: R$ ${results.toolA.totalCost.toFixed(2)}
    
    Ferramenta B (${toolB.name}):
    - Preço: R$ ${toolB.price}
    - Arestas: ${toolB.edges}
    - Vida Útil: ${toolB.lifePerEdge} ${settings.lifeUnit}
    - Custo Total Calculado: R$ ${results.toolB.totalCost.toFixed(2)}
    
    Vencedor Econômico: Ferramenta ${results.winner}
    Economia Total: R$ ${results.savings.toFixed(2)}

    Foque na relação entre o custo da ferramenta vs. o impacto do tempo de troca (setup) e custo máquina. Se a diferença for pequena, mencione outros fatores que poderiam decidir a compra (estabilidade, acabamento, disponibilidade).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Fast response preferred for UI interaction
      }
    });

    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Houve um erro ao conectar com a IA para análise.";
  }
};