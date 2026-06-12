import React, { useState } from 'react';
import { CarWashRecord, OilChangeRecord } from '../types';
import { 
  Car, 
  Layers, 
  Activity, 
  HelpCircle, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Check, 
  Gauge, 
  Wrench,
  Sparkles
} from 'lucide-react';

interface ServicesViewProps {
  carWash: CarWashRecord[];
  oilChanges: OilChangeRecord[];
  onAddCarWash: (record: Omit<CarWashRecord, 'id' | 'revenue'>) => void;
  onAddOilChange: (record: Omit<OilChangeRecord, 'id' | 'totalCost' | 'margin'>) => void;
}

export default function ServicesView({
  carWash,
  oilChanges,
  onAddCarWash,
  onAddOilChange
}: ServicesViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'wash' | 'oil'>('wash');

  // --- Lavage Auto Form State ---
  const [washDate, setWashDate] = useState('2026-06-11');
  const [vehicleType, setVehicleType] = useState<'Moto' | 'Citadine' | 'SUV/Berline' | 'Utilitaire'>('Citadine');
  const [washType, setWashType] = useState<'Simple' | 'Complet' | 'Premium'>('Complet');
  const [washQty, setWashQty] = useState(1);
  const [pricePerWash, setPricePerWash] = useState('15');

  // --- Vidange Form State ---
  const [oilDate, setOilDate] = useState('2026-06-11');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [oilBrand, setOilBrand] = useState('Total Quartz 9000 5W40');
  const [oilLiterUsed, setOilLiterUsed] = useState(4.5);
  const [oilCost, setOilCost] = useState('25'); // purchasing cost
  const [filterCost, setFilterCost] = useState('10'); // purchasing cost
  const [laborCost, setLaborCost] = useState('15'); // mechanic labor charge
  const [chargedPrice, setChargedPrice] = useState('85'); // ticket paid by client

  const handleWashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (washQty <= 0 || !pricePerWash) return;

    onAddCarWash({
      date: washDate,
      vehicleType,
      washType,
      quantity: Number(washQty),
      pricePerWash: Number(pricePerWash)
    });

    setWashQty(1);
    alert("Prestation de lavage enregistrée avec succès !");
  };

  const handleOilSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiclePlate || !oilCost || !filterCost || !chargedPrice) {
      alert("Veuillez remplir tous les champs !");
      return;
    }

    onAddOilChange({
      date: oilDate,
      vehiclePlate,
      oilBrand,
      oilLiterUsed: Number(oilLiterUsed),
      oilCost: Number(oilCost),
      filterCost: Number(filterCost),
      laborCost: Number(laborCost),
      chargedPrice: Number(chargedPrice)
    });

    // Reset Form
    setVehiclePlate('');
    alert("Fiche de vidange moteur enregistrée ! Calcul automatique de marge effectué.");
  };

  // Wash totals for today (11 Juin)
  const todayWashCount = carWash
    .filter(w => w.date === '2026-06-11')
    .reduce((acc, curr) => acc + curr.quantity, 0);

  const todayWashRevenue = carWash
    .filter(w => w.date === '2026-06-11')
    .reduce((acc, curr) => acc + curr.revenue, 0);

  // Oil change totals for today
  const todayOilCount = oilChanges
    .filter(o => o.date === '2026-06-11')
    .length;

  const todayOilRevenue = oilChanges
    .filter(o => o.date === '2026-06-11')
    .reduce((acc, curr) => acc + curr.chargedPrice, 0);

  const todayOilMargin = oilChanges
    .filter(o => o.date === '2026-06-11')
    .reduce((acc, curr) => acc + curr.margin, 0);

  return (
    <div className="space-y-6" id="services-view-root font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Services Annexes : Lavage & Vidange</h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Enregistrement des prestations, rapports de volumes de véhicules et analyse de rentabilité / marges.</p>
        </div>

        {/* Local Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            type="button" 
            onClick={() => setActiveSubTab('wash')}
            className={`text-xs font-semibold px-4 py-2 rounded-md transition-all inline-flex items-center gap-1.5 ${activeSubTab === 'wash' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            <Car className="w-4 h-4" /> Lavage Automobile
          </button>
          <button 
            type="button" 
            onClick={() => setActiveSubTab('oil')}
            className={`text-xs font-semibold px-4 py-2 rounded-md transition-all inline-flex items-center gap-1.5 ${activeSubTab === 'oil' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            <Wrench className="w-4 h-4" /> Vidange Moteur
          </button>
        </div>
      </div>

      {/* WORKSPACE 1: CAR WASH */}
      {activeSubTab === 'wash' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="wash-workspace">
          
          {/* Quick Metrics & Recorder forms */}
          <div className="space-y-6">
            
            {/* Today metrics */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Aujourd'hui - Lavage Auto</span>
              <div className="flex items-baseline justify-between mt-2">
                <div>
                  <p className="text-2xl font-bold font-mono text-slate-950">{todayWashRevenue} FCFA</p>
                  <p className="text-xs text-slate-500 mt-1">{todayWashCount} véhicules lavés aujourd'hui</p>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full">+12% vs hier</span>
              </div>
              <div className="absolute top-0 right-0 p-5 opacity-10">
                <Car className="w-16 h-16 text-slate-950" />
              </div>
            </div>

            {/* Recorder form */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-xs font-sans">
              <h3 className="font-bold text-slate-900 text-sm mb-4 inline-flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" /> Saisie Fiche de Lavage
              </h3>

              <form onSubmit={handleWashSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    value={washDate}
                    onChange={e => setWashDate(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gabarit Véhicule</label>
                    <select 
                      className="w-full border border-slate-300 bg-white rounded px-2 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                      value={vehicleType}
                      onChange={e => {
                        const val = e.target.value as any;
                        setVehicleType(val);
                        // Auto estimate standard prices
                        if (val === 'Moto') setPricePerWash('5');
                        else if (val === 'Citadine') setPricePerWash('10');
                        else if (val === 'SUV/Berline') setPricePerWash('20');
                        else setPricePerWash('25');
                      }}
                    >
                      <option value="Moto">Deux Roues / Moto</option>
                      <option value="Citadine">Voiture Citadine</option>
                      <option value="SUV/Berline">SUV / Grande Berline</option>
                      <option value="Utilitaire">Camionnette / Utilitaire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Type de Nettoyage</label>
                    <select 
                      className="w-full border border-slate-300 bg-white rounded px-2 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                      value={washType}
                      onChange={e => {
                        const val = e.target.value as any;
                        setWashType(val);
                        // adjust base price if complet or premium
                        let base = 10;
                        if (vehicleType === 'Moto') base = 5;
                        else if (vehicleType === 'SUV/Berline') base = 20;
                        
                        if (val === 'Simple') setPricePerWash(String(base));
                        else if (val === 'Complet') setPricePerWash(String(base + 5));
                        else setPricePerWash(String(base + 10));
                      }}
                    >
                      <option value="Simple">Lavage Simple (Extérieur)</option>
                      <option value="Complet">Lavage Complet (Int+Ext)</option>
                      <option value="Premium">Lavage Premium (Shampooing+Cire)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nombre de véhicules</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="w-full border border-slate-300 rounded px-2.5 py-2 font-mono"
                      value={washQty}
                      onChange={e => setWashQty(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tarif Unitaire (FCFA)</label>
                    <input 
                      type="number" 
                      className="w-full border border-slate-300 rounded px-2.5 py-2 font-mono text-xs focus:ring-1 focus:ring-slate-900"
                      value={pricePerWash}
                      onChange={e => setPricePerWash(e.target.value)}
                    />
                  </div>
                </div>

                {pricePerWash && (
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-105">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Recette estimée:</span>
                      <span className="font-mono text-emerald-700">{(Number(pricePerWash) * washQty).toFixed(0)} FCFA</span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded inline-flex items-center justify-center gap-1 transition-colors"
                >
                  <Check className="w-4 h-4" /> Enregistrer Prestation Lavage
                </button>
              </form>
            </div>
          </div>

          {/* Records History table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Registre des Saisies de Lavages</h3>
                <span className="text-[10px] text-slate-500 font-mono">Archive des prestations</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <th className="p-3">Date</th>
                      <th className="p-3">Véhicule</th>
                      <th className="p-3">Type Lavage</th>
                      <th className="p-3 text-center">Quantité</th>
                      <th className="p-3 text-right">Tarif u.</th>
                      <th className="p-3 text-right">Recette totale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {carWash.map(w => (
                      <tr key={w.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-900">{w.date}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-400"></span> {w.vehicleType}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                            {w.washType}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono">{w.quantity}</td>
                        <td className="p-3 text-right font-mono">{w.pricePerWash.toFixed(0)} FCFA</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-950">+{w.revenue.toFixed(0)} FCFA</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3.5 flex justify-between text-xs text-slate-500 font-semibold font-sans">
              <span>Recette globale Lavage :</span>
              <span className="font-mono text-slate-950 font-bold">{carWash.reduce((a, b) => a + b.revenue, 0).toLocaleString()} FCFA</span>
            </div>
          </div>

        </div>
      )}

      {/* WORKSPACE 2: OIL CHANGE (VIDANGE) */}
      {activeSubTab === 'oil' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="oil-workspace">
          
          {/* Quick Metrics & Recorder form */}
          <div className="space-y-6">
            
            {/* Today metrics */}
            <div className="bg-white rounded border border-slate-200 p-4 shadow-xs relative overflow-hidden">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Performance financière Vidanges</span>
              <div className="flex items-baseline justify-between mt-2">
                <div>
                  <p className="text-2xl font-bold font-mono text-slate-950">+{todayOilMargin.toLocaleString()} FCFA</p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">Rentabilité de {((todayOilMargin / (todayOilRevenue || 1)) * 100).toFixed(0)}% sur {todayOilCount} services</p>
                </div>
                <span className="text-[10px] bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded">Marge Brute</span>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="w-14 h-14 text-slate-950" />
              </div>
            </div>

            {/* Recorder Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm text-xs font-sans">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 text-sm inline-flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" /> Fiche vidange & marge auto
                </h3>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 rounded-full">Automatique</span>
              </div>

              <form onSubmit={handleOilSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-0.5">Date service</label>
                    <input 
                      type="date" 
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      value={oilDate}
                      onChange={e => setOilDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-0.5">Immatriculation</label>
                    <input 
                      type="text" 
                      placeholder="Ex: AA-123-BB"
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 uppercase"
                      value={vehiclePlate}
                      onChange={e => setVehiclePlate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold mb-0.5">Litre d'huile utilisé</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                      value={oilLiterUsed}
                      onChange={e => setOilLiterUsed(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-0.5 font-sans">Marque Huile Moteur</label>
                    <input 
                      type="text" 
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                      value={oilBrand}
                      onChange={e => setOilBrand(e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 my-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Comptabilité des coûts & marges</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Achat Huile (FCFA)</label>
                      <input 
                        type="number" 
                        className="w-full border border-slate-300 rounded px-1.5 py-1 font-mono text-center"
                        value={oilCost}
                        onChange={e => setOilCost(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Achat Filtres (FCFA)</label>
                      <input 
                        type="number" 
                        className="w-full border border-slate-300 rounded px-1.5 py-1 font-mono text-center"
                        value={filterCost}
                        onChange={e => setFilterCost(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Main d'œuvre (FCFA)</label>
                      <input 
                        type="number" 
                        className="w-full border border-slate-300 rounded px-1.5 py-1 font-mono text-center"
                        value={laborCost}
                        onChange={e => setLaborCost(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tarif Facturé au Client final (FCFA)</label>
                  <input 
                    type="number" 
                    className="w-full border border-orange-300 bg-linear-to-b from-white to-orange-50/10 rounded px-2.5 py-1.5 text-slate-900 font-bold font-mono text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    value={chargedPrice}
                    onChange={e => setChargedPrice(e.target.value)}
                  />
                </div>

                {oilCost && filterCost && chargedPrice && (() => {
                  const itemsCost = Number(oilCost) + Number(filterCost) + Number(laborCost);
                  const clientPaid = Number(chargedPrice);
                  const computedMargin = clientPaid - itemsCost;

                  return (
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-950 font-sans">
                      <div className="flex justify-between font-bold text-xs">
                        <span>Marge bénéficiaire nette :</span>
                        <span className="font-mono text-sm underline decoration-emerald-500">{computedMargin.toFixed(0)} FCFA</span>
                      </div>
                      <p className="text-[9px] text-emerald-850 mt-1">Coût d'opération total : {itemsCost.toFixed(0)} FCFA</p>
                    </div>
                  );
                })()}

                <button 
                  type="submit" 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Valider Fiche & Marge
                </button>
              </form>
            </div>
          </div>

          {/* Records list */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Registre d'Exploitation Vidange</h3>
                <span className="text-[10px] text-slate-500 font-mono">Calcul automatique de marge actif</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="p-3">Date / Immat.</th>
                      <th className="p-3">Huile / Volume</th>
                      <th className="p-3 text-right">Coût Prestat.</th>
                      <th className="p-3 text-right">Facturé Client</th>
                      <th className="p-3 text-right">Marge Réalisée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {oilChanges.map(o => {
                      const totalPurchasing = o.oilCost + o.filterCost + o.laborCost;
                      return (
                        <tr key={o.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <p className="font-semibold text-slate-900">{o.date}</p>
                            <p className="text-[10px] font-mono bg-slate-150 text-slate-800 font-bold px-1.5 py-0.5 rounded-sm w-fit mt-0.5">{o.vehiclePlate}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-medium text-slate-900">{o.oilBrand}</p>
                            <p className="text-[10px] text-slate-500">{o.oilLiterUsed} Litres consommés</p>
                          </td>
                          <td className="p-3 text-right font-mono text-slate-500">
                            {totalPurchasing.toFixed(0)} FCFA
                          </td>
                          <td className="p-3 text-right font-mono text-slate-900 font-bold">
                            {o.chargedPrice.toFixed(0)} FCFA
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30">
                            +{o.margin.toFixed(0)} FCFA
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3.5 space-y-1 text-slate-500 text-xs">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Chiffre d'Affaires total Vidanges:</span>
                <span className="font-mono">{oilChanges.reduce((a, b) => a + b.chargedPrice, 0).toFixed(0)} FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-200">
                <span>Marge Cumulative totale dégagée :</span>
                <span className="font-mono text-sm">+{oilChanges.reduce((a, b) => a + b.margin, 0).toFixed(0)} FCFA</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
