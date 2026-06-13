import React, { useState } from 'react';
import { 
  JournalRecord, 
  JournalConfig, 
  Employee 
} from '../types';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Settings, 
  Printer, 
  Calendar, 
  Truck, 
  User, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Search, 
  Filter, 
  History, 
  ChevronRight,
  RefreshCw,
  Edit2,
  Check,
  X
} from 'lucide-react';

interface JournalViewProps {
  records: JournalRecord[];
  config: JournalConfig;
  employees: Employee[];
  onAddRecord: (record: JournalRecord) => void;
  onUpdateRecord: (record: JournalRecord) => void;
  onDeleteRecord: (id: string) => void;
  onUpdateConfig: (config: JournalConfig) => void;
}

export default function JournalView({
  records,
  config,
  employees,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onUpdateConfig
}: JournalViewProps) {
  // --- States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // Create / Edit Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [camionNo, setCamionNo] = useState('');
  const [chauffeur, setChauffeur] = useState('');
  const [col1Pos, setCol1Pos] = useState<number | ''>('');
  const [col1Neg, setCol1Neg] = useState<number | ''>('');
  const [col2Pos, setCol2Pos] = useState<number | ''>('');
  const [col2Neg, setCol2Neg] = useState<number | ''>('');
  const [col3Pos, setCol3Pos] = useState<number | ''>('');
  const [col3Neg, setCol3Neg] = useState<number | ''>('');
  const [col4Pos, setCol4Pos] = useState<number | ''>('');
  const [col4Neg, setCol4Neg] = useState<number | ''>('');
  const [destination, setDestination] = useState('');

  // Column titles edit states
  const [col1Title, setCol1Title] = useState(config.col1Title);
  const [col2Title, setCol2Title] = useState(config.col2Title);
  const [col3Title, setCol3Title] = useState(config.col3Title);
  const [col4Title, setCol4Title] = useState(config.col4Title);

  // Initialize form with defaults or selected record values
  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setCamionNo('');
    setChauffeur('');
    setCol1Pos('');
    setCol1Neg('');
    setCol2Pos('');
    setCol2Neg('');
    setCol3Pos('');
    setCol3Neg('');
    setCol4Pos('');
    setCol4Neg('');
    setDestination('');
    setEditingId(null);
  };

  const handleEditClick = (record: JournalRecord) => {
    setEditingId(record.id);
    setDate(record.date);
    setCamionNo(record.camionNo);
    setChauffeur(record.chauffeur);
    setCol1Pos(record.col1Pos || '');
    setCol1Neg(record.col1Neg || '');
    setCol2Pos(record.col2Pos || '');
    setCol2Neg(record.col2Neg || '');
    setCol3Pos(record.col3Pos || '');
    setCol3Neg(record.col3Neg || '');
    setCol4Pos(record.col4Pos || '');
    setCol4Neg(record.col4Neg || '');
    setDestination(record.destination);
    setIsFormOpen(true);
  };

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      col1Title: col1Title || config.col1Title,
      col2Title: col2Title || config.col2Title,
      col3Title: col3Title || config.col3Title,
      col4Title: col4Title || config.col4Title
    });
    setIsConfigOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!camionNo || !chauffeur) {
      alert("Veuillez renseigner le Camion N° et le Chauffeur.");
      return;
    }

    const newRecord: JournalRecord = {
      id: editingId || 'jr_' + Date.now(),
      date,
      camionNo: camionNo.toUpperCase(),
      chauffeur,
      col1Pos: Number(col1Pos) || 0,
      col1Neg: Number(col1Neg) || 0,
      col2Pos: Number(col2Pos) || 0,
      col2Neg: Number(col2Neg) || 0,
      col3Pos: Number(col3Pos) || 0,
      col3Neg: Number(col3Neg) || 0,
      col4Pos: Number(col4Pos) || 0,
      col4Neg: Number(col4Neg) || 0,
      destination
    };

    if (editingId) {
      onUpdateRecord(newRecord);
    } else {
      onAddRecord(newRecord);
    }

    setIsFormOpen(false);
    resetForm();
  };

  // --- Filtered Records ---
  const filteredRecords = records.filter(record => {
    const query = searchQuery.toLowerCase();
    const matchSearch = 
      record.camionNo.toLowerCase().includes(query) ||
      record.chauffeur.toLowerCase().includes(query) ||
      record.destination.toLowerCase().includes(query);

    const matchStart = filterStartDate ? record.date >= filterStartDate : true;
    const matchEnd = filterEndDate ? record.date <= filterEndDate : true;

    return matchSearch && matchStart && matchEnd;
  });

  // Sort filtered records by date descending, then camion
  const sortedRecords = [...filteredRecords].sort((a, b) => b.date.localeCompare(a.date));

  // --- Calculations as per requested grid ---
  // Calculates sums of all columns to render footer correctly (like the hand-drawn page)
  const sumCol1Pos = filteredRecords.reduce((acc, r) => acc + (r.col1Pos || 0), 0);
  const sumCol1Neg = filteredRecords.reduce((acc, r) => acc + (r.col1Neg || 0), 0);
  const sumCol2Pos = filteredRecords.reduce((acc, r) => acc + (r.col2Pos || 0), 0);
  const sumCol2Neg = filteredRecords.reduce((acc, r) => acc + (r.col2Neg || 0), 0);
  const sumCol3Pos = filteredRecords.reduce((acc, r) => acc + (r.col3Pos || 0), 0);
  const sumCol3Neg = filteredRecords.reduce((acc, r) => acc + (r.col3Neg || 0), 0);
  const sumCol4Pos = filteredRecords.reduce((acc, r) => acc + (r.col4Pos || 0), 0);
  const sumCol4Neg = filteredRecords.reduce((acc, r) => acc + (r.col4Neg || 0), 0);

  // NET values (Positive minus Negative)
  const netCol1 = sumCol1Pos - sumCol1Neg;
  const netCol2 = sumCol2Pos - sumCol2Neg;
  const netCol3 = sumCol3Pos - sumCol3Neg;
  const netCol4 = sumCol4Pos - sumCol4Neg;

  // Grand totals
  const totalPositives = sumCol1Pos + sumCol2Pos + sumCol3Pos + sumCol4Pos;
  const totalNegatives = sumCol1Neg + sumCol2Neg + sumCol3Neg + sumCol4Neg;
  const grandNetTotal = totalPositives - totalNegatives;

  // Print utility function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4" id="station-journal-main">
      
      {/* --- SCREEN-ONLY BANNER / HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            JOURNAL DE ROUTE & STATION
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-650 text-indigo-600" />
            Journal de Station
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Suivi multi-colonnes des camions, chauffeurs, ravitaillements et frais de route.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Configure titles button */}
          <button
            type="button"
            onClick={() => {
              setCol1Title(config.col1Title);
              setCol2Title(config.col2Title);
              setCol3Title(config.col3Title);
              setCol4Title(config.col4Title);
              setIsConfigOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            Personnaliser Colonnes
          </button>

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Imprimer Rapport
          </button>

          {/* Add Line button */}
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-orange-600/20"
          >
            <Plus className="w-4 h-4" />
            Ajouter une ligne
          </button>
        </div>
      </div>

      {/* --- STATS SUMMARY CARDS (SCREEN-ONLY) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Cumul Flux (+)</span>
            <p className="font-mono font-extrabold text-lg text-slate-800 mt-0.5">{totalPositives.toLocaleString()} FCFA</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Cumul Charges (-)</span>
            <p className="font-mono font-extrabold text-lg text-slate-800 mt-0.5">-{totalNegatives.toLocaleString()} FCFA</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Balance Net</span>
            <p className={`font-mono font-extrabold text-lg mt-0.5 ${grandNetTotal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {grandNetTotal.toLocaleString()} FCFA
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Fiches de Route</span>
            <p className="font-mono font-extrabold text-lg text-slate-800 mt-0.5">{sortedRecords.length} Camion(s)</p>
          </div>
        </div>
      </div>

      {/* --- FILTERS & SEARCH (SCREEN-ONLY) --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between print:hidden">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher Camion, Chauffeur, Trajet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-xs rounded-xl border border-slate-200/95 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/60 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Date Filter Range */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-100/60 px-2.5 py-1 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filtre Date :</span>
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 select-none bg-slate-50 outline-none"
            />
            <span className="text-slate-400 text-xs">à</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 select-none bg-slate-50 outline-none"
            />
            {(filterStartDate || filterEndDate || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setFilterStartDate('');
                  setFilterEndDate('');
                  setSearchQuery('');
                }}
                className="text-xs text-rose-650 text-rose-600 font-bold hover:underline ml-1 shrink-0"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- PRINT HEADER (HIDDEN ON SCREEN, SHOWS ON PRINT) --- */}
      <div className="hidden print:block space-y-4 text-black font-sans bg-white pb-3 border-b border-black">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide">STATION BARAKAT</h1>
            <p className="text-[10px] text-gray-600 tracking-tight">Cameroun - Gestion Transport & Chasse Camions</p>
            <p className="text-[10px] text-gray-600">Gérant : Jean-Marc Koffi</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-black tracking-tight uppercase">JOURNAL DE STATION</h2>
            <p className="text-[10px] text-gray-500">
              Imprimé le : {new Date().toLocaleDateString('fr-FR')} - {new Date().toLocaleTimeString('fr-FR')}
            </p>
            { (filterStartDate || filterEndDate) && (
              <p className="text-[10px] font-mono text-gray-700 font-bold">
                Période : {filterStartDate || 'Début'} au {filterEndDate || 'Fin'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- MAIN TABULAR JOURNAL GRID (MATCHING HANDWRITTEN LAYOUT) --- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-x-auto print:border-none print:shadow-none print:m-0" id="journal-table-wrapper">
        <table className="w-full text-left border-collapse font-sans table-fixed min-w-[1000px] print:text-black print:min-w-0 print:w-full">
          
          {/* Table headers */}
          <thead>
            {/* Primary category labels row */}
            <tr className="bg-slate-900 border-b border-slate-800 text-white select-none print:bg-gray-100 print:text-black print:border-b-2 print:border-black">
              <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[90px] print:p-1.5 print:text-[8px] print:w-[65px] border-r border-slate-800 print:border-gray-300">Date</th>
              <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[100px] print:p-1.5 print:text-[8px] print:w-[80px] border-r border-slate-800 print:border-gray-300">Camion N°</th>
              <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[140px] print:p-1.5 print:text-[8px] print:w-[100px] border-r border-slate-800 print:border-gray-300">Chauffeur Nom</th>
              
              {/* Column Group 1 */}
              <th colSpan={2} className="p-2 text-center text-[9px] font-extrabold uppercase tracking-wide border-r border-slate-800 print:border-gray-300 print:text-[7.5px] print:p-1 bg-slate-950/40 print:bg-transparent">
                <span className="block truncate max-w-full" title={config.col1Title}>{config.col1Title}</span>
              </th>

              {/* Column Group 2 */}
              <th colSpan={2} className="p-2 text-center text-[9px] font-extrabold uppercase tracking-wide border-r border-slate-800 print:border-gray-300 print:text-[7.5px] print:p-1 bg-slate-950/20 print:bg-transparent">
                <span className="block truncate max-w-full" title={config.col2Title}>{config.col2Title}</span>
              </th>

              {/* Column Group 3 */}
              <th colSpan={2} className="p-2 text-center text-[9px] font-extrabold uppercase tracking-wide border-r border-slate-800 print:border-gray-300 print:text-[7.5px] print:p-1 bg-slate-950/40 print:bg-transparent">
                <span className="block truncate max-w-full" title={config.col3Title}>{config.col3Title}</span>
              </th>

              {/* Column Group 4 */}
              <th colSpan={2} className="p-2 text-center text-[9px] font-extrabold uppercase tracking-wide border-r border-slate-800 print:border-gray-300 print:text-[7.5px] print:p-1 bg-slate-950/20 print:bg-transparent">
                <span className="block truncate max-w-full" title={config.col4Title}>{config.col4Title}</span>
              </th>

              <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[150px] print:p-1.5 print:text-[8px] print:w-[120px] border-r border-slate-850 print:border-r-0">Destination</th>
              <th className="p-3 text-center text-[10px] font-extrabold uppercase tracking-wider w-[80px] print:hidden">Actions</th>
            </tr>

            {/* Sub-headers row for positive/negative indications like the handwritten sheet (+ / -) */}
            <tr className="bg-slate-850 text-slate-350 border-b border-slate-800 font-semibold text-[10px] text-center print:bg-white print:text-black print:border-b print:border-black">
              {/* empty spacer columns for metadata */}
              <th colSpan={3} className="border-r border-slate-800 print:border-gray-300"></th>
              
              {/* Group 1 Sub-headers */}
              <th className="p-1 px-1.5 bg-emerald-950/10 text-emerald-400 font-mono font-bold w-[65px] border-r border-slate-800 print:border-gray-300 print:text-black print:bg-gray-50">+</th>
              <th className="p-1 px-1.5 bg-rose-950/10 text-rose-400 font-mono font-bold w-[65px] border-r border-slate-800 print:border-gray-300 print:text-black print:bg-gray-50">-</th>

              {/* Group 2 Sub-headers */}
              <th className="p-1 px-1.5 bg-emerald-950/10 text-emerald-400 font-mono font-bold w-[65px] border-r border-slate-800 print:border-gray-300 print:text-black print:bg-gray-50">+</th>
              <th className="p-1 px-1.5 bg-rose-950/10 text-rose-400 font-mono font-bold w-[65px] border-r border-slate-800 print:border-gray-300 print:text-black print:bg-gray-50">-</th>

              {/* Group 3 Sub-headers */}
              <th className="p-1 px-1.5 bg-emerald-950/10 text-emerald-400 font-mono font-bold w-[65px] border-r border-slate-800 print:border-gray-300 print:text-black print:bg-gray-50">+</th>
              <th className="p-1 px-1.5 bg-rose-950/10 text-rose-400 font-mono font-bold w-[65px] border-r border-slate-800 print:border-gray-300 print:text-black print:bg-gray-50">-</th>

              {/* Group 4 Sub-headers */}
              <th className="p-1 px-1.5 bg-emerald-950/10 text-emerald-400 font-mono font-bold w-[65px] border-r border-slate-800 print:border-gray-300 print:text-black print:bg-gray-50">+</th>
              <th className="p-1 px-1.5 bg-rose-950/10 text-rose-400 font-mono font-bold w-[65px] border-r border-slate-800 print:border-gray-300 print:text-black print:bg-gray-50">-</th>

              <th className="border-r border-slate-850 print:border-r-0"></th>
              <th className="print:hidden"></th>
            </tr>
          </thead>

          {/* Table body */}
          <tbody className="divide-y divide-slate-100 print:divide-y print:divide-gray-300 print:text-black">
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan={13} className="p-8 text-center text-slate-400 italic">
                  Aucun enregistrement trouvé dans le journal de station pour ces critères.
                </td>
              </tr>
            ) : (
              sortedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                  {/* Date */}
                  <td className="p-3 font-mono text-xs border-r border-slate-100 print:border-gray-300 print:p-1.5 print:text-[9px]">
                    {new Date(record.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </td>
                  
                  {/* Camion register */}
                  <td className="p-3 font-mono font-bold text-slate-800 border-r border-slate-100 print:border-gray-300 print:p-1.5 print:text-[9px]">
                    {record.camionNo}
                  </td>
                  
                  {/* Chauffeur info */}
                  <td className="p-3 text-slate-700 font-semibold truncate border-r border-slate-100 print:border-gray-300 print:p-1.5 print:text-[9px]">
                    {record.chauffeur}
                  </td>

                  {/* Col1 (+) & (-) */}
                  <td className="p-3 font-mono text-right text-slate-700 bg-emerald-50/10 border-r border-slate-100 print:border-gray-300 print:p-1.5 print:text-[8px] print:text-right">
                    {record.col1Pos > 0 ? record.col1Pos.toLocaleString() : ''}
                  </td>
                  <td className="p-3 font-mono text-right text-rose-650/80 bg-rose-50/10 border-r border-slate-100 print:border-gray-300 print:p-1.5 print:text-[8px] print:text-right font-medium">
                    {record.col1Neg > 0 ? `-${record.col1Neg.toLocaleString()}` : ''}
                  </td>

                  {/* Col2 (+) & (-) */}
                  <td className="p-3 font-mono text-right text-slate-700 bg-emerald-50/10 border-r border-slate-100 print:border-gray-300 print:p-1.5 print:text-[8px] print:text-right">
                    {record.col2Pos > 0 ? record.col2Pos.toLocaleString() : ''}
                  </td>
                  <td className="p-3 font-mono text-right text-rose-650/80 bg-rose-50/10 border-r border-slate-100 print:border-gray-300 print:p-1.5 print:text-[8px] print:text-right font-medium">
                    {record.col2Neg > 0 ? `-${record.col2Neg.toLocaleString()}` : ''}
                  </td>

                  {/* Col3 (+) & (-) */}
                  <td className="p-3 font-mono text-right text-slate-700 bg-emerald-50/10 border-r border-slate-100 print:border-gray-300 print:p-1.5 print:text-[8px] print:text-right">
                    {record.col3Pos > 0 ? record.col3Pos.toLocaleString() : ''}
                  </td>
                  <td className="p-3 font-mono text-right text-rose-650/80 bg-rose-50/10 border-r border-slate-100 print:border-gray-300 print:p-1.5 print:text-[8px] print:text-right font-medium">
                    {record.col3Neg > 0 ? `-${record.col3Neg.toLocaleString()}` : ''}
                  </td>

                  {/* Col4 (+) & (-) */}
                  <td className="p-3 font-mono text-right text-slate-700 bg-emerald-50/10 border-r border-slate-100 print:border-gray-300 print:p-1.5 print:text-[8px] print:text-right">
                    {record.col4Pos > 0 ? record.col4Pos.toLocaleString() : ''}
                  </td>
                  <td className="p-3 font-mono text-right text-rose-650/80 bg-rose-50/10 border-r border-slate-100 print:border-gray-300 print:p-1.5 print:text-[8px] print:text-right font-medium">
                    {record.col4Neg > 0 ? `-${record.col4Neg.toLocaleString()}` : ''}
                  </td>

                  {/* Route Destination */}
                  <td className="p-3 text-slate-600 text-xs italic truncate border-r border-slate-100 print:border-none print:p-1.5 print:text-[8px]">
                    {record.destination || <span className="text-slate-350">-</span>}
                  </td>

                  {/* Live Actions on records */}
                  <td className="p-3 text-center print:hidden">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditClick(record)}
                        className="p-1 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Supprimer cette ligne du camion ${record.camionNo} ?`)) {
                            onDeleteRecord(record.id);
                          }
                        }}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Calculations footer corresponding directly to the handwritten document:
              - Somme (+) Row
              - Somme (-) Row
              - Solde Total
          */}
          <tfoot className="border-t-2 border-slate-900 bg-slate-50 font-semibold text-xs print:border-t-2 print:border-black print:text-black">
            
            {/* 1. Somme (+) row */}
            <tr className="border-b border-indigo-100/60 print:border-b print:border-gray-300">
              <td colSpan={3} className="text-right p-2.5 font-bold uppercase tracking-wider text-slate-500 border-r border-slate-100 print:border-gray-300 print:p-1 print:text-[8.5px]">
                Somme (+)
              </td>
              <td className="p-2.5 font-mono text-right text-slate-800 bg-emerald-50/30 border-r border-slate-100 print:border-gray-300 print:p-1 print:text-[8.5px]">
                {sumCol1Pos > 0 ? sumCol1Pos.toLocaleString() : '-'}
              </td>
              <td className="border-r border-slate-100 print:border-gray-300 bg-slate-100/40"></td>

              <td className="p-2.5 font-mono text-right text-slate-800 bg-emerald-50/30 border-r border-slate-100 print:border-gray-300 print:p-1 print:text-[8.5px]">
                {sumCol2Pos > 0 ? sumCol2Pos.toLocaleString() : '-'}
              </td>
              <td className="border-r border-slate-100 print:border-gray-300 bg-slate-100/40"></td>

              <td className="p-2.5 font-mono text-right text-slate-800 bg-emerald-50/30 border-r border-slate-100 print:border-gray-300 print:p-1 print:text-[8.5px]">
                {sumCol3Pos > 0 ? sumCol3Pos.toLocaleString() : '-'}
              </td>
              <td className="border-r border-slate-100 print:border-gray-300 bg-slate-100/40"></td>

              <td className="p-2.5 font-mono text-right text-slate-800 bg-emerald-50/30 border-r border-slate-100 print:border-gray-300 print:p-1 print:text-[8.5px]">
                {sumCol4Pos > 0 ? sumCol4Pos.toLocaleString() : '-'}
              </td>
              <td className="border-r border-slate-100 print:border-gray-300 bg-slate-100/40"></td>

              <td colSpan={1} className="border-r border-slate-100 print:border-0"></td>
              <th className="print:hidden"></th>
            </tr>

            {/* 2. Somme (-) row */}
            <tr className="border-b border-indigo-100/60 print:border-b print:border-gray-300">
              <td colSpan={3} className="text-right p-2.5 font-bold uppercase tracking-wider text-slate-500 border-r border-slate-100 print:border-gray-300 print:p-1 print:text-[8.5px]">
                Somme (-)
              </td>
              <td className="border-r border-slate-100 print:border-gray-300 bg-slate-100/40"></td>
              <td className="p-2.5 font-mono text-right text-rose-650/90 bg-rose-50/30 border-r border-slate-100 print:border-gray-300 print:p-1 print:text-[8.5px] font-medium">
                {sumCol1Neg > 0 ? `-${sumCol1Neg.toLocaleString()}` : '-'}
              </td>

              <td className="border-r border-slate-100 print:border-gray-300 bg-slate-100/40"></td>
              <td className="p-2.5 font-mono text-right text-rose-650/90 bg-rose-50/30 border-r border-slate-100 print:border-gray-300 print:p-1 print:text-[8.5px] font-medium">
                {sumCol2Neg > 0 ? `-${sumCol2Neg.toLocaleString()}` : '-'}
              </td>

              <td className="border-r border-slate-100 print:border-gray-300 bg-slate-100/40"></td>
              <td className="p-2.5 font-mono text-right text-rose-650/90 bg-rose-50/30 border-r border-slate-100 print:border-gray-300 print:p-1 print:text-[8.5px] font-medium">
                {sumCol3Neg > 0 ? `-${sumCol3Neg.toLocaleString()}` : '-'}
              </td>

              <td className="border-r border-slate-100 print:border-gray-300 bg-slate-100/40"></td>
              <td className="p-2.5 font-mono text-right text-rose-650/90 bg-rose-50/30 border-r border-slate-100 print:border-gray-300 print:p-1 print:text-[8.5px] font-medium">
                {sumCol4Neg > 0 ? `-${sumCol4Neg.toLocaleString()}` : '-'}
              </td>

              <td colSpan={1} className="border-r border-slate-100 print:border-0"></td>
              <th className="print:hidden"></th>
            </tr>

            {/* 3. = Solde Total row */}
            <tr className="bg-slate-900 border-b border-slate-950 text-white print:bg-gray-150 print:text-black">
              <td colSpan={3} className="text-right p-3 font-bold uppercase tracking-wider border-r border-slate-850 print:border-gray-350 print:p-1.5 print:text-[9px]">
                = TOTAL (Solde)
              </td>
              
              {/* Col 1 Total Net */}
              <td colSpan={2} className={`p-3 font-mono font-black text-right border-r border-slate-850 print:border-gray-350 print:p-1.5 print:text-[9.5px] ${
                netCol1 >= 0 ? 'text-emerald-400 print:text-emerald-800' : 'text-rose-400 print:text-rose-800'
              }`}>
                {netCol1.toLocaleString()} FCFA
              </td>

              {/* Col 2 Total Net */}
              <td colSpan={2} className={`p-3 font-mono font-black text-right border-r border-slate-850 print:border-gray-350 print:p-1.5 print:text-[9.5px] ${
                netCol2 >= 0 ? 'text-emerald-400 print:text-emerald-800' : 'text-rose-400 print:text-rose-800'
              }`}>
                {netCol2.toLocaleString()} FCFA
              </td>

              {/* Col 3 Total Net */}
              <td colSpan={2} className={`p-3 font-mono font-black text-right border-r border-slate-850 print:border-gray-350 print:p-1.5 print:text-[9.5px] ${
                netCol3 >= 0 ? 'text-emerald-400 print:text-emerald-800' : 'text-rose-400 print:text-rose-800'
              }`}>
                {netCol3.toLocaleString()} FCFA
              </td>

              {/* Col 4 Total Net */}
              <td colSpan={2} className={`p-3 font-mono font-black text-right border-r border-slate-850 print:border-gray-350 print:p-1.5 print:text-[9.5px] ${
                netCol4 >= 0 ? 'text-emerald-400 print:text-emerald-800' : 'text-rose-400 print:text-rose-800'
              }`}>
                {netCol4.toLocaleString()} FCFA
              </td>

              <td colSpan={1} className="border-r border-slate-850 print:border-0"></td>
              <th className="print:hidden"></th>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* --- PRINT SIGNATURE BLOCK (HIDDEN ON SCREEN, SHOWS ON PRINT) --- */}
      <div className="hidden print:grid grid-cols-2 gap-8 text-black font-sans text-xs pt-12 mt-4 bg-white" id="print-signature-section">
        <div className="border border-gray-400 p-4 rounded-xl h-28 flex flex-col justify-between">
          <span className="font-bold uppercase tracking-wider text-[10px]">Visa / Signature du Chauffeur</span>
          <span className="text-[10px] text-gray-400 font-mono italic">Signature manuscrite requise</span>
        </div>
        <div className="border border-gray-400 p-4 rounded-xl h-28 flex flex-col justify-between text-right">
          <span className="font-bold uppercase tracking-wider text-[10px] text-right block">Cachet & Signature Administrateur</span>
          <span className="text-[10px] text-gray-400 font-mono italic">Station Barakat - Jean-Marc Koffi</span>
        </div>
      </div>

      {/* --- ADD / EDIT LINE FORM MODAL (SCREEN-ONLY) --- */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden animate-fade-in" id="journal-form-modal">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-sm tracking-tight text-white">
                  {editingId ? "Modifier l'enregistrement journal" : "Nouvel enregistrement Journal de Station"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form layout */}
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden max-h-full">
              <div className="p-6 overflow-y-auto space-y-4 text-slate-600 text-xs flex-1">
                
                {/* Metadatas grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Date d'opération</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white focus:bg-white outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-505"
                      />
                    </div>
                  </div>

                  {/* Camion N° */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Camion N°</label>
                    <div className="relative">
                      <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: LT 1234 A"
                        value={camionNo}
                        onChange={(e) => setCamionNo(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-505 uppercase outline-none"
                      />
                    </div>
                  </div>

                  {/* Chauffeur Nom (with autocompletion dropdown option or input) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Nom du Chauffeur</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Ousmane Sow"
                        value={chauffeur}
                        onChange={(e) => setChauffeur(e.target.value)}
                        list="employees-list"
                        className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-505 outline-none"
                      />
                      <datalist id="employees-list">
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.name}>{emp.role}</option>
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* Sub-values + / - Grid sections */}
                <span className="block border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Saisie des Flux de Caisses (+) et Charges (-)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Column 1 inputs */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-205/80 border-slate-200 space-y-2">
                    <span className="block font-bold text-slate-700 uppercase tracking-wide text-[10px]">{config.col1Title}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-emerald-600 font-extrabold uppercase">Flux (+)</label>
                        <input
                          type="number"
                          placeholder="Montant FCFA"
                          value={col1Pos}
                          onChange={(e) => setCol1Pos(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-rose-600 font-extrabold uppercase">Charge (-)</label>
                        <input
                          type="number"
                          placeholder="Montant FCFA"
                          value={col1Neg}
                          onChange={(e) => setCol1Neg(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 2 inputs */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-205/80 border-slate-200 space-y-2">
                    <span className="block font-bold text-slate-700 uppercase tracking-wide text-[10px]">{config.col2Title}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-emerald-600 font-extrabold uppercase">Flux (+)</label>
                        <input
                          type="number"
                          placeholder="Montant FCFA"
                          value={col2Pos}
                          onChange={(e) => setCol2Pos(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-rose-600 font-extrabold uppercase">Charge (-)</label>
                        <input
                          type="number"
                          placeholder="Montant FCFA"
                          value={col2Neg}
                          onChange={(e) => setCol2Neg(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 3 inputs */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-205/80 border-slate-200 space-y-2">
                    <span className="block font-bold text-slate-700 uppercase tracking-wide text-[10px]">{config.col3Title}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-emerald-600 font-extrabold uppercase">Flux (+)</label>
                        <input
                          type="number"
                          placeholder="Montant FCFA"
                          value={col3Pos}
                          onChange={(e) => setCol3Pos(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-rose-600 font-extrabold uppercase">Charge (-)</label>
                        <input
                          type="number"
                          placeholder="Montant FCFA"
                          value={col3Neg}
                          onChange={(e) => setCol3Neg(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 4 inputs */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-205/80 border-slate-200 space-y-2">
                    <span className="block font-bold text-slate-700 uppercase tracking-wide text-[10px]">{config.col4Title}</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-emerald-600 font-extrabold uppercase">Flux (+)</label>
                        <input
                          type="number"
                          placeholder="Montant FCFA"
                          value={col4Pos}
                          onChange={(e) => setCol4Pos(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-rose-600 font-extrabold uppercase">Charge (-)</label>
                        <input
                          type="number"
                          placeholder="Montant FCFA"
                          value={col4Neg}
                          onChange={(e) => setCol4Neg(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1 text-xs border border-slate-200 bg-white rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destination / Road Details */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Destination / Trajet de Route</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Ex: Douala - Yaoundé - Garoua"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-505 outline-none"
                    />
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white cursor-pointer transition-colors"
                >
                  {editingId ? "Enregistrer" : "Créer l'enregistrement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- COLUMN TITLES CONFIGURATION MODAL (SCREEN-ONLY) --- */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:hidden animate-fade-in" id="journal-config-modal">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-orange-500" />
                <h2 className="font-bold text-sm tracking-tight text-white">Personnalisation des Têtes de Colonne</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Config inputs form */}
            <form onSubmit={handleConfigSubmit}>
              <div className="p-5 space-y-4 text-xs">
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Modifier les noms de catégories ci-dessous pour renommer les 4 paires de colonnes (+ / -) du Journal selon votre fonctionnement logistique.
                </p>

                <div className="space-y-3">
                  {/* Col 1 */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Colonne 1 (Par défaut : Entretien)</label>
                    <input
                      type="text"
                      value={col1Title}
                      onChange={(e) => setCol1Title(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-505"
                      required
                      placeholder="Ex : Entretien & Dépenses"
                    />
                  </div>

                  {/* Col 2 */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Colonne 2 (Par défaut : Dépôt)</label>
                    <input
                      type="text"
                      value={col2Title}
                      onChange={(e) => setCol2Title(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-505"
                      required
                      placeholder="Ex : Dépôt & Avance"
                    />
                  </div>

                  {/* Col 3 */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Colonne 3 (Par défaut : Gazole)</label>
                    <input
                      type="text"
                      value={col3Title}
                      onChange={(e) => setCol3Title(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-505"
                      required
                      placeholder="Ex : Gazole / Carburant"
                    />
                  </div>

                  {/* Col 4 */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Colonne 4 (Par défaut : Péages)</label>
                    <input
                      type="text"
                      value={col4Title}
                      onChange={(e) => setCol4Title(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-505"
                      required
                      placeholder="Ex : Autres / Péages"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-950 text-white cursor-pointer"
                >
                  Appliquer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
