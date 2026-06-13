import React, { useState } from 'react';
import { MaintenanceIncident } from '../types';
import { 
  Wrench, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle, 
  AlertOctagon, 
  Clock, 
  ShieldAlert, 
  Calendar,
  DollarSign,
  Briefcase,
  Search,
  Filter,
  X,
  Hammer
} from 'lucide-react';

interface MaintenanceViewProps {
  incidents: MaintenanceIncident[];
  onAddIncident: (incident: MaintenanceIncident) => void;
  onUpdateIncident: (incident: MaintenanceIncident) => void;
  onDeleteIncident: (id: string) => void;
}

export default function MaintenanceView({
  incidents,
  onAddIncident,
  onUpdateIncident,
  onDeleteIncident
}: MaintenanceViewProps) {
  
  // Selection/filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Saisie Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New incident fields
  const [deviceName, setDeviceName] = useState('');
  const [category, setCategory] = useState<'Pompes & Pistolets' | 'Électricité & Groupe' | 'Sécurité & Incendie' | 'Bâtiment & Réseau' | 'Informatique & Caméras'>('Pompes & Pistolets');
  const [reportedDate, setReportedDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Basse' | 'Moyenne' | 'Élevée' | 'Critique'>('Moyenne');
  const [technicianName, setTechnicianName] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Calculated Stats
  const activeIncidents = incidents.filter(idx => idx.status !== 'Résolu');
  const criticalCount = activeIncidents.filter(idx => idx.priority === 'Critique' || idx.priority === 'Élevée').length;
  const totalMaintenanceScrapCost = incidents.reduce((acc, current) => acc + current.cost, 0);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName || !description) {
      alert("Veuillez remplir le nom de l'équipement et la description de l'incident.");
      return;
    }

    const newInc: MaintenanceIncident = {
      id: 'm_' + Date.now(),
      deviceName,
      category,
      reportedDate,
      description,
      status: 'Signalé',
      priority,
      technicianName: technicianName || undefined,
      cost: Number(cost) || 0,
      notes: notes || undefined
    };

    onAddIncident(newInc);
    setIsModalOpen(false);

    // Reset
    setDeviceName('');
    setCategory('Pompes & Pistolets');
    setDescription('');
    setPriority('Moyenne');
    setTechnicianName('');
    setCost('');
    setNotes('');
  };

  // Mark resolved helper
  const handleMarkResolved = (incident: MaintenanceIncident) => {
    const costInput = window.prompt(
      `Confirmez-vous la résolution de l'incident pour : "${incident.deviceName}" ?\n\nSaisissez le coût de l'intervention finale en FCFA (laisser vide/0 si gratuit) :`, 
      incident.cost.toString()
    );

    if (costInput === null) return; // cancel

    const updated: MaintenanceIncident = {
      ...incident,
      status: 'Résolu',
      resolvedDate: new Date().toISOString().split('T')[0],
      cost: Number(costInput) || 0
    };

    onUpdateIncident(updated);
  };

  // Toggle internal priority or status directly
  const handleChangeStatus = (incident: MaintenanceIncident, newStatus: any) => {
    const updated: MaintenanceIncident = {
      ...incident,
      status: newStatus,
      resolvedDate: newStatus === 'Résolu' ? new Date().toISOString().split('T')[0] : undefined
    };
    onUpdateIncident(updated);
  };

  const filteredIncidents = incidents.filter(inc => {
    const matchesCat = selectedCategory === 'all' ? true : inc.category === selectedCategory;
    const matchesStat = selectedStatus === 'all' ? true : inc.status === selectedStatus;
    const matchesQuery = searchQuery === '' ? true : (
      inc.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.technicianName && inc.technicianName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return matchesCat && matchesStat && matchesQuery;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4" id="maintenance-panel-view">
      
      {/* 1. HEADER (ÉCRAN SEULEMENT) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            SÉCURITÉ & CONTINUITÉ DE SERVICE
          </span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-500" />
            Maintenance & Équipements
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Suivi des pannes techniques, maintien des volucompteurs de pompes, entretien des installations et contrôles périodiques de sécurité.
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
            Imprimer Fiche Maintenance
          </button>

          {/* Solder / Régler Acompte button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            Signaler un Incident
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
            <h2 className="text-lg font-black tracking-tight uppercase text-amber-950">REGISTRE DE MAINTENANCE & SÉCURITÉ DE STATION</h2>
            <p className="text-[10px] text-gray-500">
              Imprimé le : {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
            </p>
          </div>
        </div>
        
        {/* Rappel des données globales à l'impression */}
        <div className="grid grid-cols-3 border border-gray-300 rounded-lg p-2.5 bg-gray-50 text-xs font-mono">
          <div>
            <span className="text-gray-500 uppercase text-[9px] block font-bold">Total Pannes Actives</span>
            <span className="font-bold text-sm text-amber-900">{activeIncidents.length} Équipements</span>
          </div>
          <div>
            <span className="text-gray-500 uppercase text-[9px] block font-bold">Urgences Critiques</span>
            <span className="font-bold text-sm text-red-600">{criticalCount} Signalements</span>
          </div>
          <div>
            <span className="text-gray-500 uppercase text-[9px] block font-bold">Budget Frais de Maintenance</span>
            <span className="font-bold text-sm text-gray-800">{totalMaintenanceScrapCost.toLocaleString()} FCFA</span>
          </div>
        </div>
      </div>

      {/* 2. STATS SUMS (ÉCRAN SEULEMENT) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        {/* Total pannes actives */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 animate-pulse">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Pannes en cours</span>
              <p className="font-mono font-black text-lg text-amber-600 mt-0.5">{activeIncidents.length} Signalées</p>
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-400">
            En attente de résolution
          </div>
        </div>

        {/* Urgences critiques */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Urgence Critique / Élevée</span>
              <p className="font-mono font-black text-lg text-rose-600 mt-0.5">{criticalCount} Éléments</p>
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-red-600 font-bold">
            Priorité Maximale !
          </div>
        </div>

        {/* Coût total réparations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Dépenses Exploitation/Filtre</span>
              <p className="font-mono font-black text-lg text-slate-800 mt-0.5">{totalMaintenanceScrapCost.toLocaleString()} F</p>
            </div>
          </div>
          <div className="text-right font-mono text-[10px] text-slate-400">
            Investissement sécurité
          </div>
        </div>
      </div>

      {/* 3. FILTERS (ÉCRAN SEULEMENT) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Category */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-650 font-bold outline-none cursor-pointer"
            >
              <option value="all">Toutes Catégories</option>
              <option value="Pompes & Pistolets">Pompes & Pistolets</option>
              <option value="Électricité & Groupe">Électricité & Groupe</option>
              <option value="Sécurité & Incendie">Sécurité & Incendie</option>
              <option value="Bâtiment & Réseau">Bâtiment & Réseau</option>
              <option value="Informatique & Caméras">Informatique & Caméras</option>
            </select>
          </div>

          {/* Filter by Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-650 font-bold outline-none cursor-pointer"
          >
            <option value="all">Tous les Statuts</option>
            <option value="Signalé">Signalé</option>
            <option value="En cours de réparation">En cours de réparation</option>
            <option value="Résolu">Résolu</option>
            <option value="Planifié/Maintenance">Planifié/Maintenance</option>
          </select>
        </div>

        {/* Text Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher équipement, panne, technicien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 text-xs rounded-xl border border-slate-200 outline-none w-64 focus:border-amber-500 bg-white"
          />
        </div>
      </div>

      {/* 4. MAIN LIST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/95 overflow-hidden shadow-xs print:border-none print:shadow-none" id="maintenance-list-container">
        <table className="w-full text-left border-collapse table-fixed min-w-[700px] print:text-black print:min-w-0 print:w-full">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-850 text-white select-none print:bg-gray-100 print:text-black print:border-b-2 print:border-black">
              <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[120px] print:p-1.5 print:text-[8px] print:w-[80px]">Signalement</th>
              <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[180px] print:p-1.5 print:text-[8px] print:w-[130px]">Équipement Concerne</th>
              <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[120px] print:p-1.5 print:text-[8px] print:w-[90px]">Catégorie</th>
              <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider w-[240px] print:p-1.5 print:text-[8px] print:w-[150px]">Description de l'incident</th>
              <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider text-center w-[90px] print:p-1.5 print:text-[8px]">Urgence</th>
              <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider text-center w-[120px] print:p-1.5 print:text-[8px] print:w-[90px]">Statut</th>
              <th className="p-3 text-[10px] font-extrabold uppercase tracking-wider text-right w-[110px] print:p-1.5 print:text-[8px]">Frais Factures</th>
              <th className="p-3 text-center text-[10px] font-extrabold uppercase tracking-wider w-[120px] print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 print:divide-y print:divide-gray-300">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                  Aucun incident n'est répertorié dans cette sélection.
                </td>
              </tr>
            ) : (
              filteredIncidents.map(inc => {
                const isUrgent = inc.priority === 'Critique' || inc.priority === 'Élevée';
                const isResolved = inc.status === 'Résolu';

                return (
                  <tr key={inc.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Reported date */}
                    <td className="p-3 text-xs text-slate-650 print:p-1.5 print:text-[8px]">
                      <div className="font-mono">{inc.reportedDate}</div>
                      {inc.resolvedDate && (
                        <div className="text-[9px] text-emerald-600 mt-0.5 font-bold font-mono">Res : {inc.resolvedDate}</div>
                      )}
                    </td>

                    {/* Equipment Name */}
                    <td className="p-3 font-bold text-slate-800 truncate print:p-1.5 print:text-[9.5px]">
                      {inc.deviceName}
                    </td>

                    {/* Category */}
                    <td className="p-3 text-slate-600 text-xs print:p-1.5 print:text-[8.5px]">
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200/55 block text-center truncate">
                        {inc.category}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="p-3 text-slate-600 text-xs print:p-1.5 print:text-[8.5px]">
                      <div className="line-clamp-2" title={inc.description}>
                        {inc.description}
                      </div>
                      {inc.technicianName && (
                        <div className="text-[9.5px] text-slate-400 font-medium italic mt-0.5 flex items-center gap-1">
                          <Briefcase className="w-2.5 h-2.5" /> Intervenant : {inc.technicianName}
                        </div>
                      )}
                    </td>

                    {/* Priority Level */}
                    <td className="p-3 text-center print:p-1.5">
                      <div className="flex items-center justify-center">
                        {inc.priority === 'Critique' ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-850 font-black text-[9px] tracking-wide rounded-md">🔴 CRITIQUE</span>
                        ) : inc.priority === 'Élevée' ? (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-850 font-bold text-[9px] tracking-wide rounded-md">🟠 Haute</span>
                        ) : inc.priority === 'Moyenne' ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold text-[9px] rounded-md">Moyenne</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-650 text-[9px] rounded-md">Basse</span>
                        )}
                      </div>
                    </td>

                    {/* Real-time Status */}
                    <td className="p-3 text-center print:p-1.5">
                      <div className="flex items-center justify-center">
                        {isResolved ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-850 font-extrabold text-[9px] rounded-full flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" /> Résolu
                          </span>
                        ) : inc.status === 'En cours de réparation' ? (
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-850 font-semibold text-[9px] rounded-full flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 animate-spin" /> En cours
                          </span>
                        ) : inc.status === 'Planifié/Maintenance' ? (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-850 font-semibold text-[9px] rounded-full">
                            🕒 Planifié
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold text-[9px] rounded-full">
                            Signalé
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Incurred cost in FCFA */}
                    <td className="p-3 text-right font-mono text-slate-800 font-semibold text-xs print:p-1.5 print:text-[8.5px]">
                      {inc.cost > 0 ? (
                        <span className="font-bold text-slate-900">{inc.cost.toLocaleString()} F</span>
                      ) : (
                        <span className="text-slate-400 font-mono italic text-[11px]">Gratuit</span>
                      )}
                    </td>

                    {/* Direct action buttons */}
                    <td className="p-3 text-center print:hidden">
                      <div className="flex items-center justify-center gap-1.5">
                        {!isResolved && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleMarkResolved(inc)}
                              className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold cursor-pointer transition-colors"
                              title="Marquer comme Réparé/Résolu"
                            >
                              Solder
                            </button>
                            {inc.status === 'Signalé' && (
                              <button
                                type="button"
                                onClick={() => handleChangeStatus(inc, 'En cours de réparation')}
                                className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded text-[10px] font-bold cursor-pointer transition-colors"
                              >
                                Lancer
                              </button>
                            )}
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Supprimer l'historique de cet incident ?")) {
                              onDeleteIncident(inc.id);
                            }
                          }}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                          title="Supprimer la fiche d'incident"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL : SAISIE DE NOUVEL INCIDENT MAINT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:hidden" id="maintenance-modal-overlay">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <h2 className="font-bold text-xs tracking-tight text-white uppercase">Signaler une Panne ou Intervention</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-slate-650 text-xs text-left">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Équipement Concerne *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pompe N°1 Pistolet Super"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none focus:border-amber-500 focus:bg-white bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Catégorie d'équipement</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Pompes & Pistolets">Pompes & Pistolets</option>
                    <option value="Électricité & Groupe">Électricité & Groupe</option>
                    <option value="Sécurité & Incendie">Sécurité & Incendie</option>
                    <option value="Bâtiment & Réseau">Bâtiment & Réseau</option>
                    <option value="Informatique & Caméras">Informatique & Caméras</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Degré d'Urgence / Priorité</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="Basse">Basse (Simple Vérification)</option>
                    <option value="Moyenne">Moyenne (Perturbe peu)</option>
                    <option value="Élevée">Élevée (À réparer rapidement)</option>
                    <option value="Critique">Critique (Gèle l'activité de vente)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Description détaillée des symptômes *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Décrire précisément de quoi il s'agit (ex: Fuite d'huile au carter, affichage compteur éteint...)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none resize-none bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Date de Constat</label>
                  <input
                    type="date"
                    required
                    value={reportedDate}
                    onChange={(e) => setReportedDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Budget / Coût Estimé (FCFA)</label>
                  <input
                    type="number"
                    placeholder="Ex: 50000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Technicien ou Prestataire contacté</label>
                <input
                  type="text"
                  placeholder="Ex: Lucien Hydraulique Cameroun"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Notes privées complémentaires</label>
                <input
                  type="text"
                  placeholder="Réf pièce rechange, garantie..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-705 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                >
                  Ajouter au Fichier
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
