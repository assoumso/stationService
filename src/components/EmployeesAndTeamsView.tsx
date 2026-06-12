import React, { useState } from 'react';
import { Employee, Shift, EmployeeRole } from '../types';
import { 
  Users, 
  Clock, 
  Calendar, 
  ToggleLeft, 
  ToggleRight, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  DollarSign, 
  Coins,
  ArrowRight
} from 'lucide-react';

interface EmployeesAndTeamsViewProps {
  employees: Employee[];
  shifts: Shift[];
  onTogglePresence: (id: string) => void;
  onUpdateCommission: (id: string, amount: number) => void;
  onCloseShift: (id: string, cashReceived: number) => void;
}

export default function EmployeesAndTeamsView({
  employees,
  shifts,
  onTogglePresence,
  onUpdateCommission,
  onCloseShift
}: EmployeesAndTeamsViewProps) {
  const [activeTab, setActiveTab] = useState<'roster' | 'shifts'>('roster');

  // local closure states
  const [targetShiftId, setTargetShiftId] = useState<string | null>(null);
  const [reportedCash, setReportedCash] = useState<string>('');

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetShiftId || reportedCash === '') return;
    onCloseShift(targetShiftId, Number(reportedCash));
    setTargetShiftId(null);
    setReportedCash('');
    alert("L'équipe a bien été clôturée. Les comptes de caisse ont été mis à jour !");
  };

  return (
    <div className="space-y-6" id="employees-teams-root font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Gestion des Employés & Équipes</h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Suivi de présence, commissions sur vente, relevés de caisses par équipes (Matin/Soir) et contrôle des soldes.</p>
        </div>

        {/* Local Tab control */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            type="button" 
            onClick={() => setActiveTab('roster')}
            className={`text-xs font-semibold px-4 py-2 rounded-md transition-all inline-flex items-center gap-1.5 ${activeTab === 'roster' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            <Users className="w-4 h-4" /> Personnel ({employees.length})
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('shifts')}
            className={`text-xs font-semibold px-4 py-2 rounded-md transition-all inline-flex items-center gap-1.5 ${activeTab === 'shifts' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            <Clock className="w-4 h-4" /> Équipes & Services (Matin/Soir)
          </button>
        </div>
      </div>

      {/* VIEW PANEL 1: EMPLOYEES ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-6" id="roster-panel">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="employees-grid">
            {employees.map(emp => {
              const isPompiste = emp.role === 'Pompiste';
              const isOperator = emp.role === 'Opérateur Lavage';
              const canEarnCommissions = isPompiste || isOperator || emp.role === 'Caissier';

              return (
                <div key={emp.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    {/* Header: role & present status */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.role === 'Gérant' ? 'bg-slate-900 text-white' :
                        emp.role === 'Comptable' ? 'bg-blue-150 text-blue-900 bg-blue-50' :
                        emp.role === 'Caissier' ? 'bg-purple-100 text-purple-900' :
                        emp.role === 'Pompiste' ? 'bg-amber-100 text-amber-900' : 'bg-cyan-100 text-cyan-900'
                      }`}>
                        {emp.role}
                      </span>

                      {/* Attendance Toggle click */}
                      <button 
                        type="button"
                        onClick={() => onTogglePresence(emp.id)} 
                        className="flex items-center gap-1.5 text-xs focus:outline-none"
                      >
                        <span className="text-[10px] text-slate-500 font-medium">Présence :</span>
                        {emp.isPresent ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Présent
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium flex items-center gap-0.5">
                            <span className="w-2 h-2 bg-slate-300 rounded-full inline-block"></span> Absent
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Meta info */}
                    <h3 className="font-bold text-slate-950 text-sm">{emp.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Actif(ve) aujourd'hui : {emp.lastActive}</p>

                    {/* performance bar chart helper */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span className="inline-flex items-center gap-0.5"><Award className="w-3.5 h-3.5 text-amber-500" /> Score Performance:</span>
                        <span className="font-bold text-slate-800 font-mono">{emp.performanceScore}%</span>
                      </div>
                      <div className="w-full bg-slate-150 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full ${
                            emp.performanceScore >= 90 ? 'bg-emerald-500' :
                            emp.performanceScore >= 80 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${emp.performanceScore}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Payroll numbers */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-550 block text-[10px]">Salaire de base</span>
                        <span className="font-mono font-bold text-slate-900">{emp.baseSalary} FCFA / mois</span>
                      </div>
                      
                      {canEarnCommissions ? (
                        <div>
                          <span className="text-slate-550 block text-[10px] inline-flex items-center gap-0.5">
                            Commissions <Coins className="w-3 h-3 text-amber-600" />
                          </span>
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50/50 px-1 py-0.5 rounded">
                            {emp.commissionsAccumulated.toFixed(0)} FCFA
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-slate-550 block text-[10px]">Taux com.</span>
                          <span className="text-slate-400 font-medium">Non applicable</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual payroll action simulate */}
                  {canEarnCommissions && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex gap-2 justify-between items-center text-xs text-slate-500">
                      <span>Taux : {emp.commissionRate}%</span>
                      <button 
                        type="button"
                        onClick={() => {
                          const amt = prompt("Montant de la commission bonus à attribuer (FCFA):", "15000");
                          if (amt && !isNaN(Number(amt))) {
                            onUpdateCommission(emp.id, Number(amt));
                            alert(`Commission de ${amt} FCFA ajoutée à ${emp.name} !`);
                          }
                        }}
                        className="text-orange-600 hover:text-orange-850 hover:underline font-bold text-xs"
                      >
                        Attribuer prime
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 text-xs text-slate-550">
            <h4 className="font-bold text-slate-850 mb-1.5 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" /> Note sur la performance & commissions pompistes
            </h4>
            <p>Les commissions des pompistes sont reliées directement aux litres de carburants vendus enregistrés sur leur créneau horaire de service. Les caissiers et opérateurs profitent de primes directes sur le chiffre d'affaires et la rapidité du service à la clientèle.</p>
          </div>
        </div>
      )}

      {/* VIEW PANEL 2: SHIFTS / SERVICE HORAIRE */}
      {activeTab === 'shifts' && (
        <div className="space-y-6" id="shifts-panel">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Shifts Listings */}
            <div className="lg:col-span-2 space-y-4">
              {shifts.map(shift => {
                const totalInvoiced = shift.cashInvoiced;
                const totalReceived = shift.cashReceived;
                const balanceGap = shift.gap;

                return (
                  <div key={shift.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs relative">
                    
                    {/* Shift tags & statuses */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          shift.name === 'Équipe Matin' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {shift.name} ({shift.startTime} - {shift.endTime})
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                          shift.status === 'Ouvert' ? 'bg-emerald-100 text-emerald-850 border border-emerald-300 animate-pulse' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {shift.status === 'Ouvert' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>}
                          {shift.status}
                        </span>
                      </div>
                    </div>

                    {/* Personnel on duty */}
                    <div className="mb-4">
                      <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1.5">Personnel affecté</span>
                      <div className="flex flex-wrap gap-1.5">
                        {shift.activeEmployees.map(name => (
                          <span key={name} className="text-xs bg-slate-50 border border-slate-205 text-slate-800 px-2.5 py-1 rounded-md font-semibold">
                            👤 {name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Money reconciliation */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-sans text-xs">
                      <div>
                        <span className="text-slate-500 block">CA Théorique attendu</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{totalInvoiced.toLocaleString()} FCFA</span>
                      </div>
                      
                      <div>
                        <span className="text-slate-500 block">Recette déclarée caisse</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">{totalReceived.toLocaleString()} FCFA</span>
                      </div>

                      <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                        <span className="text-slate-500 block">Écart de service</span>
                        {balanceGap === 0 ? (
                          <span className="text-emerald-600 font-bold font-mono">0 (Équilibré)</span>
                        ) : balanceGap < 0 ? (
                          <div className="inline-flex items-center gap-1">
                            <span className="text-red-600 font-bold font-mono">{balanceGap.toFixed(0)} FCFA</span>
                            <span className="text-[10px] bg-red-150 text-red-900 px-1 rounded font-bold animate-pulse">Dépassement</span>
                          </div>
                        ) : (
                          <span className="text-green-605 font-bold font-mono">+{balanceGap.toFixed(0)} FCFA (Excédent)</span>
                        )}
                      </div>
                    </div>

                    {/* Action - close shift of active teams */}
                    {shift.status === 'Ouvert' && (
                      <div className="mt-4 text-right">
                        <button 
                          onClick={() => {
                            setTargetShiftId(shift.id);
                            setReportedCash(String(shift.cashInvoiced));
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg inline-flex items-center gap-1 transition-colors"
                        >
                          Clôturer le créneau d'équipe <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick reconciliation Action form pops up when target selected */}
            <div className="space-y-4">
              {targetShiftId ? (
                <div className="bg-amber-50 rounded-xl border-2 border-amber-300 p-5 shadow-sm text-xs font-sans">
                  <h3 className="font-bold text-amber-950 text-sm mb-3">Clôture administrative d'Équipe</h3>
                  <p className="text-amber-900 mb-4 text-[11px]">Veuillez compter le cash physique et saisir le montant d'espèces et valeurs reçus du caissier.</p>

                  <form onSubmit={handleCloseShiftSubmit} className="space-y-4">
                    <div>
                      <span className="text-[10px] text-amber-800">Équipe ciblée :</span>
                      <p className="font-bold text-slate-900 text-xs mt-0.5">
                        {shifts.find(s => s.id === targetShiftId)?.name}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-amber-800">CA Théorique Calculé (Litre pompes + boutique) :</span>
                      <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                        {shifts.find(s => s.id === targetShiftId)?.cashInvoiced.toLocaleString()} FCFA
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-amber-950 mb-1">Montant Réel Encaissé physique (FCFA)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="w-full bg-white border border-amber-400 rounded-lg px-3 py-2 font-mono font-bold focus:outline-none"
                        value={reportedCash}
                        onChange={e => setReportedCash(e.target.value)}
                        required
                      />
                    </div>

                    {reportedCash !== '' && (() => {
                      const thObj = shifts.find(s => s.id === targetShiftId);
                      if (!thObj) return null;
                      const cDiff = Number(reportedCash) - thObj.cashInvoiced;
                      return (
                        <div className="p-2.5 bg-white/80 rounded border border-amber-200">
                          <span className="text-[10px] text-amber-800 block">Écart résultant automatique :</span>
                          <span className={`font-mono font-bold text-xs ${cDiff < 0 ? 'text-red-650' : cDiff === 0 ? 'text-emerald-700' : 'text-green-600'}`}>
                            {cDiff === 0 ? 'Aucun écart constaté' : `${cDiff < 0 ? '' : '+'}${cDiff.toFixed(0)} FCFA`}
                          </span>
                        </div>
                      );
                    })()}

                    <div className="flex gap-2.5">
                      <button 
                        type="submit" 
                        className="flex-1 bg-amber-600 text-white font-bold py-2 rounded shadow"
                      >
                        Valider Clôture
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setTargetShiftId(null)}
                        className="bg-transparent border border-amber-300 text-amber-900 px-3 py-2 rounded"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-205 p-5 shadow-xs text-xs text-slate-500">
                  <h4 className="font-bold text-slate-850 mb-2">Process de Clôture d'Équipe</h4>
                  <p className="mb-3">Pour chaque changement d'équipe (relais 14h00), le gestionnaire doit relever les pompes, arrêter la caisse boutique et compter les espèces physiques.</p>
                  <p className="font-semibold text-orange-600">Sélectionnez le bouton "Clôturer le créneau d'équipe" à gauche pour lancer la réconciliation.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
