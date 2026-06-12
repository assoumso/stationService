import React, { useState } from 'react';
import { 
  FuelStock, 
  Pump, 
  Tank, 
  ShopProduct, 
  CarWashRecord, 
  OilChangeRecord, 
  Expense, 
  CashRegister 
} from '../types';
import { FUEL_PRICES } from '../mockData';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Printer, 
  TrendingUp, 
  Lock, 
  CalendarDays,
  FileCheck
} from 'lucide-react';

interface ClotureViewProps {
  fuels: FuelStock[];
  pumps: Pump[];
  tanks: Tank[];
  shopProducts: ShopProduct[];
  carWash: CarWashRecord[];
  oilChanges: OilChangeRecord[];
  expenses: Expense[];
  cashRegisters: CashRegister[];
  onFinalizeDailyClosure: (report: any) => void;
  closureStatus: 'En cours' | 'Clôturé';
}

export default function ClotureView({
  fuels,
  pumps,
  tanks,
  shopProducts,
  carWash,
  oilChanges,
  expenses,
  cashRegisters,
  onFinalizeDailyClosure,
  closureStatus
}: ClotureViewProps) {
  // export states logs
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'excel' | null>(null);

  // --- Compile metrics ---
  const fuelSalesVolume = pumps.reduce((acc, p) => acc + p.volumeSold, 0);
  const fuelRevenue = pumps.reduce((acc, p) => {
    const price = FUEL_PRICES[p.fuelType]?.sell || 0;
    return acc + (p.volumeSold * price);
  }, 0);

  const shopSalesQty = shopProducts.reduce((acc, p) => acc + p.salesCount, 0);
  const shopRevenue = shopProducts.reduce((acc, p) => acc + (p.salesCount * p.sellingPrice), 0);

  const washRevenue = carWash
    .filter(w => w.date === '2026-06-11')
    .reduce((acc, w) => acc + w.revenue, 0);

  const oilRevenue = oilChanges
    .filter(o => o.date === '2026-06-11')
    .reduce((acc, o) => acc + o.chargedPrice, 0);

  const approvedExpenses = expenses
    .filter(e => e.date === '2026-06-11' && e.status === 'Approuvé')
    .reduce((acc, e) => acc + e.amount, 0);

  const totalRevenue = fuelRevenue + shopRevenue + washRevenue + oilRevenue;
  const netEarnings = totalRevenue - approvedExpenses;

  // Breakdown of collections by cash registries
  const cashVal = cashRegisters.find(c => c.method === 'Espèces')?.currentBalance || 0;
  const momoVal = cashRegisters.find(c => c.method === 'Mobile Money')?.currentBalance || 0;
  const cardVal = cashRegisters.find(c => c.method === 'Carte Bancaire')?.currentBalance || 0;
  const chequeVal = cashRegisters.find(c => c.method === 'Chèque')?.currentBalance || 0;

  // Simulate downloading files
  const triggerExport = (format: 'pdf' | 'excel') => {
    setDownloadingFormat(format);
    setTimeout(() => {
      setDownloadingFormat(null);
      
      // Real file naming download simulation
      const filename = `Rapport_Cloture_11_06_2026.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      alert(`Export réussi ! Le document "${filename}" a été compilé et téléchargé avec succès.`);
    }, 1800);
  };

  const handleApplyClosure = () => {
    if (closureStatus === 'Clôturé') {
      alert("La journée du 11 Juin 2026 est déjà clôturée !");
      return;
    }

    const confirmCloture = window.confirm(
      "Êtes-vous sûr de vouloir de procéder à la CLÔTURE JOURNALIÈRE de la station ?\n\nCela figera les relevés d'index de pompes, validera le journal de caisse finale et sauvegardera le bilan."
    );

    if (confirmCloture) {
      onFinalizeDailyClosure({
        fuelRevenue,
        shopRevenue,
        carWashRevenue: washRevenue,
        oilChangeRevenue: oilRevenue,
        totalRevenue,
        totalExpenses: approvedExpenses,
        netProfit: netEarnings,
        mobileMoneyCollected: momoVal,
        cashCollected: cashVal,
        cardCollected: cardVal,
        chequeCollected: chequeVal,
      });
      alert("🎉 Station-service clôturée avec succès pour aujourd'hui !");
    }
  };

  return (
    <div className="space-y-6" id="cloture-view-root font-sans">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Clôture Journalière Automatique</h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Synthèse globale, rapprochement financier instantané et export des rapports réglementaires.</p>
        </div>

        {/* Action button bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => triggerExport('pdf')}
            disabled={downloadingFormat !== null}
            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-semibold px-3 py-2 text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-rose-500" /> 
            {downloadingFormat === 'pdf' ? 'Compilation PDF...' : 'Exporter PDF'}
          </button>
          
          <button 
            onClick={() => triggerExport('excel')}
            disabled={downloadingFormat !== null}
            className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-semibold px-3 py-2 text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" /> 
            {downloadingFormat === 'excel' ? 'Calcul Excel...' : 'Exporter Excel'}
          </button>

          <button 
            onClick={handleApplyClosure}
            className={`font-bold px-4 py-2 text-xs rounded-lg inline-flex items-center gap-1.5 transition-all shadow-md ${
              closureStatus === 'Clôturé' 
                ? 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-400" /> 
            {closureStatus === 'Clôturé' ? 'Journée Clôturée ✔' : 'Clôturer la Journée'}
          </button>
        </div>
      </div>

      {/* Export loading spinner indicator */}
      {downloadingFormat && (
        <div className="bg-slate-800 text-white rounded-xl p-4 flex items-center justify-between animate-pulse">
          <span className="text-xs font-semibold font-mono tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Préparation du fichier d'export ({downloadingFormat === 'pdf' ? 'Rapport_Synthese.pdf' : 'Bilan_Station.xlsx'})...
          </span>
          <span className="text-[10px] text-slate-300">Veuillez ne pas quitter</span>
        </div>
      )}

      {/* RAPPROCHEMENT SHEET TEMPLATE (SIMULATION PRINTOUT) */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-8 shadow-sm max-w-4xl mx-auto relative font-sans leading-relaxed" id="print-sheet-box">
        
        {/* watermark status if closed */}
        {closureStatus === 'Clôturé' && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.06] border-8 border-emerald-700 text-emerald-800 text-6xl font-black rounded-lg p-6 uppercase tracking-widest rotate-12">
            Clôturé Définitif
          </div>
        )}

        {/* Receipt Header info */}
        <div className="flex flex-col sm:flex-row justify-between justify-items-start gap-4 border-b-2 border-slate-900 pb-5 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-950 font-mono tracking-wider">STATION MANAGER PRO</h1>
            <p className="text-xs text-slate-650">Station-Service Continentale Centrale N° 4</p>
            <p className="text-[10px] text-slate-500">Gérant en charge : Jean-Marc Koffi</p>
          </div>
          <div className="sm:text-right text-xs">
            <p className="font-bold flex items-center sm:justify-end gap-1.5 mb-1 text-slate-900">
              <CalendarDays className="w-4 h-4 text-orange-600" /> RAPPORT JOURNALIER D'EXPLOITATION
            </p>
            <p className="font-mono text-[11px] text-slate-600">ID Clôture : CLOT-2026-0611</p>
            <p className="font-mono text-[11px] text-slate-600">Date d'édition : Jeudi 11 Juin 2026</p>
          </div>
        </div>

        {/* Section 1: Breakdown of revenues */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-widest border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-orange-600 rounded-full inline-block"></span> I. Rapprochement des Activités de Spécialités
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Left Box: Fuel index totals */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
              <p className="font-bold text-slate-900 mb-1.5 text-[11px]">Département Carburants (Pompes indexées)</p>
              <div className="space-y-1.5">
                {pumps.map(pump => {
                  const val = pump.volumeSold * (FUEL_PRICES[pump.fuelType]?.sell || 0);
                  return (
                    <div key={pump.id} className="flex justify-between font-mono text-[11px] text-slate-650">
                      <span>{pump.name} ({pump.fuelType}) :</span>
                      <span>{pump.volumeSold} L × {(FUEL_PRICES[pump.fuelType]?.sell || 0).toFixed(0)} FCFA = <span className="font-semibold text-slate-900">{val.toLocaleString()} FCFA</span></span>
                    </div>
                  );
                })}
                <div className="flex justify-between font-bold border-t border-dashed border-slate-350 pt-2 text-slate-950 text-[11.5px]">
                  <span>Total Carburants :</span>
                  <span>{fuelRevenue.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

            {/* Right Box: Shop sales totals */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
              <p className="font-bold text-slate-900 mb-1.5 text-[11px]">Département Boutique (Surcharges)</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Articles vendus :</span>
                  <span className="font-mono">{shopSalesQty} unités</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Panier de commande moyen :</span>
                  <span className="font-mono">{(shopRevenue / (shopSalesQty || 1)).toFixed(0)} FCFA</span>
                </div>
                {shopProducts.filter(p => p.salesCount > 0).slice(0, 3).map(p => (
                  <div key={p.id} className="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>• {p.name} (x{p.salesCount}) :</span>
                    <span>{p.totalRevenue.toFixed(0)} FCFA</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold border-t border-dashed border-slate-350 pt-2 text-slate-950 text-[11.5px]">
                  <span>Total Vente Boutique :</span>
                  <span>{shopRevenue.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Wash + Oil Change */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-widest border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-cyan-600 rounded-full inline-block"></span> II. Rapprochement des Services de Stations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="flex justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="font-bold text-slate-900 text-[11px]">Services Lavage Auto</p>
                <p className="text-[10px] text-slate-500 mt-1">{carWash.filter(w => w.date === '2026-06-11').length} sessions effectuées</p>
              </div>
              <span className="font-mono font-bold text-slate-950 text-sm">{washRevenue.toLocaleString()} FCFA</span>
            </div>

            <div className="flex justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="font-bold text-slate-900 text-[11px]">Prestations de Vidange</p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-1">Marge nette estimée : +{oilRevenue - oilChanges.filter(o => o.date==='2026-06-11').reduce((a,b)=>a+(b.oilCost+b.filterCost),0)} FCFA</p>
              </div>
              <span className="font-mono font-bold text-slate-950 text-sm">{oilRevenue.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Section 3: Expenses and total cashier */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-widest border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-rose-600 rounded-full inline-block"></span> III. Budgets de Caisse, Décaissements & Soldes
          </h3>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-650 font-semibold">
                  <th className="p-2.5">Méthodes comptables de caisse</th>
                  <th className="p-2.5 text-right">Encaissements</th>
                  <th className="p-2.5 text-right font-semibold">Bons Dépenses d'Exploitation</th>
                  <th className="p-2.5 text-right font-bold text-slate-905">Solde Final Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 font-mono text-slate-700">
                <tr>
                  <td className="p-2.5 font-bold font-sans">Espèces physiques</td>
                  <td className="p-2.5 text-right font-mono text-xs">{cashVal.toLocaleString()} FCFA</td>
                  <td className="p-2.5 text-right font-mono text-xs text-red-655 font-semibold">
                    -{approvedExpenses.toLocaleString()} FCFA
                  </td>
                  <td className="p-2.5 text-right font-bold text-slate-955">{ (cashVal - approvedExpenses).toLocaleString() } FCFA</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans">Mobile Money (MTN/Orange)</td>
                  <td className="p-2.5 text-right font-mono text-xs">{momoVal.toLocaleString()} FCFA</td>
                  <td className="p-2.5 text-right font-mono text-xs">-</td>
                  <td className="p-2.5 text-right font-bold font-mono text-xs">{momoVal.toLocaleString()} FCFA</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans">Carte Bancaire client</td>
                  <td className="p-2.5 text-right font-mono text-xs">{cardVal.toLocaleString()} FCFA</td>
                  <td className="p-2.5 text-right font-mono text-xs">-</td>
                  <td className="p-2.5 text-right font-bold font-mono text-xs">{cardVal.toLocaleString()} FCFA</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans">Lettres de Chèques</td>
                  <td className="p-2.5 text-right font-mono text-xs">{chequeVal.toLocaleString()} FCFA</td>
                  <td className="p-2.5 text-right font-mono text-xs">-</td>
                  <td className="p-2.5 text-right font-bold font-mono text-xs">{chequeVal.toLocaleString()} FCFA</td>
                </tr>
                
                {/* Total Line row */}
                <tr className="bg-slate-50 font-bold font-sans">
                  <td className="p-3 text-slate-950 text-xs">TOTAUX RECONCILIATION GENERALES</td>
                  <td className="p-3 text-right font-mono text-xs">{totalRevenue.toLocaleString()} FCFA</td>
                  <td className="p-3 text-right font-mono text-rose-600 text-xs">-{approvedExpenses.toLocaleString()} FCFA</td>
                  <td className="p-3 text-right font-mono text-emerald-700 text-sm">
                    {netEarnings.toLocaleString()} FCFA
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Gaps & Stock warning */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs font-bold text-slate-950 uppercase tracking-widest border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-amber-600 rounded-full inline-block"></span> IV. Écarts de Jaugeage & Coulage constatés
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-205">
              <span className="block font-bold mb-1 text-slate-800 text-[10.5px]">Écarts Carburant (Saisie de Jaugeage)</span>
              <ul className="space-y-1 font-mono text-[10.5px] text-slate-600">
                {fuels.map(f => (
                  <li key={f.id} className="flex justify-between">
                    <span>• {f.product} :</span>
                    <span className={f.gap < 0 ? 'text-red-500 font-bold' : f.gap > 0 ? 'text-green-600 font-bold' : ''}>
                      {f.gap === 0 ? 'Aucun' : f.gap < 0 ? `${f.gap} L` : `+${f.gap} L`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-205 flex flex-col justify-between">
              <div>
                <span className="block font-bold mb-1 text-slate-800 text-[10.5px]">Validation Équipes Shifts</span>
                <span className="text-[11px] text-slate-650">Équipe Matin (Koffi/Sarah) : <span className="text-emerald-700 font-bold">Payée 100%</span></span>
                <span className="block mt-1 text-[11px] text-slate-650">Équipe Soir (Diallo/Sow) : <span className="text-amber-705 font-bold">Prêt pour audit de caisse</span></span>
              </div>
              <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between text-[11px] font-semibold">
                <span>Intégrité des données :</span>
                <span className="text-emerald-700">Audit Conforme</span>
              </div>
            </div>
          </div>
        </div>

        {/* Closing Signature Zone */}
        <div className="grid grid-cols-2 gap-8 text-xs border-t border-slate-350 pt-5 font-sans justify-items-start">
          <div>
            <p className="font-bold text-slate-800 mb-10">Signature du Comptable Exploitation :</p>
            <div className="border-b border-slate-400 w-44"></div>
            <p className="text-[10px] text-slate-500 mt-1">Date: 11 / 06 / 2026</p>
          </div>
          <div className="justify-self-end text-right">
            <p className="font-bold text-slate-800 mb-10">Signature du Gérant / Responsable Station :</p>
            <div className="border-b border-slate-400 w-44 inline-block"></div>
            <p className="text-[10px] text-slate-500 mt-1">Date: 11 / 06 / 2026</p>
          </div>
        </div>

      </div>

    </div>
  );
}
