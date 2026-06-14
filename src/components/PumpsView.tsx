import React, { useState } from 'react';
import { Pump, FuelType } from '../types';
import { 
  Calculator, 
  Settings, 
  Settings2, 
  Droplet, 
  Plus, 
  RefreshCcw, 
  Check, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
} from 'lucide-react';

interface PumpsViewProps {
  pumps: Pump[];
  onUpdatePumpIndices: (id: string, startIndex: number, endIndex: number) => void;
  onAddPump: (pump: Omit<Pump, 'id' | 'volumeSold' | 'lastUpdated'>) => void;
  fuelPrices: Record<string, { buy: number; sell: number }>;
}

export default function PumpsView({
  pumps,
  onUpdatePumpIndices,
  onAddPump,
  fuelPrices
}: PumpsViewProps) {
  // New pump configuration form state
  const [newPumpName, setNewPumpName] = useState('');
  const [newPumpFuel, setNewPumpFuel] = useState<FuelType>('Super');
  const [newPumpNozzles, setNewPumpNozzles] = useState(2);
  const [newPumpStartIndex, setNewPumpStartIndex] = useState(0);

  // Relevé State targets
  const [editingPumpId, setEditingPumpId] = useState<string | null>(null);
  const [tempStart, setTempStart] = useState<string>('');
  const [tempEnd, setTempEnd] = useState<string>('');

  const [filterFuel, setFilterFuel] = useState<string>('Tous');

  const handleSaveIndices = (id: string) => {
    const s = Number(tempStart);
    const e = Number(tempEnd);
    if (isNaN(s) || isNaN(e)) {
      alert("Veuillez saisir des nombres valides !");
      return;
    }
    if (e < s) {
      alert("Attention: L'index de FIN doit être supérieur ou égal à l'index de DÉBUT !");
      return;
    }
    onUpdatePumpIndices(id, s, e);
    setEditingPumpId(null);
  };

  const handleAddPumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPumpName) {
      alert("Veuillez donner un nom ou numéro de pompe !");
      return;
    }

    onAddPump({
      name: newPumpName,
      fuelType: newPumpFuel,
      nozzlesCount: Number(newPumpNozzles),
      startIndex: Number(newPumpStartIndex) || 0,
      endIndex: Number(newPumpStartIndex) || 0,
    });

    setNewPumpName('');
    setNewPumpStartIndex(0);
  };

  // Filter pumps
  const filteredPumps = filterFuel === 'Tous' 
    ? pumps 
    : pumps.filter(p => p.fuelType === filterFuel);

  return (
    <div className="space-y-6" id="pumps-view-root font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Gestion & Relevé des Pompes</h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Saisie des index de début et fin de service pour calcul immédiat des volumes vendus.</p>
        </div>
        
        {/* Quick Filter */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs text-slate-500 font-medium">Filtrer par carburant :</span>
          <select 
            className="text-xs text-slate-800 bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
            value={filterFuel}
            onChange={e => setFilterFuel(e.target.value)}
          >
            <option value="Tous">Tous</option>
            <option value="Super">Super</option>
            <option value="Sans plomb">Sans plomb</option>
            <option value="Gasoil">Gasoil</option>
            <option value="Pétrole">Pétrole</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Relevés List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Index Journaliers (Remplace Excel)</h3>
                <p className="text-xs text-slate-500">Formule automatisée : Volume Vendu = Index Fin - Index Début</p>
              </div>
              <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-800 font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Calculateur Actif
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredPumps.map(pump => {
                const isEditing = editingPumpId === pump.id;
                const unitPrice = fuelPrices[pump.fuelType]?.sell || 0;
                const turnover = pump.volumeSold * unitPrice;

                return (
                  <div key={pump.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Name and config specs */}
                      <div className="flex items-center gap-3.5 min-w-[160px]">
                        <div className={`p-3 rounded-lg ${
                          pump.fuelType === 'Super' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          pump.fuelType === 'Sans plomb' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          pump.fuelType === 'Gasoil' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          'bg-purple-50 text-purple-600'
                        }`}>
                          <Settings className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 text-sm">{pump.name}</h4>
                            <span className="text-[9px] bg-slate-200 font-bold px-1.5 py-0.5 rounded text-slate-800 uppercase">
                              {pump.fuelType}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">{pump.nozzlesCount} pistolets actifs</p>
                        </div>
                      </div>

                      {/* Calculations & Readings */}
                      <div className="flex-1 grid grid-cols-3 gap-1 sm:gap-4 max-w-sm text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {isEditing ? (
                          <div className="col-span-2 grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-500 font-medium mb-0.5 font-sans">Début</label>
                              <input 
                                type="number" 
                                className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono focus:outline-none"
                                value={tempStart}
                                onChange={e => setTempStart(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 font-medium mb-0.5 font-sans">Fin</label>
                              <input 
                                type="number" 
                                className="w-full bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-mono focus:outline-none"
                                value={tempEnd}
                                onChange={e => setTempEnd(e.target.value)}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <span className="block text-[10px] text-slate-500 font-medium font-sans">Index Début</span>
                              <span className="font-mono font-semibold text-slate-800 tracking-tight">{pump.startIndex.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-slate-500 font-medium font-sans">Index Fin</span>
                              <span className="font-mono font-semibold text-slate-800 tracking-tight">{pump.endIndex.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                        <div className="border-l border-slate-200 pl-3">
                          <span className="block text-[10px] text-slate-500 font-medium font-sans">Vendu (Calcul)</span>
                          <span className="font-mono font-bold text-slate-950 text-xs">
                            {isEditing ? (
                              <span className="text-[11px] text-slate-500 animate-pulse">En cours...</span>
                            ) : (
                              `${pump.volumeSold.toLocaleString()} L`
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Value and actions */}
                      <div className="sm:text-right flex items-center sm:flex-col justify-between sm:justify-center border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                        <div className="hidden sm:block">
                          <span className="block text-[9px] text-slate-500 uppercase font-semibold">CA Estimé</span>
                          <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded">
                            {turnover.toLocaleString()} FCFA
                          </span>
                        </div>

                        <div className="flex gap-1.5">
                          {isEditing ? (
                            <div className="flex gap-1 animate-fadeIn">
                              <button 
                                onClick={() => handleSaveIndices(pump.id)}
                                className="bg-slate-900 text-white rounded p-1.5 hover:bg-slate-800 transition-colors"
                                title="Sauvegarder"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setEditingPumpId(null)}
                                className="bg-slate-200 text-slate-700 px-2 text-xs font-semibold py-1 hover:bg-slate-300"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setEditingPumpId(pump.id);
                                setTempStart(String(pump.startIndex));
                                setTempEnd(String(pump.endIndex));
                              }}
                              className="text-xs bg-orange-50 border border-orange-100 text-orange-700 px-2.5 py-1 rounded font-bold hover:bg-orange-100/80 inline-flex items-center gap-1 transition-colors"
                            >
                              <Calculator className="w-3.5 h-3.5" /> Relevé index
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
              {filteredPumps.length === 0 && (
                <div className="p-8 text-center text-slate-400">Aucune pompe ne correspond aux critères de carburant.</div>
              )}
            </div>
          </div>

          {/* Quick example instruction for beginners */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <HelpCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Vérification de formule Excel classique :</p>
              <p>Par exemple, pour Pompe 1 (Super) : Démarré à <span className="font-semibold font-mono">152 000</span> et fini à <span className="font-semibold font-mono">152 850</span>, le calcul produit automatiquement <span className="font-bold underline">850 litres</span> vendus. Le CA s'établit à 850L × 1,84 FCFA = 1 564 FCFA.</p>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Create/Configure Pump */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-fit text-xs font-sans">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Settings2 className="w-4.5 h-4.5 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-sm">Configurer une Pompe</h3>
          </div>

          <form onSubmit={handleAddPumpSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Désignation (Numéro Pompe)</label>
              <input 
                type="text" 
                placeholder="Ex: Pompe 7, P7, Voie Centrale" 
                className="w-full border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none focus:border-slate-800"
                value={newPumpName}
                onChange={e => setNewPumpName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Type de Carburant distribué</label>
              <select 
                className="w-full border border-slate-300 rounded px-2 py-2 bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                value={newPumpFuel}
                onChange={e => setNewPumpFuel(e.target.value as FuelType)}
              >
                <option value="Super">Super</option>
                <option value="Sans plomb">Sans plomb</option>
                <option value="Gasoil">Gasoil</option>
                <option value="Pétrole">Pétrole</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre de pistolets</label>
              <input 
                type="number" 
                min="1" 
                max="6"
                className="w-full border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                value={newPumpNozzles}
                onChange={e => setNewPumpNozzles(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Index d'Origine (Début d'indexation)</label>
              <input 
                type="number" 
                placeholder="Ex: 5000"
                className="w-full border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono"
                value={newPumpStartIndex}
                onChange={e => setNewPumpStartIndex(Number(e.target.value))}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded shadow-xs focus:ring-1 focus:ring-slate-900 inline-flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Ajouter & Activer la Pompe
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
