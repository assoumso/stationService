import React, { useState } from 'react';
import { ClientAccount, CreditTransaction, FuelType } from '../types';
import { 
  Users, 
  Plus, 
  Trash2, 
  Printer, 
  Search, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  DollarSign,
  AlertTriangle,
  History,
  Calendar,
  X,
  UserCheck,
  ClipboardList
} from 'lucide-react';

interface CreditsViewProps {
  accounts: ClientAccount[];
  transactions: CreditTransaction[];
  onAddAccount: (account: ClientAccount) => void;
  onDeleteAccount: (id: string) => void;
  onAddTransaction: (transaction: CreditTransaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function CreditsView({
  accounts,
  transactions,
  onAddAccount,
  onDeleteAccount,
  onAddTransaction,
  onDeleteTransaction
}: CreditsViewProps) {
  // Navigation active tab within Credits View
  const [subTab, setSubTab] = useState<'accounts' | 'transactions'>('accounts');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');

  // Modals status
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // New Account Fields
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [creditLimit, setCreditLimit] = useState<number | ''>('');

  // New Transaction Fields
  const [txClientId, setTxClientId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txType, setTxType] = useState<'Achat Crédit' | 'Règlement / Paiement'>('Achat Crédit');
  const [txAmount, setTxAmount] = useState<number | ''>('');
  const [txPaymentMethod, setTxPaymentMethod] = useState<'Espèces' | 'Chèque' | 'Virement' | 'Mobile Money'>('Espèces');
  const [txFuelType, setTxFuelType] = useState<FuelType>('Gasoil');
  const [txVolumeLiters, setTxVolumeLiters] = useState<number | ''>('');
  const [txCouponNumber, setTxCouponNumber] = useState('');
  const [txDriverName, setTxDriverName] = useState('');
  const [txPlates, setTxPlates] = useState('');
  const [txNotes, setTxNotes] = useState('');

  // Settle Account Balance details
  const totalBalanceOwed = accounts.reduce((acc, a) => acc + a.totalCreditDetails, 0);
  const totalLimitsSet = accounts.reduce((acc, a) => acc + a.creditLimit, 0);
  const totalTransactionsCount = transactions.length;

  // Handles adding client account
  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) {
      alert("Veuillez renseigner le nom de l'entreprise.");
      return;
    }

    const newAcc: ClientAccount = {
      id: 'cli_' + Date.now(),
      companyName,
      contactName,
      phoneNumber,
      creditLimit: Number(creditLimit) || 0,
      totalCreditDetails: 0,
      lastOperationDate: new Date().toISOString().split('T')[0]
    };

    onAddAccount(newAcc);
    setIsAccountModalOpen(false);
    
    // Clear
    setCompanyName('');
    setContactName('');
    setPhoneNumber('');
    setCreditLimit('');
  };

  // Handles adding transaction (Achat crédit / Règlement)
  const handleAddTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txClientId || !txAmount) {
      alert("Veuillez remplir tous les champs obligatoires (Client et Montant).");
      return;
    }

    const value = Number(txAmount);
    
    // Fetch client to check credit limits
    const client = accounts.find(a => a.id === txClientId);
    if (txType === 'Achat Crédit' && client) {
      const projectedTotal = client.totalCreditDetails + value;
      if (projectedTotal > client.creditLimit) {
        const confirmExceed = window.confirm(
          `ALERTE : Cette vente d'un montant de ${value.toLocaleString()} FCFA va dépasser la limite de crédit autorisée de ce client (${client.creditLimit.toLocaleString()} FCFA). \n\nSouhaitez-vous forcer et valider quand même ?`
        );
        if (!confirmExceed) return;
      }
    }

    const newTx: CreditTransaction = {
      id: 'ctx_' + Date.now(),
      clientId: txClientId,
      date: txDate,
      type: txType,
      amount: value,
      paymentMethod: txType === 'Règlement / Paiement' ? txPaymentMethod : undefined,
      fuelType: txType === 'Achat Crédit' ? txFuelType : undefined,
      volumeLiters: txType === 'Achat Crédit' && txVolumeLiters !== '' ? Number(txVolumeLiters) : undefined,
      couponNumber: txType === 'Achat Crédit' && txCouponNumber ? txCouponNumber : undefined,
      driverName: txDriverName || undefined,
      plates: txPlates ? txPlates.toUpperCase() : undefined,
      notes: txNotes || undefined
    };

    onAddTransaction(newTx);
    setIsTransactionModalOpen(false);

    // reset fields
    setTxClientId('');
    setTxAmount('');
    setTxVolumeLiters('');
    setTxCouponNumber('');
    setTxDriverName('');
    setTxPlates('');
    setTxNotes('');
  };

  // Filter Accounts & Transactions
  const filteredAccounts = accounts.filter(acc => {
    const query = searchQuery.toLowerCase();
    return (
      acc.companyName.toLowerCase().includes(query) ||
      acc.contactName.toLowerCase().includes(query) ||
      acc.phoneNumber.includes(query)
    );
  });

  const filteredTransactions = transactions.filter(tx => {
    const matchesClient = selectedClientId === 'all' ? true : tx.clientId === selectedClientId;
    const client = accounts.find(a => a.id === tx.clientId);
    const clientName = client ? client.companyName.toLowerCase() : '';
    const noteMatch = tx.notes ? tx.notes.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const couponMatch = tx.couponNumber ? tx.couponNumber.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    const platesMatch = tx.plates ? tx.plates.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    
    const matchesSearch = searchQuery === '' ? true : (
      clientName.includes(searchQuery.toLowerCase()) || 
      noteMatch || 
      couponMatch || 
      platesMatch
    );

    return matchesClient && matchesSearch;
  });

  // Sort transactions by date descending
  const sortedTransactions = [...filteredTransactions].sort((a, b) => b.date.localeCompare(a.date));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4" id="credits-management-view">
      
      {/* 1. HEADER (ÉCRAN SEULEMENT) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            GESTION ET ENCOURS FINANCIERS
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            Crédit B2B & Bons Clients
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Suivi des comptes entreprises partenaires, bons de livraison à crédit et acomptes de règlement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Imprimer Rapport Crédit
          </button>

          {/* Solder / Régler Acompte button */}
          <button
            type="button"
            onClick={() => {
              setTxType('Règlement / Paiement');
              setTxAmount('');
              setTxNotes('');
              setIsTransactionModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            Enregistrer Règlement
          </button>

          {/* Nouveau Client bouton */}
          <button
            type="button"
            onClick={() => {
              setCompanyName('');
              setContactName('');
              setPhoneNumber('');
              setCreditLimit(1500000);
              setIsAccountModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter un Client
          </button>
        </div>
      </div>

      {/* --- BLOC PRINT HEADER (IMPRESSION SEULEMENT) --- */}
      <div className="hidden print:block space-y-4 text-black font-sans bg-white pb-3 border-b border-black">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide">STATION BARAKAT</h1>
            <p className="text-[10px] text-gray-650">Douala - Cameroun</p>
            <p className="text-[10px] text-gray-500">Gérant : Jean-Marc Koffi</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black tracking-tight uppercase text-emerald-900">RAPPORT DES COMPTES DE CRÉDIT CLIENTS</h2>
            <p className="text-[10px] text-gray-500">
              Date d'impression : {new Date().toLocaleDateString('fr-FR')} - {new Date().toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
        
        {/* Rappel des données globales à l'impression */}
        <div className="grid grid-cols-3 border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-xs font-mono">
          <div>
            <span className="text-gray-500 uppercase text-[9px] block font-bold">Encours Crédit Total</span>
            <span className="font-bold text-sm text-red-800">{totalBalanceOwed.toLocaleString()} FCFA</span>
          </div>
          <div>
            <span className="text-gray-500 uppercase text-[9px] block font-bold">Total Limites Accordées</span>
            <span className="font-bold text-sm text-gray-800">{totalLimitsSet.toLocaleString()} FCFA</span>
          </div>
          <div>
            <span className="text-gray-500 uppercase text-[9px] block font-bold">Taux de Risque Global</span>
            <span className="font-bold text-sm text-gray-800">
              {totalLimitsSet > 0 ? ((totalBalanceOwed / totalLimitsSet) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. STATS SUMS (ÉCRAN SEULEMENT) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        {/* 1. Encours Total */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Encours Crédit Global</span>
              <p className="font-mono font-black text-lg text-rose-600 mt-0.5">{totalBalanceOwed.toLocaleString()} FCFA</p>
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-400">
            Dette active à recouvrer
          </div>
        </div>

        {/* 2. Limites accordées */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Plafond Crédit Autorisé</span>
              <p className="font-mono font-black text-lg text-slate-800 mt-0.5">{totalLimitsSet.toLocaleString()} FCFA</p>
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-emerald-600 font-bold">
            {totalLimitsSet > 0 ? ((totalBalanceOwed / totalLimitsSet) * 100).toFixed(1) : 0}% engagés
          </div>
        </div>

        {/* 3. Nombre de transactions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Opérations de Crédit</span>
              <p className="font-mono font-black text-lg text-indigo-600 mt-0.5">{totalTransactionsCount} Fiches</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setTxType('Achat Crédit');
              setTxAmount('');
              setTxNotes('');
              setIsTransactionModalOpen(true);
            }}
            className="px-2.5 py-1 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Nouveau Bon
          </button>
        </div>
      </div>

      {/* 3. SUBTABS (ÉCRAN SEULEMENT) */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-0.5 print:hidden">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setSubTab('accounts')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              subTab === 'accounts' 
                ? 'border-emerald-600 text-emerald-800' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Fiches de Comptes Clients ({accounts.length})
          </button>
          
          <button
            type="button"
            onClick={() => setSubTab('transactions')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              subTab === 'transactions' 
                ? 'border-emerald-600 text-emerald-800' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Historique des Bons & Règlements
          </button>
        </div>

        {/* Dynamic Context Filters based on active Tab */}
        <div className="flex items-center gap-2">
          {subTab === 'accounts' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher une entreprise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 outline-none w-48 focus:border-emerald-500/60 bg-white"
              />
            </div>
          )}

          {subTab === 'transactions' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 bg-white rounded-lg cursor-pointer outline-none focus:border-indigo-500"
              >
                <option value="all">Tous les clients</option>
                {accounts.map(cl => (
                  <option key={cl.id} value={cl.id}>{cl.companyName}</option>
                ))}
              </select>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="N° Bon, Matricules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-200 outline-none w-44 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- CONTENT AREA --- */}

      {/* VIEW 1: ACCOUNTS LIST */}
      {subTab === 'accounts' && (
        <div className="space-y-4" id="credits-accounts-list">
          <div className="bg-white rounded-2xl border border-slate-200/95 overflow-hidden shadow-xs print:border-none print:shadow-none">
            <table className="w-full text-left border-collapse table-fixed min-w-[650px] print:text-black print:min-w-0 print:w-full">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-850 text-white select-none print:bg-gray-100 print:text-black print:border-b-2 print:border-black">
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[220px] print:p-1.5 print:text-[8px] print:w-[150px]">Raison Sociale Client</th>
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[150px] print:p-1.5 print:text-[8px]">Responsable / Contact</th>
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[120px] print:p-1.5 print:text-[8px]">Téléphone</th>
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider text-right w-[150px] print:p-1.5 print:text-[8px]">Limite Crédit</th>
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider text-right w-[150px] print:p-1.5 print:text-[8px]">Encours (Dû)</th>
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider text-center w-[120px] print:p-1.5 print:text-[8px]">Statut Alerte</th>
                  <th className="p-3 text-center text-[10px] font-extrabold uppercase tracking-wider w-[70px] print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-y print:divide-gray-300">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      Aucune entreprise client enregistrée.
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map(account => {
                    const ratio = account.creditLimit > 0 ? (account.totalCreditDetails / account.creditLimit) : 0;
                    const isDangerous = ratio >= 0.85;
                    const isExceeded = account.totalCreditDetails > account.creditLimit;

                    return (
                      <tr key={account.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-bold text-slate-850 truncate print:p-1.5 print:text-[9px]">
                          {account.companyName}
                        </td>
                        <td className="p-3 text-slate-650 truncate print:p-1.5 print:text-[9px]">
                          {account.contactName || '-'}
                        </td>
                        <td className="p-3 font-mono text-slate-600 text-xs print:p-1.5 print:text-[8px]">
                          {account.phoneNumber || '-'}
                        </td>
                        <td className="p-3 font-mono text-right text-slate-800 font-bold print:p-1.5 print:text-[8px]">
                          {account.creditLimit.toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-right text-rose-650 font-black print:p-1.5 print:text-[8px]">
                          {account.totalCreditDetails.toLocaleString()}
                        </td>
                        <td className="p-3 print:p-1.5">
                          <div className="flex items-center justify-center">
                            {isExceeded ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] bg-red-100 text-red-700 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" /> Dépassé
                              </span>
                            ) : isDangerous ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-100 text-amber-700 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" /> Critique (85%)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-700 font-semibold">
                                Correct
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center print:hidden">
                          <button
                            type="button"
                            onClick={() => {
                              if (account.totalCreditDetails > 0) {
                                alert(`Impossible de supprimer un client possédant un encours actif de ${account.totalCreditDetails.toLocaleString()} FCFA. Veuillez d'abord enregistrer un règlement total.`);
                                return;
                              }
                              if (window.confirm(`Supprimer la fiche client de "${account.companyName}" ?`)) {
                                onDeleteAccount(account.id);
                              }
                            }}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                            title="Supprimer la fiche client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: TRANSACTIONS LIST */}
      {subTab === 'transactions' && (
        <div className="space-y-4" id="credits-transactions-list">
          <div className="bg-white rounded-2xl border border-slate-200/95 overflow-hidden shadow-xs print:border-none print:shadow-none">
            <table className="w-full text-left border-collapse table-fixed min-w-[700px] print:text-black print:min-w-0 print:w-full">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-850 text-white select-none print:bg-gray-100 print:text-black print:border-b-2 print:border-black">
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[90px] print:p-1.5 print:text-[8px] print:w-[65px]">Date</th>
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[180px] print:p-1.5 print:text-[8px] print:w-[130px]">Client / Entreprise</th>
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[110px] print:p-1.5 print:text-[8px] print:w-[90px] text-center">Type Opération</th>
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider text-right w-[120px] print:p-1.5 print:text-[8px]">Montant FCFA</th>
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[130px] print:p-1.5 print:text-[8px] print:w-[100px]">Carburant & Vol.</th>
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[110px] print:p-1.5 print:text-[8px] print:w-[80px]">Réf. / N° Bon</th>
                  <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[140px] print:p-1.5 print:text-[8px] print:w-[110px]">Chauffeur / Véhic.</th>
                  <th className="p-3 text-center text-[10px] font-extrabold uppercase tracking-wider w-[50px] print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-y print:divide-gray-300">
                {sortedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                      Aucun bon ni règlement répertorié pour ces filtres.
                    </td>
                  </tr>
                ) : (
                  sortedTransactions.map(tx => {
                    const client = accounts.find(a => a.id === tx.clientId);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Date */}
                        <td className="p-3 font-mono text-xs text-slate-700 print:p-1.5 print:text-[8.5px]">
                          {new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                        </td>
                        
                        {/* Partner Client */}
                        <td className="p-3 font-bold text-slate-800 truncate print:p-1.5 print:text-[9px]">
                          {client ? client.companyName : 'Inconnu ou Supprimé'}
                        </td>
                        
                        {/* Type Flag */}
                        <td className="p-3 text-center print:p-1.5">
                          {tx.type === 'Achat Crédit' ? (
                            <span className="px-2 py-0.5 rounded-full text-[8.5px] bg-amber-50 text-amber-700 border border-amber-200/50 font-semibold block text-center">
                              Bon Caisses (-)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[8.5px] bg-emerald-50 text-emerald-700 border border-emerald-200/50 font-semibold block text-center">
                              Acompte Recu (+)
                            </span>
                          )}
                        </td>
                        
                        {/* Amount */}
                        <td className={`p-3 font-mono text-right font-black print:p-1.5 print:text-[8.5px] ${
                          tx.type === 'Achat Crédit' ? 'text-rose-650' : 'text-emerald-600'
                        }`}>
                          {tx.type === 'Achat Crédit' ? '+' : '-'}{tx.amount.toLocaleString()}
                        </td>

                        {/* Carb / Volume */}
                        <td className="p-3 font-medium text-slate-600 text-xs truncate print:p-1.5 print:text-[8.5px]">
                          {tx.fuelType ? (
                            <span>{tx.fuelType} ({tx.volumeLiters || 0} L)</span>
                          ) : (
                            <span className="text-slate-400 font-mono italic text-[10px]">Mode : {tx.paymentMethod}</span>
                          )}
                        </td>

                        {/* Coupon Register */}
                        <td className="p-3 font-mono text-slate-700 font-semibold text-xs print:p-1.5 print:text-[8.5px]">
                          {tx.couponNumber || <span className="text-slate-300">-</span>}
                        </td>

                        {/* Driver / Plate */}
                        <td className="p-3 text-slate-650 text-xs truncate print:p-1.5 print:text-[8.5px]">
                          {tx.driverName ? (
                            <span>{tx.driverName} {tx.plates ? `[${tx.plates}]` : ''}</span>
                          ) : (
                            <span className="text-slate-400 italic">Administrateur</span>
                          )}
                        </td>

                        {/* Delete entry */}
                        <td className="p-3 text-center print:hidden">
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm("Voulez-vous annuler et supprimer définitivement cette transaction ?\n\nCela réajustera l'encours global du client de façon immédiate.")) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-all cursor-pointer"
                            title="Supprimer transaction"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MODAL : CRÉATION CLIENT --- */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:hidden" id="account-modal-wrapper">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <h2 className="font-bold text-xs tracking-tight text-white uppercase">Créer un Compte Client B2B</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccountSubmit} className="p-5 space-y-4 text-slate-650 text-xs text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Raison Sociale / Entreprise *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Transports Camerounais S.A."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 focus:bg-white bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nom du Contact Responsable</label>
                <input
                  type="text"
                  placeholder="Ex: M. Ndongo Paul"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 focus:bg-white bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Téléphone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="Ex: +237 699 99 99 99"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 focus:bg-white bg-slate-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Limite de Crédit Autorisée (FCFA) *</label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 5000000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 focus:bg-white font-mono font-bold bg-slate-50"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Enregistrer Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL : SAISIE TRANSACTION (BON OU RÈGLEMENT) --- */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:hidden" id="tx-modal-wrapper">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <h2 className="font-bold text-xs tracking-tight text-white uppercase">Nouvelle Saisie Crédit / Encaissement</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsTransactionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransactionSubmit} className="flex flex-col overflow-hidden max-h-full">
              <div className="p-5 space-y-3 text-slate-650 text-xs overflow-y-auto flex-1">
                
                {/* Switch between purchase vs payment */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('Achat Crédit');
                    }}
                    className={`py-1 rounded-lg text-xs font-bold transition-all border ${
                      txType === 'Achat Crédit' 
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Prélèvement Bon Crédit (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('Règlement / Paiement');
                    }}
                    className={`py-1 rounded-lg text-xs font-bold transition-all border ${
                      txType === 'Règlement / Paiement' 
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Acompte / Règlement (+)
                  </button>
                </div>

                {/* Client Company */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Client Débiteur *</label>
                  <select
                    required
                    value={txClientId}
                    onChange={(e) => setTxClientId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white cursor-pointer outline-none"
                  >
                    <option value="">-- Choisir le Client --</option>
                    {accounts.map(cl => (
                      <option key={cl.id} value={cl.id}>{cl.companyName}</option>
                    ))}
                  </select>
                </div>

                {/* Date & Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Date d'opération</label>
                    <input
                      type="date"
                      required
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Montant Intégral (FCFA) *</label>
                    <input
                      type="number"
                      required
                      placeholder="Ex: 500000"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* Dynamic fields based on operation type */}
                {txType === 'Achat Crédit' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase block">Carburant livré</label>
                        <select
                          value={txFuelType}
                          onChange={(e) => setTxFuelType(e.target.value as FuelType)}
                          className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="Super">Super</option>
                          <option value="Sans plomb">Sans plomb</option>
                          <option value="Gasoil">Gasoil</option>
                          <option value="Pétrole">Pétrole</option>
                          <option value="Gaz">Gaz</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase block">Volume (Litre)</label>
                        <input
                          type="number"
                          placeholder="Ex: 100"
                          value={txVolumeLiters}
                          onChange={(e) => setTxVolumeLiters(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">N° Bon de Carburant</label>
                        <input
                          type="text"
                          placeholder="Ex: BON-SFL-1982"
                          value={txCouponNumber}
                          onChange={(e) => setTxCouponNumber(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block">Matricule Véhicule</label>
                        <input
                          type="text"
                          placeholder="Ex: LT 1234 A"
                          value={txPlates}
                          onChange={(e) => setTxPlates(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">Nom du Chauffeur</label>
                      <input
                        type="text"
                        placeholder="Ex: Ibrahim Sow"
                        value={txDriverName}
                        onChange={(e) => setTxDriverName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Méthode d'encaissement</label>
                    <select
                      value={txPaymentMethod}
                      onChange={(e) => setTxPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white outline-none"
                    >
                      <option value="Espèces">Espèces (Versement Caisse)</option>
                      <option value="Chèque">Chèque Bancaire</option>
                      <option value="Virement">Virement Bancaire (Afriland/Bicec...)</option>
                      <option value="Mobile Money">Orange Money / MTN Momo</option>
                    </select>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Notes complémentaires</label>
                  <textarea
                    rows={2}
                    placeholder="Explications de l'opération..."
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none resize-none"
                  />
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsTransactionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors"
                >
                  Valider l'Opération
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
