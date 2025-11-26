import React from 'react';
import { GlobalSettings } from '../types';
import { Settings, Clock, Factory, Layers } from 'lucide-react';

interface SettingsPanelProps {
  settings: GlobalSettings;
  onChange: (settings: GlobalSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange }) => {
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

export default SettingsPanel;