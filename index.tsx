import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { Settings, Clock, Factory, Layers, PenTool, DollarSign, Timer, Hash, Calculator, Zap, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- TYPES ---
interface ToolParams {
  id: string;
  name: string;
  price: number;
  edges: number;
  lifePerEdge: number;
  changeTime: number;
}

interface GlobalSettings {
  machineHourlyRate: number;
  batchSize: number;
  cycleTime: number;
  lifeUnit: 'minutes' | 'pieces';
}

interface CalculationResult {
  toolCostTotal: number;
  machineCostTotal: number;
  totalCost: number;
  costPerPiece: number;
  totalTimeHours: number;
  toolsConsumed: number;
}

interface ComparisonResult {
  toolA: CalculationResult;
  toolB: CalculationResult;
  savings: number;
  winner: 'A' | 'B' | 'Tie';
}

// --- SERVICE ---
// Initialize API safely. In a browser env without build process, process.env might be missing.
// We assume the environment injects it or it is handled by the platform.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const analyzeComparison = async (
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
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Houve um erro ao conectar com a IA para análise. Verifique se a chave de API está configurada.";
  }
};

// --- COMPONENTS ---

// Settings Panel
const SettingsPanel: React.FC<{ settings: GlobalSettings; onChange: (s: GlobalSettings) => void }> = ({ settings, onChange }) => {
  const handleChange = (field: keyof GlobalSettings, value: number | string) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center gap-2 mb-4 text-slate-800 border-b pb-2">
        <Settings className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-lg">Parâmetros de Produção</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
            <Factory className="w-4 h-4" /> Custo Hora-Máquina (R$)
          </label>
          <input
            type="number"
            value={settings.machineHourlyRate}
            onChange={(e) => handleChange('machineHourlyRate', parseFloat(e.target.value) || 0)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
            <Layers className="w-4 h-4" /> Tamanho do Lote (Peças)
          </label>
          <input
            type="number"
            value={settings.batchSize}
            onChange={(e) => handleChange('batchSize', parseFloat(e.target.value) || 0)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" /> Tempo de Ciclo (min/peça)
          </label>
          <input
            type="number"
            value={settings.cycleTime}
            onChange={(e) => handleChange('cycleTime', parseFloat(e.target.value) || 0)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Unidade de Vida Útil
          </label>
          <select
            value={settings.lifeUnit}
            onChange={(e) => handleChange('lifeUnit', e.target.value as 'minutes' | 'pieces')}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="pieces">Peças por Aresta</option>
            <option value="minutes">Minutos por Aresta</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Tool Card
const ToolCard: React.FC<{ tool: ToolParams; settings: GlobalSettings; onChange: (t: ToolParams) => void; colorClass: string; label: string }> = ({ tool, settings, onChange, colorClass, label }) => {
  const handleChange = (field: keyof ToolParams, value: number | string) => {
    onChange({ ...tool, [field]: value });
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-t-4 ${colorClass}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-slate-800">{label}</h3>
        <PenTool className="w-5 h-5 text-slate-400" />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Nome da Ferramenta
          </label>
          <input
            type="text"
            value={tool.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full p-2 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="Ex: Fresa Metal Duro 12mm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Preço (Unid.)
            </label>
            <input
              type="number"
              value={tool.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1">
              <Hash className="w-3 h-3" /> Arestas
            </label>
            <input
              type="number"
              value={tool.edges}
              onChange={(e) => handleChange('edges', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1">
              <Timer className="w-3 h-3" /> Vida ({settings.lifeUnit === 'minutes' ? 'min' : 'peças'})
            </label>
            <input
              type="number"
              value={tool.lifePerEdge}
              onChange={(e) => handleChange('lifePerEdge', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1 flex items-center gap-1">
              <Timer className="w-3 h-3" /> Setup/Troca (min)
            </label>
            <input
              type="number"
              value={tool.changeTime}
              onChange={(e) => handleChange('changeTime', parseFloat(e.target.value) || 0)}
              className="w-full p-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Comparison Chart
const ComparisonChart: React.FC<{ results: ComparisonResult; toolAName: string; toolBName: string }> = ({ results, toolAName, toolBName }) => {
  const data = [
    {
      name: 'Ferramenta A',
      Ferramenta: results.toolA.toolCostTotal,
      Maquina: results.toolA.machineCostTotal,
      Total: results.toolA.totalCost
    },
    {
      name: 'Ferramenta B',
      Ferramenta: results.toolB.toolCostTotal,
      Maquina: results.toolB.machineCostTotal,
      Total: results.toolB.totalCost
    },
  ];

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={(val) => `R$${val}`} />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip 
            formatter={(value: number) => `R$ ${value.toFixed(2)}`}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Bar dataKey="Ferramenta" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Custo Ferramentas" />
          <Bar dataKey="Maquina" stackId="a" fill="#94a3b8" radius={[0, 4, 4, 0]} name="Custo Máquina" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- MAIN APP ---

const initialSettings: GlobalSettings = {
  machineHourlyRate: 150,
  batchSize: 1000,
  cycleTime: 5,
  lifeUnit: 'pieces'
};

const initialTool: ToolParams = {
  id: '1',
  name: 'Ferramenta Padrão',
  price: 50,
  edges: 2,
  lifePerEdge: 50,
  changeTime: 5,
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<GlobalSettings>(initialSettings);
  const [toolA, setToolA] = useState<ToolParams>({ ...initialTool, id: 'A', name: 'Opção A (Standard)' });
  const [toolB, setToolB] = useState<ToolParams>({ ...initialTool, id: 'B', name: 'Opção B (Premium)', price: 120, lifePerEdge: 150 });
  const [results, setResults] = useState<ComparisonResult | null>(null);
  
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const calculateCosts = () => {
    const calculateSingleTool = (tool: ToolParams): CalculationResult => {
      let piecesPerToolTotal = 0;
      
      if (settings.lifeUnit === 'pieces') {
        piecesPerToolTotal = tool.edges * tool.lifePerEdge;
      } else {
        const piecesPerEdge = tool.lifePerEdge / settings.cycleTime;
        piecesPerToolTotal = tool.edges * piecesPerEdge;
      }

      if (piecesPerToolTotal <= 0) piecesPerToolTotal = 1;

      const toolsConsumed = Math.ceil(settings.batchSize / piecesPerToolTotal);
      
      const toolCostTotal = toolsConsumed * tool.price;
      
      const machiningTimeTotal = settings.batchSize * settings.cycleTime;
      const piecesPerEdge = piecesPerToolTotal / tool.edges;
      const numberOfChanges = Math.ceil(settings.batchSize / piecesPerEdge); 
      const downtimeTotal = numberOfChanges * tool.changeTime;

      const totalTimeMinutes = machiningTimeTotal + downtimeTotal;
      const totalTimeHours = totalTimeMinutes / 60;

      const machineCostTotal = totalTimeHours * settings.machineHourlyRate;
      const totalCost = toolCostTotal + machineCostTotal;

      return {
        toolCostTotal,
        machineCostTotal,
        totalCost,
        costPerPiece: totalCost / settings.batchSize,
        totalTimeHours,
        toolsConsumed
      };
    };

    const resA = calculateSingleTool(toolA);
    const resB = calculateSingleTool(toolB);

    const winner = resA.totalCost < resB.totalCost ? 'A' : (resB.totalCost < resA.totalCost ? 'B' : 'Tie');
    const savings = Math.abs(resA.totalCost - resB.totalCost);

    setResults({
      toolA: resA,
      toolB: resB,
      winner,
      savings
    });
    
    setAiAnalysis('');
  };

  useEffect(() => {
    calculateCosts();
  }, [settings, toolA, toolB]);

  const handleAiAnalyze = async () => {
    if (!results) return;
    setIsAnalyzing(true);
    const analysis = await analyzeComparison(toolA, toolB, settings, results);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-slate-900 text-white py-6 shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">Calculadora de Usinagem</h1>
            <p className="text-slate-400 text-sm">Análise de Custo-Benefício de Ferramentas</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <SettingsPanel settings={settings} onChange={setSettings} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ToolCard 
            label="Ferramenta A" 
            tool={toolA} 
            settings={settings} 
            onChange={setToolA} 
            colorClass="border-t-blue-500"
          />
          <ToolCard 
            label="Ferramenta B" 
            tool={toolB} 
            settings={settings} 
            onChange={setToolB} 
            colorClass="border-t-emerald-500"
          />
        </div>

        {results && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Resultado da Análise
              </h2>
              {results.winner !== 'Tie' && (
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${results.winner === 'A' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  Vencedor: {results.winner === 'A' ? toolA.name : toolB.name}
                </span>
              )}
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-1 space-y-6">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <h3 className="text-sm font-semibold text-blue-800 mb-2">{toolA.name}</h3>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600">Custo Total:</span>
                      <span className="font-bold text-slate-900">R$ {results.toolA.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600">Por Peça:</span>
                      <span className="font-bold text-slate-900">R$ {results.toolA.costPerPiece.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Inserto Cons.:</span>
                      <span className="text-slate-900">{results.toolA.toolsConsumed} un.</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <h3 className="text-sm font-semibold text-emerald-800 mb-2">{toolB.name}</h3>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600">Custo Total:</span>
                      <span className="font-bold text-slate-900">R$ {results.toolB.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-600">Por Peça:</span>
                      <span className="font-bold text-slate-900">R$ {results.toolB.costPerPiece.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Inserto Cons.:</span>
                      <span className="text-slate-900">{results.toolB.toolsConsumed} un.</span>
                    </div>
                  </div>

                  {results.savings > 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                      <p className="text-sm text-yellow-800 font-medium">Economia Potencial</p>
                      <p className="text-2xl font-bold text-yellow-900">R$ {results.savings.toFixed(2)}</p>
                      <p className="text-xs text-yellow-700 mt-1">no lote de {settings.batchSize} peças</p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 flex flex-col justify-center">
                  <h3 className="text-center text-sm font-semibold text-slate-500 mb-2">Composição de Custo (Ferramenta vs Máquina)</h3>
                  <ComparisonChart results={results} toolAName={toolA.name} toolBName={toolB.name} />
                  
                  <div className="mt-6 flex flex-col items-center">
                    {!aiAnalysis && (
                      <button
                        onClick={handleAiAnalyze}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 px-6 rounded-full shadow transition-all disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>Analisando...</>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> Analisar com IA
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {aiAnalysis && (
                <div className="mt-8 border-t border-slate-200 pt-6 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                       <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 mb-2">Parecer Técnico da IA</h3>
                      <div className="prose prose-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-line">
                        {aiAnalysis}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-slate-400 text-sm py-8">
        <p>Dados aproximados para estimativa de processo.</p>
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element to mount to");

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);