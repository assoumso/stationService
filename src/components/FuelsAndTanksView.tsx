import React, { useState } from 'react';
import { FuelStock, Tank, Delivery, FuelType } from '../types';
import { 
  Droplet, 
  PlusCircle, 
  Layers, 
  TrendingDown, 
  Check, 
  FileText, 
  Plus, 
  Upload, 
  AlertOctagon, 
  Flame, 
  ChevronRight,
  Info,
  Trash2,
  Edit,
  X
} from 'lucide-react';

interface FuelsAndTanksViewProps {
  fuels: FuelStock[];
  tanks: Tank[];
  deliveries: Delivery[];
  onUpdateFuelRealStock: (id: string, realStock: number) => void;
  onUpdateFuelInitialStock: (id: string, initialStock: number) => void;
  onUpdateTankRealStock: (id: string, realStock: number) => void;
  onUpdateTankProperties: (id: string, name: string, capacity: number, fuelType: FuelType, initialStock: number) => void;
  onAddTank: (tank: Omit<Tank, 'id' | 'theoreticalStock' | 'lossDetected' | 'realDipstickStock' | 'deliveries' | 'sales'>) => void;
  onDeleteTank: (id: string) => void;
  onAddDelivery: (delivery: Omit<Delivery, 'id' | 'totalAmount'>) => void;
  onDeleteDelivery: (id: string) => void;
  fuelPrices: Record<string, { buy: number; sell: number }>;
}

export default function FuelsAndTanksView({
  fuels,
  tanks,
  deliveries,
  onUpdateFuelRealStock,
  onUpdateFuelInitialStock,
  onUpdateTankRealStock,
  onUpdateTankProperties,
  onAddTank,
  onDeleteTank,
  onAddDelivery,
  onDeleteDelivery,
  fuelPrices
}: FuelsAndTanksViewProps) {
  // Local state for stock adjustment modal or inline edits
  const [editingFuelId, setEditingFuelId] = useState<string | null>(null);
  const [tempRealStock, setTempRealStock] = useState<number>(0);

  const [editingTankId, setEditingTankId] = useState<string | null>(null);
  const [tempTankRealStock, setTempTankRealStock] = useState<number>(0);

  const [editingFuelInitialId, setEditingFuelInitialId] = useState<string | null>(null);
  const [tempInitialStock, setTempInitialStock] = useState<number>(0);

  // Tank management states
  const [isAddTankOpen, setIsAddTankOpen] = useState(false);
  const [newTankName, setNewTankName] = useState('');
  const [newTankFuelType, setNewTankFuelType] = useState<FuelType>('Super');
  const [newTankCapacity, setNewTankCapacity] = useState('');
  const [newTankInitialStock, setNewTankInitialStock] = useState('');

  const [editingTankPropId, setEditingTankPropId] = useState<string | null>(null);
  const [editTankName, setEditTankName] = useState('');
  const [editTankFuelType, setEditTankFuelType] = useState<FuelType>('Super');
  const [editTankCapacity, setEditTankCapacity] = useState('');
  const [editTankInitialStock, setEditTankInitialStock] = useState('');

  // New delivery form state
  const [supplier, setSupplier] = useState('');
  const [product, setProduct] = useState<FuelType>('Super');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [invoice, setInvoice] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('2026-06-11');
  const [attachType, setAttachType] = useState<'bl' | 'facture' | 'photo'>('bl');
  const [mockFileName, setMockFileName] = useState('');

  const [activeTab, setActiveTab] = useState<'products' | 'tanks' | 'deliveries'>('products');

  const handleFuelEditSave = (id: string) => {
    onUpdateFuelRealStock(id, tempRealStock);
    setEditingFuelId(null);
  };

  const handleFuelInitialEditSave = (id: string) => {
    onUpdateFuelInitialStock(id, tempInitialStock);
    setEditingFuelInitialId(null);
  };

  const handleTankEditSave = (id: string) => {
    onUpdateTankRealStock(id, tempTankRealStock);
    setEditingTankId(null);
  };

  const handleAddTankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTankName || !newTankCapacity || !newTankInitialStock) {
      alert("Veuillez remplir tous les champs requis !");
      return;
    }
    onAddTank({
      name: newTankName,
      fuelType: newTankFuelType,
      capacity: Number(newTankCapacity),
      initialStock: Number(newTankInitialStock),
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    // Reset add tank form
    setNewTankName('');
    setNewTankCapacity('');
    setNewTankInitialStock('');
    setIsAddTankOpen(false);
  };

  const handleEditTankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTankPropId || !editTankName || !editTankCapacity || !editTankInitialStock) {
      alert("Veuillez remplir tous les champs requis !");
      return;
    }
    onUpdateTankProperties(
      editingTankPropId,
      editTankName,
      Number(editTankCapacity),
      editTankFuelType,
      Number(editTankInitialStock)
    );
    setEditingTankPropId(null);
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || !quantity || !price) {
      alert("Veuillez remplir tous les champs requis !");
      return;
    }

    onAddDelivery({
      supplier,
      date: deliveryDate,
      product,
      quantity: Number(quantity),
      purchasePricePerLiter: Number(price),
      invoiceNumber: invoice || 'N/A',
      status: 'Reçu',
      attachmentName: mockFileName || `${attachType === 'bl' ? 'bon' : attachType === 'facture' ? 'facture' : 'photo'}_${product.toLowerCase()}_11juin.pdf`
    });

    // Reset form
    setSupplier('');
    setQuantity('');
    setPrice('');
    setInvoice('');
    setMockFileName('');
  };

  return (
    <div className="space-y-6" id="fuels-tanks-root">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Stocks de Carburants, Cuves & Livraisons</h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Automatique calcul des écarts, jaugeage physique des cuves et historique d'approvisionnement.</p>
        </div>
        
        {/* Sub Navigation pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            type="button"
            onClick={() => setActiveTab('products')} 
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Carburants
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('tanks')} 
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${activeTab === 'tanks' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Cuves (Jaugeage)
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('deliveries')} 
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${activeTab === 'deliveries' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
          >
            Livraisons (BL/Factures)
          </button>
        </div>
      </div>

      {/* VIEW PANEL 1: PRODUCTS STOCK COMPILATION */}
      {activeTab === 'products' && (
        <div className="space-y-4" id="tab-products">
          <div className="bg-white rounded border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-150 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Gestion des Produits Pétroliers et Lubrifiants</h3>
                <p className="text-xs text-slate-500">Mise à jour du Stock Réel pour détection d'écarts de coulage ou d'erreurs de caisse.</p>
              </div>
              <span className="text-[10px] bg-orange-50 border border-orange-100 text-orange-700 font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                Formule : Stock Réel - Stock Théorique = Écart
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 text-slate-500 font-mono text-[9px] uppercase tracking-wider border-b border-slate-200">
                    <th className="p-2.5">Produit</th>
                    <th className="p-2.5 text-right">Stock Initial</th>
                    <th className="p-2.5 text-right">Entrées (+)</th>
                    <th className="p-2.5 text-right">Sorties (Ventes) (-)</th>
                    <th className="p-2.5 text-right bg-slate-50 font-bold">Stock Théorique</th>
                    <th className="p-2.5 text-right bg-orange-50/15 text-slate-900 font-bold">Stock Réel (Saisi)</th>
                    <th className="p-2.5 text-center">Écart constaté</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {fuels.map(f => {
                    const unitLabel = f.product === 'Gaz' ? 'boul.' : f.product === 'Lubrifiants' ? 'bidons' : 'L';
                    const isGasOrLub = f.product === 'Gaz' || f.product === 'Lubrifiants';
                    const price = fuelPrices[f.product]?.sell || 0;
                    const lossValue = f.gap * price;

                    return (
                      <tr key={f.id} className="hover:bg-slate-50/70 text-[11px]">
                        <td className="p-2.5 font-sans">
                          <div className="flex items-center gap-2">
                            <span className={`p-1 rounded ${
                              f.product === 'Super' ? 'bg-amber-100 text-amber-800' :
                              f.product === 'Sans plomb' ? 'bg-emerald-100 text-emerald-800' :
                              f.product === 'Gasoil' ? 'bg-blue-100 text-blue-850 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              <Droplet className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <p className="font-semibold text-slate-900">{f.product}</p>
                              <p className="text-[10px] text-slate-400">Prix public: {price} FCFA / L</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          {editingFuelInitialId === f.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <input 
                                type="number" 
                                className="w-20 text-right border border-orange-400 bg-white px-1.5 py-0.5 rounded font-mono text-xs focus:outline-none"
                                value={tempInitialStock}
                                onChange={e => setTempInitialStock(Number(e.target.value))}
                                onKeyDown={e => e.key === 'Enter' && handleFuelInitialEditSave(f.id)}
                              />
                              <button 
                                onClick={() => handleFuelInitialEditSave(f.id)} 
                                className="bg-emerald-600 text-white p-0.5 rounded hover:bg-emerald-700"
                                title="Enregistrer"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => setEditingFuelInitialId(null)} 
                                className="bg-slate-200 text-slate-700 p-0.5 rounded hover:bg-slate-300"
                                title="Annuler"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5 group">
                              <span>{f.initialStock.toLocaleString()} {unitLabel}</span>
                              <button
                                onClick={() => {
                                  setEditingFuelInitialId(f.id);
                                  setTempInitialStock(f.initialStock);
                                }}
                                className="text-slate-400 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                                title="Modifier le stock initial"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-mono text-emerald-600 font-semibold">+{f.inputs.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono text-rose-600">-{f.outputs.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono bg-slate-50 font-bold text-slate-900">{f.theoreticalStock.toLocaleString()} {unitLabel}</td>
                        
                        <td className="p-2.5 text-right bg-orange-50/10 font-bold">
                          {editingFuelId === f.id ? (
                            <input 
                              type="number" 
                              className="w-24 text-right border border-orange-400 bg-white px-1.5 py-0.5 rounded font-mono text-xs focus:ring-1 focus:ring-orange-505 focus:ring-orange-500 focus:outline-none"
                              value={tempRealStock}
                              onChange={e => setTempRealStock(Number(e.target.value))}
                              onKeyDown={e => e.key === 'Enter' && handleFuelEditSave(f.id)}
                            />
                          ) : (
                            <span className="font-mono text-slate-900">{f.realStock.toLocaleString()} {unitLabel}</span>
                          )}
                        </td>

                        <td className="p-2.5 text-center">
                          {f.gap === 0 ? (
                            <span className="text-slate-400 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">0.00 {unitLabel}</span>
                          ) : f.gap < 0 ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-red-650 text-red-600 bg-red-50 font-bold font-mono px-1.5 py-0.5 rounded text-[10px]">
                                {f.gap.toLocaleString()} {unitLabel}
                              </span>
                              {!isGasOrLub && (
                                <span className="text-[9px] text-red-500 font-bold font-mono">({lossValue.toFixed(2)} FCFA)</span>
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-green-650 text-green-600 bg-green-50 font-bold font-mono px-1.5 py-0.5 rounded text-[10px]">
                                +{f.gap.toLocaleString()} {unitLabel}
                              </span>
                              {!isGasOrLub && (
                                <span className="text-[9px] text-green-555 text-green-500 font-bold font-mono">(+{lossValue.toFixed(2)} FCFA)</span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="p-2.5 text-right">
                          {editingFuelId === f.id ? (
                            <div className="flex gap-1 justify-end">
                              <button 
                                onClick={() => handleFuelEditSave(f.id)}
                                className="bg-orange-600 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-orange-700 inline-flex items-center gap-0.5 shadow"
                              >
                                <Check className="w-3 h-3" /> valider
                              </button>
                              <button 
                                onClick={() => setEditingFuelId(null)}
                                className="bg-slate-200 text-slate-705 text-slate-700 px-2 py-1 rounded text-[10px] font-medium hover:bg-slate-300"
                              >
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setEditingFuelId(f.id);
                                setTempRealStock(f.realStock);
                              }}
                              className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-2 py-1 rounded font-bold transition-colors text-[11px]"
                            >
                              Saisir Jauge
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-505 text-slate-500">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-700">Comprendre les écarts :</p>
                <p>Un écart négatif indique un coulage (perte, fuite) ou un vol soupçonné. Un écart positif peut provenir d'une erreur de relevé des pompes ou de la température de livraison de carburant. Les lubrifiants et bouteilles de gaz sont comptabilisés par unité de conditionnement physique.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW PANEL 2: TANKS (CUVES) WITH GAUGING */}
      {activeTab === 'tanks' && (
        <div className="space-y-6" id="tab-tanks">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Gestion et Paramétrage des Cuves de Stockage</h3>
              <p className="text-xs text-slate-500">Ajoutez de nouvelles cuves, ajustez les volumes nominaux et suivez les pertes métriques.</p>
            </div>
            <button
              onClick={() => setIsAddTankOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Ajouter une Cuve
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="tanks-visualizers">
            {tanks.map(t => {
              const fillPercentage = Math.min(100, Math.max(0, (t.realDipstickStock / t.capacity) * 100));
              const hasAlert = t.realDipstickStock < t.capacity * 0.15; // less than 15% left
              const isEditing = editingTankId === t.id;

              return (
                <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-105 bg-slate-100 text-slate-650 text-slate-600 px-2 py-0.5 rounded mt-0.5">
                          {t.fuelType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingTankPropId(t.id);
                            setEditTankName(t.name);
                            setEditTankFuelType(t.fuelType);
                            setEditTankCapacity(String(t.capacity));
                            setEditTankInitialStock(String(t.initialStock));
                          }}
                          className="text-slate-400 hover:text-slate-900 p-1 hover:bg-slate-50 rounded cursor-pointer"
                          title="Modifier la cuve"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Voulez-vous vraiment supprimer la cuve "${t.name}" ?`)) {
                              onDeleteTank(t.id);
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded cursor-pointer"
                          title="Supprimer la cuve"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {hasAlert && (
                          <span className="p-1 text-rose-600 animate-pulse" title="Niveau critique !">
                            <AlertOctagon className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fuel Tank visual cylinder */}
                    <div className="my-5 relative h-28 w-full bg-slate-105 bg-slate-100 rounded-lg border-2 border-slate-350 overflow-hidden flex flex-col justify-end">
                      {/* Fuel level bar with colored animation depending on fuelType */}
                      <div 
                        className={`w-full transition-all duration-700 ${
                          t.fuelType === 'Super' ? 'bg-amber-400/80 hover:bg-amber-400' :
                          t.fuelType === 'Sans plomb' ? 'bg-emerald-400/80 hover:bg-emerald-400' :
                          t.fuelType === 'Gasoil' ? 'bg-blue-400/80 hover:bg-blue-400' :
                          'bg-purple-400/85'
                        }`}
                        style={{ height: `${fillPercentage}%` }}
                      ></div>
                      {/* Grid lines indicators inside custom cylinder */}
                      <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none text-[9px] font-mono font-medium text-slate-500 bg-linear-to-b from-transparent to-black/5">
                        <div className="text-right border-b border-dashed border-slate-300">100% ({t.capacity.toLocaleString()}L)</div>
                        <div className="text-right border-b border-dashed border-slate-200">50% ({Math.floor(t.capacity/2).toLocaleString()}L)</div>
                        <div className="text-right">15% Zone Critique</div>
                      </div>
                    </div>

                    {/* Tank Stocks state */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Stock théorique:</span>
                        <span className="font-semibold font-mono">{t.theoreticalStock.toLocaleString()} L</span>
                      </div>
                      
                      <div className="flex justify-between items-center bg-orange-50/15 p-1.5 rounded border border-orange-100">
                        <span className="text-slate-600 font-semibold">Stock réel (Juge):</span>
                        {isEditing ? (
                          <div className="flex gap-1">
                            <input 
                              type="number" 
                              className="w-16 border border-orange-400 text-right bg-white px-1.5 py-0.5 text-xs font-mono rounded focus:outline-none"
                              value={tempTankRealStock}
                              onChange={e => setTempTankRealStock(Number(e.target.value))}
                            />
                            <button onClick={() => handleTankEditSave(t.id)} className="bg-orange-600 text-white p-0.5 rounded hover:bg-orange-700 cursor-pointer">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span 
                            onClick={() => {
                              setEditingTankId(t.id);
                              setTempTankRealStock(t.realDipstickStock);
                            }}
                            className="font-bold font-mono text-orange-755 text-orange-700 cursor-pointer underline decoration-dotted decoration-orange-400 hover:text-orange-500"
                            title="Cliquer pour jeter une mesure de jauge"
                          >
                            {t.realDipstickStock.toLocaleString()} L
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-505 text-slate-500">Pertes détectées:</span>
                        <span className={`font-mono font-bold ${t.lossDetected < 0 ? 'text-red-500' : t.lossDetected > 0 ? 'text-green-600' : 'text-slate-500'}`}>
                          {t.lossDetected === 0 ? 'Aucune' : t.lossDetected > 0 ? `+${t.lossDetected.toLocaleString()} L` : `${t.lossDetected.toLocaleString()} L`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingTankId(editingTankId === t.id ? null : t.id);
                        setTempTankRealStock(t.realDipstickStock);
                      }} 
                      className="text-xs text-orange-600 hover:text-orange-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      Mettre à jour le jaugeage métrique <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Tank Modal */}
          {isAddTankOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in scale-in duration-200">
                <div className="p-4 bg-slate-905 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="font-bold text-sm">Ajouter une Nouvelle Cuve</h3>
                  <button onClick={() => setIsAddTankOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleAddTankSubmit} className="p-5 space-y-4 text-xs font-sans">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nom de la Cuve</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                      placeholder="Ex: Cuve 3 (Gasoil)"
                      value={newTankName}
                      onChange={e => setNewTankName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Type de Carburant</label>
                      <select
                        className="w-full border border-slate-300 rounded px-2 py-2 text-xs bg-white focus:outline-none"
                        value={newTankFuelType}
                        onChange={e => setNewTankFuelType(e.target.value as FuelType)}
                      >
                        <option value="Super">Super</option>
                        <option value="Sans plomb">Sans plomb</option>
                        <option value="Gasoil">Gasoil</option>
                        <option value="Pétrole">Pétrole</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Capacité Max (L)</label>
                      <input
                        type="number"
                        className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs focus:outline-none"
                        placeholder="Ex: 15000"
                        value={newTankCapacity}
                        onChange={e => setNewTankCapacity(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Stock Initial de Départ (L)</label>
                    <input
                      type="number"
                      className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs focus:outline-none"
                      placeholder="Ex: 4000"
                      value={newTankInitialStock}
                      onChange={e => setNewTankInitialStock(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddTankOpen(false)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-xs cursor-pointer"
                    >
                      Créer la cuve
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Tank Modal */}
          {editingTankPropId && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in scale-in duration-200">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <h3 className="font-bold text-sm">Modifier les Paramètres de la Cuve</h3>
                  <button onClick={() => setEditingTankPropId(null)} className="text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleEditTankSubmit} className="p-5 space-y-4 text-xs font-sans">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nom de la Cuve</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs focus:outline-none"
                      value={editTankName}
                      onChange={e => setEditTankName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Type de Carburant</label>
                      <select
                        className="w-full border border-slate-300 rounded px-2 py-2 text-xs bg-white focus:outline-none"
                        value={editTankFuelType}
                        onChange={e => setEditTankFuelType(e.target.value as FuelType)}
                      >
                        <option value="Super">Super</option>
                        <option value="Sans plomb">Sans plomb</option>
                        <option value="Gasoil">Gasoil</option>
                        <option value="Pétrole">Pétrole</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Capacité Max (L)</label>
                      <input
                        type="number"
                        className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs focus:outline-none"
                        value={editTankCapacity}
                        onChange={e => setEditTankCapacity(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Stock Initial (L)</label>
                    <input
                      type="number"
                      className="w-full border border-slate-300 rounded px-2.5 py-2 text-xs focus:outline-none"
                      value={editTankInitialStock}
                      onChange={e => setEditTankInitialStock(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingTankPropId(null)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-xs cursor-pointer"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW PANEL 3: DELIVERIES MANAGER */}
      {activeTab === 'deliveries' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="tab-deliveries font-sans">
          
          {/* Record delivery form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-fit">
            <h3 className="font-bold text-slate-900 text-sm mb-4 inline-flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-600" /> Nouvel Entrée Carburant / Livraison
            </h3>
            
            <form onSubmit={handleDeliverySubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Fournisseur</label>
                <input 
                  type="text" 
                  placeholder="Ex: TotalEnergies Pro, Shell, Oilibya" 
                  className="w-full border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  value={supplier}
                  onChange={e => setSupplier(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Produit de carburant</label>
                  <select 
                    className="w-full border border-slate-300 rounded px-2 py-2 bg-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    value={product}
                    onChange={e => setProduct(e.target.value as FuelType)}
                  >
                    <option value="Super">Super</option>
                    <option value="Sans plomb">Sans plomb</option>
                    <option value="Gasoil">Gasoil</option>
                    <option value="Pétrole">Pétrole</option>
                    <option value="Gaz">Gaz (Bouteilles)</option>
                    <option value="Lubrifiants">Lubrifiants</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantité (L/Unités)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 5000" 
                    className="w-full border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Prix d'Achat unitaire (FCFA)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Ex: 1.25" 
                    className="w-full border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">N° de Facture ou BL</label>
                  <input 
                    type="text" 
                    placeholder="Ex: BL-1234-A" 
                    className="w-full border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    value={invoice}
                    onChange={e => setInvoice(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Date de livraison</label>
                <input 
                  type="date" 
                  className="w-full border border-slate-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                />
              </div>

              {/* Justificatif attachment zone (Required by point 7: Pieces jointes: bon livraison, facture, photo) */}
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 bg-slate-50 relative cursor-pointer hover:bg-slate-100 transition-colors">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setMockFileName(e.target.files[0].name);
                    }
                  }}
                />
                <div className="flex flex-col items-center text-center gap-1.5">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <p className="font-semibold text-[10px] text-slate-700">Joindre un document (BL, Facture, Photo)</p>
                  <p className="text-[9px] text-slate-500">PDF, PNG, JPG jusqu'à 5MB</p>
                  {mockFileName ? (
                    <span className="inline-block bg-orange-50 border border-orange-200 text-orange-700 font-mono text-[9px] px-2 py-0.5 rounded mt-1.5">
                      📎 {mockFileName}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span onClick={() => { setMockFileName('bon_reception_physique.png'); }} className="text-[9px] text-orange-600 hover:underline px-1 bg-white border border-slate-200 rounded">Simulation BL.png</span>
                      <span onClick={() => { setMockFileName('facture_total_06_11.pdf'); }} className="text-[9px] text-orange-600 hover:underline px-1 bg-white border border-slate-200 rounded">Facture_06.pdf</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded shadow-xs focus:ring-1 focus:ring-slate-900 flex justify-center items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Enregistrer la Livraison
              </button>
            </form>
          </div>

          {/* Deliveries list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 lg:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-4">Registre Historique des Livraisons</h3>
              
              <div className="space-y-3">
                {deliveries.map(d => {
                  const val = d.quantity * d.purchasePricePerLiter;
                  return (
                    <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white border border-slate-200 rounded text-slate-700">
                          <Droplet className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-950 text-xs">{d.supplier}</h4>
                            <span className="text-[9px] bg-slate-200 font-mono text-slate-700 px-1.5 rounded">
                              {d.product}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">Date: {d.date} • BL N° {d.invoiceNumber}</p>
                          {d.attachmentName && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-orange-700 font-bold bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded mt-1">
                              <FileText className="w-3 h-3 text-orange-600" /> {d.attachmentName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-900 font-mono">
                          {d.quantity.toLocaleString()} L / Unités
                        </p>
                        <p className="text-[10px] text-slate-500">Achat: {d.purchasePricePerLiter.toFixed(2)} FCFA/L</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-slate-950 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                            {val.toLocaleString()} FCFA
                          </span>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            d.status === 'Reçu' ? 'bg-green-100 text-green-800' :
                            d.status === 'En transit' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {d.status}
                          </span>
                          <button
                            onClick={() => onDeleteDelivery(d.id)}
                            className="p-1 text-slate-400 hover:text-rose-650 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Supprimer la livraison"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
              <span>Total livré sur la période : {deliveries.filter(d => d.status === 'Reçu').reduce((acc, curr) => acc + curr.quantity, 0).toLocaleString()} L</span>
              <span className="font-mono text-slate-800 font-bold">Investissement total : {deliveries.filter(d => d.status === 'Reçu').reduce((acc, curr) => acc + (curr.quantity * curr.purchasePricePerLiter), 0).toLocaleString()} FCFA</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
