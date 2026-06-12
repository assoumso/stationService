import React, { useState } from 'react';
import { CashRegister, Expense, ExpenseCategory } from '../types';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  FileCheck, 
  Plus, 
  Check, 
  X, 
  ShieldAlert, 
  Activity, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface CaisseAndDépensesViewProps {
  cashRegisters: CashRegister[];
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'status'>) => void;
  onApproveExpense: (id: string) => void;
  onRejectExpense: (id: string) => void;
}

export default function CaisseAndDépensesView({
  cashRegisters,
  expenses,
  onAddExpense,
  onApproveExpense,
  onRejectExpense
}: CaisseAndDépensesViewProps) {
  const [activeTab, setActiveTab] = useState<'methods' | 'expenses'>('methods');

  // --- New Expense Form State ---
  const [category, setCategory] = useState<ExpenseCategory>('Carburant groupe électrogène');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [requestedBy, setRequestedBy] = useState('Jean-Marc Koffi');
  const [expenseDate, setExpenseDate] = useState('2026-06-11');

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) {
      alert("Veuillez saisir une description et un montant !");
      return;
    }

    onAddExpense({
      category,
      description,
      amount: Number(amount),
      date: expenseDate,
      requestedBy
    });

    // Reset Form
    setDescription('');
    setAmount('');
    alert("Demande de dépense enregistrée ! Elle est 'En attente' de validation par un responsable.");
  };

  // Calculations for Caisses
  const totalCaisse = cashRegisters.reduce((acc, cr) => acc + cr.currentBalance, 0);
  
  // Total approved expenses
  const totalApprovedExpensesVal = expenses
    .filter(ex => ex.status === 'Approuvé')
    .reduce((acc, ex) => acc + ex.amount, 0);

  return (
    <div className="space-y-6" id="caisse-depenses-root font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Gestion de Caisse & Dépenses d'Exploitation</h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Suivi des flux monétaires multi-canaux et validation des bons de décaissements par la direction.</p>
        </div>

        {/* Local view toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            type="button" 
            onClick={() => setActiveTab('methods')}
            className={`text-xs font-semibold px-4 py-2 rounded-md transition-all inline-flex items-center gap-1.5 ${activeTab === 'methods' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            <Wallet className="w-4 h-4" /> Comptes & Soldes
          </button>
          <button 
            type="button" 
            onClick={() => setActiveTab('expenses')}
            className={`text-xs font-semibold px-4 py-2 rounded-md transition-all inline-flex items-center gap-1.5 ${activeTab === 'expenses' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            <FileCheck className="w-4 h-4" /> Dépenses & Approbations
          </button>
        </div>
      </div>

      {/* VIEW TAB 1: CASH REGISTERS BALANCES */}
      {activeTab === 'methods' && (
        <div className="space-y-6" id="methods-subtab">
          
          {/* Main big display */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Trésorerie de Caisse Disponible (Solde net)</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
                  {totalCaisse.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                </span>
                <span className="text-lg font-bold text-slate-400">FCFA</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">Calculé automatiquement : Total Encaissements Moins Dépenses d'Exploitation Validées.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-700 w-full md:w-auto">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 min-w-[150px]">
                <span className="text-[10px] text-slate-400 font-semibold block">Cumul Dépenses Payées</span>
                <span className="font-mono font-bold text-slate-100 text-sm mt-0.5">-{totalApprovedExpensesVal.toLocaleString()} FCFA</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 min-w-[150px]">
                <span className="text-[10px] text-slate-400 font-semibold block">Situation du coffre fort</span>
                <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5">Sécurisé</span>
              </div>
            </div>
          </div>

          {/* Cards for each collection method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="cashregisters-cards">
            {cashRegisters.map(cr => {
              const icon = cr.method === 'Espèces' ? <Wallet className="w-5 h-5 text-emerald-600" /> :
                           cr.method === 'Mobile Money' ? <Smartphone className="w-5 h-5 text-orange-650" /> :
                           cr.method === 'Carte Bancaire' ? <CreditCard className="w-5 h-5 text-blue-600" /> :
                           <FileCheck className="w-5 h-5 text-purple-600" />;
              
              const isDanger = cr.currentBalance < 500;

              return (
                <div key={cr.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{cr.method}</span>
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                        {icon}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-bold font-mono tracking-tight text-slate-900">
                        {cr.currentBalance.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">FCFA</span>
                    </div>

                    {cr.method === 'Mobile Money' && (
                      <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded-sm inline-block mt-2">
                        MTN Mobile / Orange Money
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                    Synchro le : {cr.lastUpdated}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Caisse advice block */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3 text-xs text-amber-900">
            <HelpCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Politique de Caisse Centrale :</p>
              <p>Les encaissements en Espèces de plus de <span className="font-semibold">1 500 000 FCFA</span> sur une seule équipe doivent impérativement être déposés dans le coffre-fort de sécurité par le gérant principal pour réduire les risques de vol.</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: EXPENSES APPROVAL SYSTEM */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="expenses-subtab">
          
          {/* Left Column: Create Voucher */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-fit">
            <h3 className="font-bold text-slate-900 text-sm mb-4 inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" /> Saisie Bon de Décaissement
            </h3>

            <form onSubmit={handleExpenseSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-705 font-semibold mb-1">Catégorie Dépense</label>
                <select 
                  className="w-full border border-slate-300 rounded px-2.5 py-2 bg-white focus:outline-none"
                  value={category}
                  onChange={e => setCategory(e.target.value as ExpenseCategory)}
                >
                  <option value="Carburant groupe électrogène">Carburant groupe électrogène</option>
                  <option value="Transport">Transport</option>
                  <option value="Entretien">Entretien piste / boutiques</option>
                  <option value="Réparations">Réparations pompes / pistolets</option>
                  <option value="Fournitures">Fournitures bureau & caisse</option>
                  <option value="Autres">Autres charges d'exploitation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-750 font-semibold mb-1">Montant facturé (FCFA)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Ex: 120"
                  className="w-full border border-slate-300 rounded px-2.5 py-2 font-mono text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-slate-705 font-semibold mb-1">Motif de la dépense / Description</label>
                <textarea 
                  rows={3}
                  placeholder="Ex: Achat d'urgence de gasoil secours pour le groupe..."
                  className="w-full border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-705 font-semibold mb-1">Demandé par</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded px-2.5 py-2 focus:outline-none"
                    value={requestedBy}
                    onChange={e => setRequestedBy(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-705 font-semibold mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full border border-slate-300 rounded px-2.5 py-2 focus:outline-none"
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded shadow-xs"
              >
                Soumettre demande de paiement
              </button>
            </form>
          </div>

          {/* Right Columns: Approbations lists */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Header counters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Responsable Validation Dashboard</h3>
                <p className="text-xs text-slate-500">Un responsable doit valider les bons de dépenses pour qu'ils impactent la comptabilité de caisse.</p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-md font-semibold">
                  {expenses.filter(e => e.status === 'En attente').length} En attente
                </span>
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-850 px-2.5 py-1 rounded-md font-semibold">
                  {expenses.filter(e => e.status === 'Approuvé').length} Approuvé(s)
                </span>
              </div>
            </div>

            {/* List of expenses with voucher styles */}
            <div className="space-y-3">
              {expenses.map(expense => {
                const isPending = expense.status === 'En attente';
                const isApproved = expense.status === 'Approuvé';
                
                return (
                  <div key={expense.id} className={`bg-white rounded-xl border p-4.5 shadow-xs relative overflow-hidden transition-all ${
                    isPending ? 'border-amber-300 bg-amber-50/5' : isApproved ? 'border-slate-200' : 'border-slate-100 opacity-60'
                  }`}>
                    
                    {/* Color left anchor strip */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                      isPending ? 'bg-amber-500' : isApproved ? 'bg-emerald-600' : 'bg-red-500'
                    }`}></div>

                    <div className="pl-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-950 text-xs">{expense.category}</h4>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              isPending ? 'bg-amber-150 text-amber-850 bg-amber-100' :
                              isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {expense.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1.5 font-medium italic">"{expense.description}"</p>
                          <p className="text-[10px] text-slate-550 mt-1">Émis par {expense.requestedBy} • Date : {expense.date}</p>
                        </div>

                        {/* Amount & action controls */}
                        <div className="sm:text-right flex items-center sm:flex-col justify-between sm:justify-center border-t sm:border-0 pt-2.5 sm:pt-0 border-slate-100 gap-3">
                          <p className="font-mono font-bold text-slate-950 text-sm">
                            -{expense.amount.toFixed(0)} FCFA
                          </p>

                          {isPending ? (
                            <div className="flex items-center gap-1.5 self-end">
                              <button 
                                onClick={() => onApproveExpense(expense.id)}
                                className="bg-emerald-600 font-bold hover:bg-emerald-700 text-white rounded p-1 inline-flex items-center"
                                title="Approuver décaissement"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => onRejectExpense(expense.id)}
                                className="bg-red-650 font-bold hover:bg-red-705 text-white rounded p-1 inline-flex items-center"
                                title="Rejeter décaissement"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            expense.approvedBy && (
                              <p className="text-[9px] text-slate-400 font-medium">Validé par: {expense.approvedBy}</p>
                            )
                          )}
                        </div>

                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
