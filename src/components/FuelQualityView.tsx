import React, { useState } from 'react';
import { FuelQualityTest, Tank, FuelType } from '../types';
import { 
  Droplet, 
  Thermometer, 
  Plus, 
  Trash2, 
  FileText, 
  Info, 
  PlusCircle, 
  Check, 
  Sparkles, 
  AlertOctagon,
  ChevronRight
} from 'lucide-react';

interface FuelQualityViewProps {
  tanks: Tank[];
  qualityTests: FuelQualityTest[];
  onAddQualityTest: (test: Omit<FuelQualityTest, 'id' | 'isConform'>) => void;
  onDeleteQualityTest: (id: string) => void;
}

export default function FuelQualityView({
  tanks,
  qualityTests,
  onAddQualityTest,
  onDeleteQualityTest
}: FuelQualityViewProps) {
  // Navigation within the tab
  const [innerTab, setInnerTab] = useState<'status' | 'form' | 'nozzle'>('status');

  // Form State
  const [tankId, setTankId] = useState(tanks[0]?.id || '');
  const [testDate, setTestDate] = useState('2026-06-11');
  const [density, setDensity] = useState('');
  const [temperature, setTemperature] = useState('15.0');
  const [waterPresence, setWaterPresence] = useState(false);
  const [waterHeightMm, setWaterHeightMm] = useState('0');
  const [nozzleAccuracyPercent, setNozzleAccuracyPercent] = useState('0.00');
  const [notes, setNotes] = useState('');
  const [operator, setOperator] = useState('Jean-Marc Koffi');

  // Interactive nozzle simulation state
  const [selectedSimTank, setSelectedSimTank] = useState(tanks[0]?.id || '');
  const [pipetteVolume, setPipetteVolume] = useState('20.00'); // target is 20 Liters
  const [measuredVolume, setMeasuredVolume] = useState('20.02'); // actual measured
  const [simResult, setSimResult] = useState<null | { deviation: number, isConform: boolean }>(null);

  const handleSimulateNozzleTest = (e: React.FormEvent) => {
    e.preventDefault();
    const targeted = Number(pipetteVolume);
    const measured = Number(measuredVolume);
    if (targeted <= 0 || measured <= 0) {
      alert("Veuillez saisir des volumes valides.");
      return;
    }
    const dev = ((measured - targeted) / targeted) * 100;
    const isOk = Math.abs(dev) <= 0.5; // +/- 0.5% standard tolerance
    setSimResult({
      deviation: dev,
      isConform: isOk
    });
  };

  const handleApplySimToForm = () => {
    if (simResult !== null) {
      setNozzleAccuracyPercent(simResult.deviation.toFixed(2));
      const chosenTank = tanks.find(t => t.id === selectedSimTank);
      if (chosenTank) {
        setTankId(chosenTank.id);
      }
      setInnerTab('form');
    }
  };

  const handleSubmitTest = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenTank = tanks.find(t => t.id === tankId);
    if (!chosenTank) {
      alert("Veuillez sélectionner une cuve valide.");
      return;
    }

    if (!density) {
      alert("La valeur de densité est requise.");
      return;
    }

    onAddQualityTest({
      date: testDate,
      fuelType: chosenTank.fuelType,
      tankName: chosenTank.name,
      density: Number(density),
      temperature: Number(temperature),
      waterPresence,
      waterHeightMm: Number(waterHeightMm),
      nozzleAccuracyPercent: Number(nozzleAccuracyPercent),
      operator,
      notes: notes || "Contrôle périodique conforme"
    });

    // Reset form states
    setDensity('');
    setWaterPresence(false);
    setWaterHeightMm('0');
    setNozzleAccuracyPercent('0.00');
    setNotes('');
    setInnerTab('status');
  };

  // Helper limits for validation
  const getStandardDensityRange = (fuel: FuelType) => {
    switch (fuel) {
      case 'Super': return { min: 0.720, max: 0.775, default: 0.740 };
      case 'Sans plomb': return { min: 0.720, max: 0.775, default: 0.740 };
      case 'Gasoil': return { min: 0.820, max: 0.845, default: 0.835 };
      case 'Pétrole': return { min: 0.780, max: 0.820, default: 0.800 };
      default: return { min: 0.700, max: 0.900, default: 0.800 };
    }
  };

  const activeTankInfo = tanks.find(t => t.id === tankId);
  const helpRange = activeTankInfo ? getStandardDensityRange(activeTankInfo.fuelType) : null;

  return (
    <div className="space-y-6" id="fuel-quality-root">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Contrôles Physiques, Qualité & Eau
          </h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Tests obligatoires quotidiens : densité de livraison, recherche d'eau au fond des cuves, et calibrage d'erreur des compteurs (Volucompteurs).
          </p>
        </div>
        
        {/* Sub Navigation pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            type="button"
            onClick={() => setInnerTab('status')} 
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${innerTab === 'status' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Registre & États
          </button>
          <button 
            type="button"
            onClick={() => setInnerTab('form')} 
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${innerTab === 'form' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Saisie de test
          </button>
          <button 
            type="button"
            onClick={() => setInnerTab('nozzle')} 
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${innerTab === 'nozzle' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Simulateur d'égouttage (20L)
          </button>
        </div>
      </div>

      {/* INNER TAB: REGISTER & STATUS */}
      {innerTab === 'status' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Quick status cards of today's health */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tanks.map(t => {
              // Find newest test today for this tank
              const tankTests = qualityTests.filter(qt => qt.tankName === t.name);
              const lastTest = tankTests[0]; // assuming sorted newest first
              
              const isOkDensity = lastTest 
                ? (lastTest.density >= getStandardDensityRange(t.fuelType).min && lastTest.density <= getStandardDensityRange(t.fuelType).max)
                : true;
              const hasWater = lastTest ? lastTest.waterPresence : false;
              const hasNozzleEcart = lastTest ? Math.abs(lastTest.nozzleAccuracyPercent) > 0.5 : false;

              const isHealthy = lastTest ? (isOkDensity && !hasWater && !hasNozzleEcart) : null;

              return (
                <div key={t.id} className="bg-white rounded border border-slate-200 p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider">ÉTAT QUALITÉ</span>
                        <h4 className="font-bold text-slate-900 text-xs mt-0.5">{t.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">{t.fuelType}</p>
                      </div>
                      
                      {lastTest ? (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isHealthy ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {isHealthy ? 'CONFORME' : 'ALERTE CONTROL'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700/80">
                          NON TESTÉ CE JOUR
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 text-[11px] font-sans">
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Test Eau (Pâte) :</span>
                        <span className={`font-semibold ${hasWater ? 'text-red-650 text-red-600 font-bold' : 'text-emerald-600'}`}>
                          {hasWater ? `Eau détectée ! (${lastTest?.waterHeightMm} mm)` : lastTest ? 'Absence Eau (OK)' : 'Aucun test'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span className="text-slate-500">Densité à 15°C :</span>
                        <span className={`font-mono font-semibold ${lastTest ? (isOkDensity ? 'text-emerald-600' : 'text-red-500 font-bold') : 'text-slate-400'}`}>
                          {lastTest ? `${lastTest.density.toFixed(3)} kg/L` : 'Aucun test'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Écart Volucompteur :</span>
                        <span className={`font-mono font-semibold ${lastTest ? (hasNozzleEcart ? 'text-red-550 text-red-500 font-bold' : 'text-emerald-650 text-emerald-600') : 'text-slate-400'}`}>
                          {lastTest ? `${lastTest.nozzleAccuracyPercent > 0 ? '+' : ''}${lastTest.nozzleAccuracyPercent}%` : 'Aucun test'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-2 flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">
                      {lastTest ? `Fait le: ${lastTest.date}` : 'Action requise'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTankId(t.id);
                        setInnerTab('form');
                      }}
                      className="text-orange-600 hover:text-orange-800 font-bold inline-flex items-center gap-0.5"
                    >
                      <span>{lastTest ? 'Retester' : 'Tester maintenant'}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Past Log Registers Table */}
          <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Registre des Prélèvements & Contrôles Journaliers</h3>
                <p className="text-xs text-slate-500">Historique complet des audits de conformité de la station requis par le Gérant.</p>
              </div>
              <button 
                type="button"
                onClick={() => setInnerTab('form')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-3 py-1.5 rounded transition-all inline-flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Nouveau contrôle manuel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-500 font-mono text-[9px] uppercase tracking-wider border-b border-slate-200">
                    <th className="p-2.5">Date & Températeur</th>
                    <th className="p-2.5">Cuve / Carburant</th>
                    <th className="p-2.5">Densité relevée</th>
                    <th className="p-2.5">Pâte eau / Résultat</th>
                    <th className="p-2.5">Précision Pistolet</th>
                    <th className="p-2.5">Opérateur</th>
                    <th className="p-2.5">État Général</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {qualityTests.map(q => {
                    const helpR = getStandardDensityRange(q.fuelType);
                    const isDensityCorrect = q.density >= helpR.min && q.density <= helpR.max;
                    const isCheckConform = !q.waterPresence && isDensityCorrect && Math.abs(q.nozzleAccuracyPercent) <= 0.5;

                    return (
                      <tr key={q.id} className="hover:bg-slate-50/70 text-[11px] text-slate-705">
                        <td className="p-2.5 font-sans">
                          <div className="font-semibold text-slate-900">{q.date}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Thermometer className="w-3 h-3 text-red-400" /> {q.temperature}°C (T° Standard 15°C)
                          </div>
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-905">{q.tankName}</div>
                          <div className="text-[9px] bg-slate-150 rounded px-1.5 py-0.2 w-fit text-slate-650 font-mono">{q.fuelType}</div>
                        </td>
                        <td className="p-2.5">
                          <div className="font-mono text-slate-900 font-bold">{q.density.toFixed(3)} kg/L</div>
                          <div className="text-[9px] text-slate-400">Recommandé : {helpR.min.toFixed(3)} - {helpR.max.toFixed(3)}</div>
                        </td>
                        <td className="p-2.5">
                          {q.waterPresence ? (
                            <span className="text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              🚨 Eau détectée ! ({q.waterHeightMm} mm)
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              ✓ Négatif (OK)
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono">
                          <span className={`font-bold ${Math.abs(q.nozzleAccuracyPercent) <= 0.5 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {q.nozzleAccuracyPercent > 0 ? '+' : ''}{q.nozzleAccuracyPercent}%
                          </span>
                          <span className="text-[9px] block text-slate-400">Tolérance : Max ±0.5%</span>
                        </td>
                        <td className="p-2.5 text-slate-600 font-medium">{q.operator}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            isCheckConform ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isCheckConform ? 'CONFORME' : 'ANOMALIE'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteQualityTest(q.id)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-red-600 transition"
                            title="Supprimer la fiche"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {qualityTests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-slate-400">
                        Aucune fiche de contrôle qualité n'a été saisie pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-150 flex items-start gap-2.5 text-xs text-slate-500">
              <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700">Obligations Légales de Conformité Pétrolière :</p>
                <p className="mt-0.5">
                  1. **Densité à 15°C** : Permet de vérifier s'il ya eu mélange frauduleux de kérosène/pétrole lampant ou d'eau, et de valider les volumes reçus par compensation thermique.
                  <br />
                  2. **Recherche de trace d'eau** : S'effectue en appliquant une couche de pâte réactive de couleur brune qui vire au rose vif au contact de la moindres gouttelettes d'eau décantée.
                  <br />
                  3. **Étalonnage Éprouvette** : Obligation d'égouttage périodique pour s'assurer que le client reçoit exactement le volume facturé.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INNER TAB: SUBMIT FORM */}
      {innerTab === 'form' && (
        <div className="bg-white rounded border border-slate-200 shadow-xs p-5 max-w-2xl mx-auto animate-fadeIn" id="quality-test-form-container">
          <h3 className="font-bold text-slate-900 text-sm mb-4 inline-flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-orange-600" /> Saisir un Bulletin de Prélèvement & Contrôle
          </h3>

          <form onSubmit={handleSubmitTest} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sélectionner la cuve inspectée</label>
                <select 
                  className="w-full border border-slate-300 rounded px-2.5 py-2 bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none focus:border-orange-500 font-medium"
                  value={tankId}
                  onChange={e => setTankId(e.target.value)}
                >
                  {tanks.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.fuelType})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Date du contrôle</label>
                <input 
                  type="date"
                  className="w-full border border-slate-300 rounded px-2.5 py-2 font-mono focus:ring-1 focus:ring-orange-500 focus:outline-none focus:border-orange-500"
                  value={testDate}
                  onChange={e => setTestDate(e.target.value)}
                />
              </div>
            </div>

            <div className="p-3 bg-orange-50/20 border border-orange-100 rounded text-slate-705">
              <span className="font-bold text-orange-850">Propriétés recommandées pour {activeTankInfo?.fuelType} :</span>
              <p className="mt-1">
                La densité doit idéalement se situer entre <span className="font-mono font-bold">{helpRange?.min.toFixed(3)}</span> et <span className="font-mono font-bold">{helpRange?.max.toFixed(3)}</span> kg/L à 15°C (courbe de correction thermique normalisée).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Densité réelle relevée (kg/L ou g/cm³)</label>
                <input 
                  type="number"
                  step="0.001"
                  placeholder={`Ex: ${helpRange?.default.toFixed(3)}`}
                  className="w-full border border-slate-300 rounded px-2.5 py-2 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none focus:border-orange-500"
                  value={density}
                  onChange={e => setDensity(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Température du prélèvement (°C)</label>
                <input 
                  type="number"
                  step="0.1"
                  className="w-full border border-slate-300 rounded px-2.5 py-2 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="block text-slate-705 font-bold mb-2">Test de présence d'eau (Pâte détectrice)</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-2.5 rounded">
                  <span className="font-semibold text-slate-700">Eau détectée ?</span>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="waterRadio"
                      checked={!waterPresence} 
                      onChange={() => setWaterPresence(false)} 
                      className="text-orange-600 focus:ring-orange-500"
                    /> Non (RAS)
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="waterRadio"
                      checked={waterPresence} 
                      onChange={() => setWaterPresence(true)} 
                      className="text-orange-600 focus:ring-orange-500"
                    /> Oui (Alerte)
                  </label>
                </div>

                {waterPresence && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Hauteur d'eau mesurée (mm)</label>
                    <input 
                      type="number"
                      placeholder="Ex: 5"
                      className="w-full border border-red-300 bg-red-50/20 rounded px-2.5 py-2 font-mono text-xs text-red-700 focus:ring-1 focus:ring-red-500 focus:outline-none"
                      value={waterHeightMm}
                      onChange={e => setWaterHeightMm(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="block text-slate-705 font-bold mb-1">Écart d'étalonnage compteur (Volucompteur / Éprouvette %)</label>
              <p className="text-[10px] text-slate-500 mb-2">
                Saisissez l'erreur d'égouttage relevée en pourcentage. La limite légale est de <span className="font-semibold">±0.5%</span>. Vous pouvez simuler l'éprouvette dans le troisième onglet.
              </p>
              <div className="flex gap-2">
                <input 
                  type="number"
                  step="0.01"
                  placeholder="Ex: -0.15"
                  className="w-40 border border-slate-300 rounded px-2.5 py-2 font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  value={nozzleAccuracyPercent}
                  onChange={e => setNozzleAccuracyPercent(e.target.value)}
                />
                <span className="self-center font-bold text-slate-650">% d'écart volumétrique</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contrôleur / Opérateur</label>
                <input 
                  type="text"
                  className="w-full border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  value={operator}
                  onChange={e => setOperator(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Remarques / Observations</label>
                <input 
                  type="text"
                  placeholder="Ex: RAS ou Éprouvette stable"
                  className="w-full border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setInnerTab('status')}
                className="bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2 rounded font-semibold hover:bg-slate-300 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-orange-600 border border-orange-700 text-white px-4 py-2 rounded font-bold hover:bg-orange-750 transition flex items-center gap-1 shadow-sm"
              >
                <Check className="w-4 h-4" /> Enregistrer le Bulletin
              </button>
            </div>

          </form>
        </div>
      )}

      {/* INNER TAB: INTERACTIVE NOZZLE CALIBRATOR SIMULATOR */}
      {innerTab === 'nozzle' && (
        <div className="max-w-2xl mx-auto bg-white rounded border border-slate-200 shadow-xs p-5 animate-fadeIn" id="nozzle-calibrator-tool">
          <div className="flex items-start gap-2.5 mb-4">
            <div className="p-2 bg-orange-100 text-orange-700 rounded">
              <Sparkles className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Outil d'Étalonnage de Pistolet à l'Éprouvette Étalon (20 Litres)</h3>
              <p className="text-[11px] text-slate-500">Pour s'assurer que les compteurs débitent le volume exact. Effectuez un prélèvement de 20 litres réels et lisez le volume gravé sur l'éprouvette.</p>
            </div>
          </div>

          <form onSubmit={handleSimulateNozzleTest} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded border border-slate-200">
              <div>
                <label className="block text-slate-750 font-bold mb-1.5">Cuve / Pistolet à tester</label>
                <select 
                  className="w-full border border-slate-300 rounded px-2.5 py-2 bg-white text-xs font-semibold"
                  value={selectedSimTank}
                  onChange={e => setSelectedSimTank(e.target.value)}
                >
                  {tanks.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.fuelType})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-750 font-bold mb-1.5">Volume théorique visé au compteur (Liters)</label>
                <input 
                  type="number"
                  step="1"
                  className="w-full border border-slate-300 rounded px-2.5 py-2 font-mono font-bold text-slate-950 bg-slate-200/50"
                  value={pipetteVolume}
                  onChange={e => setPipetteVolume(e.target.value)}
                  readOnly
                  title="Le jaugeage standard se fait obligatoirement avec une éprouvette étalon de 20.00L."
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Norme métrologique obligatoire : 20,00 L</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-750 font-bold mb-1 hover:underline">Volume réel lu sur le col de l'éprouvette (L)</label>
                <p className="text-[10px] text-slate-500 mb-1.5">Exprimez la graduation lue au ménisque (ex: 20,02L ou 19,97L).</p>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    step="0.01"
                    className="w-40 border border-slate-300 rounded px-2.5 py-2 font-mono font-bold text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    value={measuredVolume}
                    onChange={e => setMeasuredVolume(e.target.value)}
                    required
                  />
                  <span className="self-center font-bold text-slate-700">Litres</span>
                </div>
              </div>

              <div className="flex items-end justify-start sm:justify-end">
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded transition shadow-xs w-full sm:w-auto"
                >
                  Calculer l'écart métrologique
                </button>
              </div>
            </div>

            {simResult !== null && (
              <div className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn ${
                simResult.isConform ? 'bg-emerald-50 border-emerald-250 text-emerald-850' : 'bg-rose-50 border-rose-250 text-rose-850'
              }`}>
                <div>
                  <h4 className="font-bold text-sm">
                    {simResult.isConform ? '✓ Écart conforme à la norme' : '🚨 Écart non conforme ! Réglage requis'}
                  </h4>
                  <p className="text-xs mt-1">
                    Écart de débit calculé : <span className="font-mono font-bold">{simResult.deviation > 0 ? '+' : ''}{simResult.deviation.toFixed(2)}%</span>.
                    {simResult.isConform 
                      ? ' Cet écart respecte la marge d\'erreur tolérée par la loi (limite ±0.5%). Le compteur peut rester en service.' 
                      : ' Attention ! Cette marge dépasse de ±0.5%. Vous devez faire intervenir un technicien métrologue agréé pour plombage du débitmètre.'
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApplySimToForm}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-3.5 py-2 rounded shrink-0 transition-colors shadow flex items-center gap-1.5 justify-center"
                >
                  <Check className="w-3.5 h-3.5" /> Injecter dans le bulletin
                </button>
              </div>
            )}

            {/* Test Simulation assistance container */}
            <div className="bg-slate-50 border border-slate-205 p-4 rounded text-[11px] space-y-2 text-slate-655 text-slate-600 leading-relaxed font-sans">
              <span className="font-bold text-slate-850 block">Comment effectuer l'essai au volucompteur ?</span>
              <p>
                1. Servez précisément du pistolet jusqu'à ce que l'indicateur digital de la pompe affiche exactement <span className="font-bold">20,00 l</span>.
                <br />
                2. Examinez l'éprouvette de verre étalonnée. Lisez la graduation vis-à-vis du ménisque de surface. Le volume doit se situer entre 19,90L (écart de -0.50%) et 20,10L (écart de +0.50%).
                <br />
                3. Videz l'éprouvette dans la cuve correspondante par la bouche de dépotage après le test ("retours éprouvettes").
              </p>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
