import React, { useState, useEffect } from 'react';
import { ToolParams, GlobalSettings, CalculationResult, ComparisonResult } from './types';
import SettingsPanel from './components/SettingsPanel';
import ToolCard from './components/ToolCard';
import ComparisonChart from './components/ComparisonChart';
import { analyzeComparison } from './services/geminiService';
import { Calculator, Zap, AlertCircle, Sparkles } from 'lucide-react';

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
      // 1. Calculate tool consumption
      let piecesPerToolTotal = 0;
      
      if (settings.lifeUnit === 'pieces') {
        piecesPerToolTotal = tool.edges * tool.lifePerEdge;
      } else {
        // life in minutes. We need to know how many pieces fit in that time.
        // Assuming cycleTime is 100% cutting time for simplicity in this model, 
        // or user inputs actual cutting time per piece.
        const piecesPerEdge = tool.lifePerEdge / settings.cycleTime;
        piecesPerToolTotal = tool.edges * piecesPerEdge;
      }

      // Avoid division by zero
      if (piecesPerToolTotal <= 0) piecesPerToolTotal = 1;

      const toolsConsumed = Math.ceil(settings.batchSize / piecesPerToolTotal);
      
      // 2. Costs
      const toolCostTotal = toolsConsumed * tool.price;
      
      // 3. Time
      // Total machining time (independent of tool usually, unless we add Vc params later)
      const machiningTimeTotal = settings.batchSize * settings.cycleTime;
      // Downtime for changes. Number of changes = toolsConsumed * edges (assuming indexing takes same time as change) 
      // Simplified: Number of changes = (Batch / PiecesPerEdge) - 1 (initial setup ignored or added)
      // Let's use: (Batch / PiecesPerEdge) * ChangeTime
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
    
    // Reset AI analysis when data changes substantially to avoid stale advice
    setAiAnalysis('');
  };

  useEffect(() => {
    calculateCosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {/* Header */}
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

        {/* Results Section */}
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
                
                {/* Summary Metrics */}
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

                {/* Chart Area */}
                <div className="lg:col-span-2 flex flex-col justify-center">
                  <h3 className="text-center text-sm font-semibold text-slate-500 mb-2">Composição de Custo (Ferramenta vs Máquina)</h3>
                  <ComparisonChart results={results} toolAName={toolA.name} toolBName={toolB.name} />
                  
                  {/* AI Button */}
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

              {/* AI Analysis Result */}
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

export default App;