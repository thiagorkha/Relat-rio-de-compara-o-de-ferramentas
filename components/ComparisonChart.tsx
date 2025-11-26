import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ComparisonResult, ToolParams } from '../types';

interface ComparisonChartProps {
  results: ComparisonResult;
  toolAName: string;
  toolBName: string;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ results, toolAName, toolBName }) => {
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

export default ComparisonChart;