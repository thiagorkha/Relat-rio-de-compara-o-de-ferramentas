import React from 'react';
import { ToolParams, GlobalSettings } from '../types';
import { PenTool, DollarSign, Timer, Hash } from 'lucide-react';

interface ToolCardProps {
  tool: ToolParams;
  settings: GlobalSettings;
  onChange: (tool: ToolParams) => void;
  colorClass: string;
  label: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, settings, onChange, colorClass, label }) => {
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

export default ToolCard;