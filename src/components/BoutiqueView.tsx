import React, { useState } from 'react';
import { ShopProduct, ShopCategory, ShopSale } from '../types';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Tag, 
  TrendingUp, 
  Check, 
  Search,
  ShoppingCart,
  Layers,
  Inbox,
  Sparkles
} from 'lucide-react';

interface BoutiqueViewProps {
  products: ShopProduct[];
  sales: ShopSale[];
  onSellProduct: (productId: string, quantity: number) => void;
  onRestockProduct: (productId: string, quantity: number) => void;
  onUpdateShopProductStock: (productId: string, actualStock: number) => void;
}

export default function BoutiqueView({
  products,
  sales,
  onSellProduct,
  onRestockProduct,
  onUpdateShopProductStock
}: BoutiqueViewProps) {
  const categories: ShopCategory[] = ['Eau', 'Boissons', 'Biscuits', 'Accessoires Auto', 'Huiles', 'Batteries'];
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'Tous'>('Tous');
  
  // Sale workflow state
  const [sellingProductId, setSellingProductId] = useState('');
  const [sellingQty, setSellingQty] = useState(1);
  
  // Restock workflow state
  const [restockProductId, setRestockProductId] = useState('');
  const [restockQty, setRestockQty] = useState(10);
  
  // Audit inventory workflow state
  const [auditProductId, setAuditProductId] = useState('');
  const [auditCount, setAuditCount] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellingProductId || sellingQty <= 0) return;
    
    const targetProd = products.find(p => p.id === sellingProductId);
    if (!targetProd) return;

    if (targetProd.stock < sellingQty) {
      alert(`Stock insuffisant ! Seuls ${targetProd.stock} articles sont disponibles.`);
      return;
    }

    onSellProduct(sellingProductId, sellingQty);
    setSellingProductId('');
    setSellingQty(1);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProductId || restockQty <= 0) return;
    onRestockProduct(restockProductId, restockQty);
    setRestockProductId('');
    setRestockQty(10);
    alert("Achat fournisseur enregistré avec succès. Stock rechargé !");
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditProductId || auditCount === '') return;
    onUpdateShopProductStock(auditProductId, Number(auditCount));
    setAuditProductId('');
    setAuditCount('');
    alert("Ajustement d'inventaire enregistré avec succès !");
  };

  // Filtration logic
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const lowStockAlerts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="space-y-6" id="boutique-view-root font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Gestion de la Boutique Station</h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Suivi des stocks, enregistrement des ventes boutique et alertes de rupture produits.</p>
        </div>
      </div>

      {/* Critical Stock Alerts banner inside shop */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Alerte Stocks de Sécurité Dépassés ({lowStockAlerts.length} produits) :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2 font-mono text-[11px]">
              {lowStockAlerts.map(p => (
                <div key={p.id} className="bg-white/80 p-1.5 rounded border border-red-200 flex justify-between items-center text-red-950">
                  <span>{p.name}</span>
                  <span className="font-bold text-red-600">Stock: {p.stock} (Min: {p.minStock})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main workspace layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left columns: Inventory view & Category Filter */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters & search line */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            {/* Search inputs */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Rechercher produit..." 
                className="w-full bg-white text-xs pl-9 pr-3.5 py-2 rounded-lg border border-slate-350 focus:outline-none focus:ring-1 focus:ring-slate-900"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category tabs scroll */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button 
                type="button"
                onClick={() => setSelectedCategory('Tous')} 
                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-md shrink-0 transition-colors ${selectedCategory === 'Tous' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-950'}`}
              >
                Tous
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)} 
                  className={`text-[11px] font-bold px-2.5 py-1.5 rounded-md shrink-0 transition-colors ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-950'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid list of catalog items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5" id="shop-catalog-grid">
            {filteredProducts.map(prod => {
              const isLow = prod.stock <= prod.minStock;
              const margin = prod.sellingPrice - prod.purchasePrice;
              
              return (
                <div key={prod.id} className={`bg-white rounded-xl border p-4.5 shadow-xs flex flex-col justify-between ${isLow ? 'border-red-300 bg-red-50/10' : 'border-slate-200'}`}>
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                        {prod.category}
                      </span>
                      {isLow && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3 text-red-500" /> ALERTE
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-950 text-xs line-clamp-2 min-h-[32px]">{prod.name}</h4>
                    
                    <div className="my-3 space-y-1 font-sans text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Prix d'achat:</span>
                        <span className="font-mono">{prod.purchasePrice.toFixed(0)} FCFA</span>
                      </div>
                      <div className="flex justify-between text-slate-800 font-medium">
                        <span>Prix public:</span>
                        <span className="font-mono text-slate-950 font-bold">{prod.sellingPrice.toFixed(0)} FCFA</span>
                      </div>
                      <div className="flex justify-between text-slate-500 border-t border-dashed border-slate-100 pt-1">
                        <span>Bénéfice/unité:</span>
                        <span className="font-mono text-emerald-600 font-semibold">{margin.toFixed(0)} FCFA</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Stock Disponible</span>
                      <span className={`font-mono font-bold text-sm ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                        {prod.stock} unités
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => {
                          setSellingProductId(prod.id);
                          setSellingQty(1);
                        }} 
                        className="p-1.5 bg-slate-100 text-slate-800 border border-slate-200 rounded hover:bg-slate-250"
                        title="Vendre"
                      >
                        <ShoppingCart className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => {
                          setRestockProductId(prod.id);
                          setRestockQty(10);
                        }} 
                        className="p-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded hover:bg-orange-100/80"
                        title="Réapprovisionner"
                      >
                        <Plus className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-slate-400 col-span-3">Aucun produit ne correspond à ces critères.</div>
            )}
          </div>

          {/* Recent sales logger */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 mt-5">
            <h3 className="font-bold text-slate-900 text-sm mb-3">Historique Récent des Ventes Boutique</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <th className="p-2.5">Produit vendu</th>
                    <th className="p-2.5 text-center">Quantité</th>
                    <th className="p-2.5 text-right">Prix à l'unité</th>
                    <th className="p-2.5 text-right">Montant encaissé</th>
                    <th className="p-2.5 text-right">Heure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sales.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-semibold text-slate-900">{s.productName}</td>
                      <td className="p-2.5 text-center font-mono">{s.quantity}</td>
                      <td className="p-2.5 text-right font-mono">{s.price.toFixed(0)} FCFA</td>
                      <td className="p-2.5 text-right font-mono text-emerald-700 font-bold">+{s.total.toFixed(0)} FCFA</td>
                      <td className="p-2.5 text-right text-[10px] text-slate-400">
                        {new Date(s.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td className="p-8 text-center text-slate-400" colSpan={5}>Aucune vente enregistrée sur cette période de service.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Action Forms widgets */}
        <div className="space-y-6">
          
          {/* Quick Sale Checkout Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3 inline-flex items-center gap-2">
              <ShoppingCart className="w-4.5 h-4.5 text-orange-600" /> Saisie Vente En Direct
            </h3>
            
            <form onSubmit={handleSellSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-705 font-semibold mb-1">Sélectionner Produit</label>
                <select 
                  className="w-full border border-slate-300 rounded px-2.5 py-2 bg-white focus:outline-none"
                  value={sellingProductId}
                  onChange={e => setSellingProductId(e.target.value)}
                  required
                >
                  <option value="">-- Choisissez un produit --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                      {p.name} (Dispo : {p.stock}) - {p.sellingPrice.toFixed(0)} FCFA
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-705 font-semibold mb-1">Quantité vendue</label>
                <input 
                  type="number" 
                  min="1" 
                  className="w-full border border-slate-300 rounded px-2.5 py-2 font-mono text-xs focus:outline-none focus:border-slate-800"
                  value={sellingQty}
                  onChange={e => setSellingQty(Number(e.target.value))}
                  required
                />
              </div>

              {sellingProductId && (() => {
                const target = products.find(p => p.id === sellingProductId);
                if (!target) return null;
                const totalEstimated = target.sellingPrice * sellingQty;
                return (
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div className="flex justify-between font-semibold">
                      <span>Total à payer:</span>
                      <span className="font-mono text-orange-600 font-bold">{totalEstimated.toFixed(0)} FCFA</span>
                    </div>
                  </div>
                );
              })()}

              <button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded shadow-xs text-xs"
              >
                Valider Vente & Encaisser
              </button>
            </form>
          </div>

          {/* restock purchasing form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3 inline-flex items-center gap-2">
              <Plus className="w-4.5 h-4.5 text-emerald-600" /> Approvisionner Stock (Achat)
            </h3>
            
            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-705 font-semibold mb-1">Sélectionner Produit</label>
                <select 
                  className="w-full border border-slate-300 rounded px-2.5 py-2 bg-white focus:outline-none"
                  value={restockProductId}
                  onChange={e => setRestockProductId(e.target.value)}
                  required
                >
                  <option value="">-- Choisissez un produit --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-705 font-semibold mb-1">Quantité commandée</label>
                <input 
                  type="number" 
                  min="1" 
                  className="w-full border border-slate-300 rounded px-2.5 py-2 font-mono"
                  value={restockQty}
                  onChange={e => setRestockQty(Number(e.target.value))}
                  required
                />
              </div>

              {restockProductId && (() => {
                const target = products.find(p => p.id === restockProductId);
                if (!target) return null;
                const cost = target.purchasePrice * restockQty;
                return (
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-650">
                    <div className="flex justify-between">
                      <span>Coût d'achat total:</span>
                      <span className="font-mono font-bold text-slate-900">{cost.toFixed(0)} FCFA</span>
                    </div>
                  </div>
                );
              })()}

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded shadow-xs"
              >
                Enregistrer Approvisionnement
              </button>
            </form>
          </div>

          {/* Shop physical Inventory manual control */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-3 inline-flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-purple-600" /> Inventaire de Contrôle
            </h3>
            
            <form onSubmit={handleAuditSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-705 font-semibold mb-1">Sélectionner Produit</label>
                <select 
                  className="w-full border border-slate-300 rounded px-2.5 py-2 bg-white focus:outline-none"
                  value={auditProductId}
                  onChange={e => setAuditProductId(e.target.value)}
                  required
                >
                  <option value="">-- Choisissez un produit --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Théorique: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-705 font-semibold mb-1">Quantité réelle dénombrée</label>
                <input 
                  type="number" 
                  min="0" 
                  className="w-full border border-slate-300 rounded px-2.5 py-2 font-mono"
                  value={auditCount}
                  onChange={e => setAuditCount(e.target.value)}
                  required
                />
              </div>

              {auditProductId && auditCount !== '' && (() => {
                const target = products.find(p => p.id === auditProductId);
                if (!target) return null;
                const currentTh = target.stock;
                const gap = Number(auditCount) - currentTh;
                return (
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                    <div className="flex justify-between text-xs">
                      <span>Écart physique:</span>
                      <span className={`font-mono font-bold ${gap < 0 ? 'text-red-500' : gap === 0 ? 'text-slate-500' : 'text-green-600'}`}>
                        {gap === 0 ? 'Équilibré' : gap < 0 ? `${gap} unités (Coulage/Perte)` : `+${gap} unités (Excédent)`}
                      </span>
                    </div>
                  </div>
                );
              })()}

              <button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded shadow-xs"
              >
                Enregistrer Inventaire Physique
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
