export interface ToolParams {
  id: string;
  name: string;
  price: number; // Preço do inserto/ferramenta
  edges: number; // Número de arestas por inserto
  lifePerEdge: number; // Vida útil por aresta (minutos ou peças)
  changeTime: number; // Tempo de troca de ferramenta (minutos)
}

export interface GlobalSettings {
  machineHourlyRate: number; // Custo hora-máquina (R$/h)
  batchSize: number; // Quantidade de peças a produzir
  cycleTime: number; // Tempo de usinagem por peça (minutos)
  lifeUnit: 'minutes' | 'pieces'; // Unidade da vida útil
}

export interface CalculationResult {
  toolCostTotal: number;
  machineCostTotal: number;
  totalCost: number;
  costPerPiece: number;
  totalTimeHours: number;
  toolsConsumed: number;
}

export interface ComparisonResult {
  toolA: CalculationResult;
  toolB: CalculationResult;
  savings: number;
  winner: 'A' | 'B' | 'Tie';
}