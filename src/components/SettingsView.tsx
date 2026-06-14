import React, { useState } from 'react';
import {
  Settings,
  Droplet,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Edit3,
  X
} from 'lucide-react';

export type FuelPriceConfig = Record<string, { buy: number; sell: number }>;

interface SettingsViewProps {
  fuelPrices: FuelPriceConfig;
  onSaveFuelPrices: (newPrices: FuelPriceConfig) => void;
}

const FUEL_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  'Super':        { bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-800',  icon: 'bg-amber-100 text-amber-700' },
  'Sans plomb':   { bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-800',icon: 'bg-emerald-100 text-emerald-700' },
  'Gasoil':       { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-800',   icon: 'bg-blue-100 text-blue-700' },
  'Pétrole':      { bg: 'bg-purple-50',  border: 'border-purple-200', text: 'text-purple-800', icon: 'bg-purple-100 text-purple-700' },
  'Gaz':          { bg: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-800', icon: 'bg-orange-100 text-orange-700' },
  'Lubrifiants':  { bg: 'bg-slate-50',   border: 'border-slate-200',  text: 'text-slate-800',  icon: 'bg-slate-100 text-slate-700' },
};

const UNIT_LABELS: Record<string, string> = {
  'Super': 'FCFA/L',
  'Sans plomb': 'FCFA/L',
  'Gasoil': 'FCFA/L',
  'Pétrole': 'FCFA/L',
  'Gaz': 'FCFA/bouteille',
  'Lubrifiants': 'FCFA/bidon',
};

export default function SettingsView({ fuelPrices, onSaveFuelPrices }: SettingsViewProps) {
  // Local draft state — user edits here before hitting "Enregistrer"
  const [draft, setDraft] = useState<FuelPriceConfig>(() =>
    JSON.parse(JSON.stringify(fuelPrices))
  );
  const [editingFuel, setEditingFuel] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleFieldChange = (fuel: string, field: 'buy' | 'sell', rawValue: string) => {
    const num = parseFloat(rawValue);
    setDraft(prev => ({
      ...prev,
      [fuel]: {
        ...prev[fuel],
        [field]: isNaN(num) ? 0 : num
      }
    }));
  };

  const handleSaveAll = async () => {
    // Basic validation: sell must be >= buy
    for (const [fuel, prices] of Object.entries(draft)) {
      if (prices.sell < prices.buy) {
        alert(`⚠️ Erreur : Le prix de vente du "${fuel}" ne peut pas être inférieur au prix d'achat !`);
        return;
      }
      if (prices.buy <= 0 || prices.sell <= 0) {
        alert(`⚠️ Erreur : Les prix pour "${fuel}" doivent être supérieurs à 0 !`);
        return;
      }
    }
    setSaveStatus('saving');
    try {
      await onSaveFuelPrices(draft);
      setSaveStatus('saved');
      setEditingFuel(null);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  };

  const handleReset = () => {
    if (window.confirm('Voulez-vous annuler toutes les modifications non sauvegardées ?')) {
      setDraft(JSON.parse(JSON.stringify(fuelPrices)));
      setEditingFuel(null);
      setSaveStatus('idle');
    }
  };

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(fuelPrices);

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="settings-view-root">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-600" />
            Paramètres de la Station
          </h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Configurez les prix d'achat et de vente des carburants. Les modifications sont synchronisées avec Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Annuler
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saveStatus === 'saving' || !hasChanges}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
              saveStatus === 'saved'
                ? 'bg-emerald-600 text-white'
                : saveStatus === 'error'
                ? 'bg-red-600 text-white'
                : hasChanges
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saveStatus === 'saving' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {saveStatus === 'saved' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {saveStatus === 'error' && <AlertTriangle className="w-3.5 h-3.5" />}
            {(saveStatus === 'idle' || saveStatus === 'saving') && saveStatus !== 'saving' && <Save className="w-3.5 h-3.5" />}
            {saveStatus === 'saving' ? 'Sauvegarde en cours...' :
             saveStatus === 'saved' ? 'Sauvegardé avec succès !' :
             saveStatus === 'error' ? 'Erreur de sauvegarde' :
             hasChanges ? 'Enregistrer les modifications' : 'Aucune modification'}
          </button>
        </div>
      </div>

      {/* ── STICKY FLOATING SAVE BAR (visible quand modifications en attente) ── */}
      {hasChanges && (
        <div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border border-amber-200 bg-amber-50/95 backdrop-blur-sm animate-in slide-in-from-bottom-4 fade-in duration-300"
          style={{ maxWidth: '90vw' }}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-xs font-semibold text-amber-900">
            Modifications non sauvegardées
          </span>
          <div className="flex items-center gap-2 ml-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 bg-white text-amber-800 hover:bg-amber-50 transition-colors"
            >
              <X className="w-3 h-3" />
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saveStatus === 'saving'}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
                saveStatus === 'saving'
                  ? 'bg-orange-400 text-white cursor-wait'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {saveStatus === 'saving' ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              {saveStatus === 'saving' ? 'Sauvegarde...' : 'Enregistrer maintenant'}
            </button>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5">Comment ces prix sont-ils utilisés ?</p>
          <p className="text-blue-800">
            Le <span className="font-semibold">prix de vente</span> est utilisé pour calculer le <span className="font-semibold">CA Estimé</span> dans la vue "Pompes & Index" et dans les rapports de clôture.
            Le <span className="font-semibold">prix d'achat</span> sert à estimer la <span className="font-semibold">marge brute</span> et le bénéfice net affiché dans le Tableau de Bord.
            Toute modification est immédiatement sauvegardée localement <span className="font-semibold">ET</span> synchronisée avec votre base de données Supabase.
          </p>
        </div>
      </div>

      {/* Status indicator if changes pending (supprimé - remplacé par la barre flottante sticky) */}

      {/* Fuel Prices Grid */}
      <div>
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <Droplet className="w-4 h-4 text-orange-500" />
          Prix Unitaires des Carburants & Produits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(draft).map(([fuel, prices]) => {
            const colors = FUEL_COLORS[fuel] || FUEL_COLORS['Super'];
            const unit = UNIT_LABELS[fuel] || 'FCFA/L';
            const margin = prices.sell - prices.buy;
            const marginPct = prices.buy > 0 ? ((margin / prices.buy) * 100) : 0;
            const isEditing = editingFuel === fuel;
            const savedBuy = fuelPrices[fuel]?.buy;
            const savedSell = fuelPrices[fuel]?.sell;
            const changed = prices.buy !== savedBuy || prices.sell !== savedSell;

            return (
              <div
                key={fuel}
                className={`rounded-xl border-2 p-5 transition-all ${
                  changed ? 'border-amber-400 shadow-md shadow-amber-100' : `${colors.border}`
                } ${colors.bg}`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${colors.icon}`}>
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${colors.text}`}>{fuel}</h4>
                      <p className="text-[10px] text-slate-500">{unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {changed && (
                      <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Modifié
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingFuel(isEditing ? null : fuel)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isEditing
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900'
                      } border border-white/50`}
                      title={isEditing ? 'Fermer' : 'Modifier les prix'}
                    >
                      {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Price Display or Edit Fields */}
                {isEditing ? (
                  <div className="space-y-3">
                    {/* Buy Price */}
                    <div>
                      <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        <TrendingDown className="w-3 h-3 text-rose-500" />
                        Prix d'Achat (Fournisseur)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                          value={prices.buy}
                          onChange={e => handleFieldChange(fuel, 'buy', e.target.value)}
                        />
                        <span className="text-[10px] text-slate-500 shrink-0">FCFA</span>
                      </div>
                    </div>
                    {/* Sell Price */}
                    <div>
                      <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        Prix de Vente (Client)
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                          value={prices.sell}
                          onChange={e => handleFieldChange(fuel, 'sell', e.target.value)}
                        />
                        <span className="text-[10px] text-slate-500 shrink-0">FCFA</span>
                      </div>
                    </div>
                    {/* Live margin preview */}
                    <div className={`rounded-lg p-2 text-center ${
                      margin >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
                    }`}>
                      <p className="text-[10px] text-slate-500 font-medium">Marge brute estimée</p>
                      <p className={`font-bold font-mono text-sm ${margin >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {margin >= 0 ? '+' : ''}{margin.toFixed(2)} FCFA
                        <span className="text-[10px] ml-1 font-normal">({marginPct.toFixed(1)}%)</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Buy Row */}
                    <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-xs text-slate-600 font-medium">Achat</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-slate-900">
                        {prices.buy.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
                      </span>
                    </div>
                    {/* Sell Row */}
                    <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs text-slate-600 font-medium">Vente</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-slate-900">
                        {prices.sell.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
                      </span>
                    </div>
                    {/* Margin Row */}
                    <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                      margin >= 0 ? 'bg-emerald-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className={`w-3.5 h-3.5 ${margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`} />
                        <span className="text-xs text-slate-600 font-medium">Marge</span>
                      </div>
                      <span className={`text-sm font-bold font-mono ${margin >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {margin >= 0 ? '+' : ''}{margin.toFixed(2)} <span className="text-xs font-normal">({marginPct.toFixed(1)}%)</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-slate-600" />
          <h3 className="font-bold text-slate-900 text-sm">Récapitulatif des Prix Configurés</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 text-slate-500 font-mono text-[9px] uppercase tracking-wider border-b border-slate-200">
                <th className="p-3">Produit</th>
                <th className="p-3 text-right">Prix Achat</th>
                <th className="p-3 text-right">Prix Vente</th>
                <th className="p-3 text-right">Marge Brute</th>
                <th className="p-3 text-right">Taux de Marge</th>
                <th className="p-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(draft).map(([fuel, prices]) => {
                const margin = prices.sell - prices.buy;
                const marginPct = prices.buy > 0 ? ((margin / prices.buy) * 100) : 0;
                const changed = prices.buy !== fuelPrices[fuel]?.buy || prices.sell !== fuelPrices[fuel]?.sell;

                return (
                  <tr key={fuel} className={`hover:bg-slate-50 transition-colors ${changed ? 'bg-amber-50/40' : ''}`}>
                    <td className="p-3 font-semibold text-slate-900">{fuel}</td>
                    <td className="p-3 text-right font-mono text-rose-700">{prices.buy.toLocaleString('fr-FR')} FCFA</td>
                    <td className="p-3 text-right font-mono text-slate-900 font-bold">{prices.sell.toLocaleString('fr-FR')} FCFA</td>
                    <td className={`p-3 text-right font-mono font-bold ${margin >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {margin >= 0 ? '+' : ''}{margin.toFixed(2)} FCFA
                    </td>
                    <td className={`p-3 text-right font-mono ${margin >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {marginPct.toFixed(1)}%
                    </td>
                    <td className="p-3 text-center">
                      {changed ? (
                        <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded uppercase">
                          En attente
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 justify-center w-fit mx-auto">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Actif
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
