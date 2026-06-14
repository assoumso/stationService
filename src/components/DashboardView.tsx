import React from 'react';
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
import { 
  INITIAL_HOURLY_SALES, 
  RECENT_HISTORY 
} from '../mockData';
import { 
  TrendingUp, 
  AlertTriangle, 
  Droplet, 
  ShoppingBag, 
  Layers, 
  DollarSign, 
  TrendingDown, 
  Clock, 
  Activity, 
  CheckCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface DashboardViewProps {
  fuels: FuelStock[];
  pumps: Pump[];
  tanks: Tank[];
  shopProducts: ShopProduct[];
  carWash: CarWashRecord[];
  oilChanges: OilChangeRecord[];
  expenses: Expense[];
  cashRegisters: CashRegister[];
  fuelPrices: Record<string, { buy: number; sell: number }>;
  onNavigate: (view: string) => void;
}

export default function DashboardView({
  fuels,
  pumps,
  tanks,
  shopProducts,
  carWash,
  oilChanges,
  expenses,
  cashRegisters,
  fuelPrices,
  onNavigate
}: DashboardViewProps) {
  // --- Calculations for Today (2026-06-11) ---
  
  // 1. Fuel Sales revenue
  const fuelRevenue = pumps.reduce((acc, pump) => {
    const price = fuelPrices[pump.fuelType]?.sell || 0;
    return acc + (pump.volumeSold * price);
  }, 0);

  // 1b. Fuel Cost for profit estimate
  const fuelCost = pumps.reduce((acc, pump) => {
    const price = fuelPrices[pump.fuelType]?.buy || 0;
    return acc + (pump.volumeSold * price);
  }, 0);

  // 2. Shop Sales revenue & cost
  const shopRevenue = shopProducts.reduce((acc, prod) => acc + (prod.salesCount * prod.sellingPrice), 0);
  const shopCost = shopProducts.reduce((acc, prod) => acc + (prod.salesCount * prod.purchasePrice), 0);

  // 3. Wash Service revenue
  const washRevenue = carWash
    .filter(record => record.date === '2026-06-11')
    .reduce((acc, record) => acc + record.revenue, 0);

  // 4. Oil Change Service revenue & margins
  const oilRevenue = oilChanges
    .filter(record => record.date === '2026-06-11')
    .reduce((acc, record) => acc + record.chargedPrice, 0);

  const oilMargin = oilChanges
    .filter(record => record.date === '2026-06-11')
    .reduce((acc, record) => acc + record.margin, 0);

  // Totals
  const totalRevenue = fuelRevenue + shopRevenue + washRevenue + oilRevenue;

  // Expenses for today (Approuvé status)
  const todayExpensesApproved = expenses
    .filter(ex => ex.date === '2026-06-11' && ex.status === 'Approuvé')
    .reduce((acc, ex) => acc + ex.amount, 0);

  const todayExpensesPending = expenses
    .filter(ex => ex.date === '2026-06-11' && ex.status === 'En attente')
    .reduce((acc, ex) => acc + ex.amount, 0);

  const totalExpensesToday = todayExpensesApproved + todayExpensesPending;

  // Estimated profit: total revenue - cost of goods sold - approved expenses
  const fuelProfit = fuelRevenue - fuelCost;
  const shopProfit = shopRevenue - shopCost;
  // Wash margin is close to 85% profit (excluding water/electricity which are in expenses)
  const washProfit = washRevenue * 0.85; 
  const oilProfit = oilMargin;
  const estimatedProfit = (fuelProfit + shopProfit + washProfit + oilProfit) - todayExpensesApproved;

  // Stock alerts
  const lowStockProducts = shopProducts.filter(p => p.stock <= p.minStock);
  const lowFuelAlerts = fuels.filter(f => f.realStock < 2000); // 2000L threshold

  // Losses & Gaps
  const fuelGapValue = fuels.reduce((acc, f) => {
    // Gap in Liters multiplied by retail price to see commercial value of gap
    const price = fuelPrices[f.product]?.sell || 0;
    return acc + (f.gap * price);
  }, 0);

  const tankLossLiters = tanks.reduce((acc, t) => acc + Math.abs(Math.min(0, t.lossDetected)), 0);

  // Caisse Situation
  const totalCaisse = cashRegisters.reduce((acc, cr) => acc + cr.currentBalance, 0);

  // Prepare dynamic hourly data based on current multipliers if they adjusted
  const hourlyData = INITIAL_HOURLY_SALES.map(item => {
    // scale to match current totals
    const scaleFactor = totalRevenue / 7500; // 7500 was original sum roughly
    return {
      ...item,
      carburant: Math.round(item.carburant * (fuelRevenue / 10000 || 1)),
      boutique: Math.round(item.boutique * (shopRevenue / 800 || 1)),
      services: Math.round(item.services * ((washRevenue + oilRevenue) / 300 || 1)),
    };
  });

  return (
    <div className="space-y-6" id="dashboard-view-root">
      
      {/* Title & Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-3" id="db-header">
        <div>
          <h2 className="text-lg font-bold text-slate-800 italic uppercase tracking-wider" id="db-title">Tableau de Bord Principal <span className="text-slate-400 font-normal tracking-wide text-xs ml-2 normal-case">11 Juin 2026</span></h2>
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-1">Données d'exploitation en temps réel • Haute Densité</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono bg-white text-slate-600 px-2.5 py-1 rounded border border-slate-200 w-fit">
          <Clock className="w-3.5 h-3.5 text-orange-500" />
          <span>Saisie en direct: 14:48:29</span>
        </div>
      </div>

      {/* Critical Alerts Bar */}
      {(lowStockProducts.length > 0 || lowFuelAlerts.length > 0 || todayExpensesPending > 0 || fuelGapValue < 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" id="dashboard-alerts">
          {lowFuelAlerts.map(fuel => (
            <div key={fuel.id} className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-semibold">Alerte Stock Bas : {fuel.product}</p>
                <p className="text-amber-800">Seulement {fuel.realStock.toLocaleString()} L en cuve. Livraison recommandée d'urgence.</p>
              </div>
            </div>
          ))}
          {lowStockProducts.slice(0, 2).map(prod => (
            <div key={prod.id} className="flex items-start gap-3 bg-orange-50 border border-orange-200 p-3 rounded-lg text-orange-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Rupture imminente boutique</p>
                <p className="text-orange-850">Produit: <span className="font-medium">{prod.name}</span> (En stock: {prod.stock} - Min: {prod.minStock})</p>
              </div>
            </div>
          ))}
          {fuelGapValue < -100 && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 p-3 rounded-lg text-red-900 text-xs md:col-span-2 lg:col-span-1">
              <ShieldAlert className="w-4 h-4 text-red-650 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Écarts de carburant anormaux</p>
                <p className="text-red-805">Perte totale estimée : <span className="font-bold">{Math.abs(fuelGapValue).toLocaleString('fr-FR')} FCFA</span>. Vérifiez les cuves et pompes.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5" id="dashboard-kpis">
        
        {/* Chiffre d'Affaires */}
        <div className="bg-white p-3 rounded border border-slate-200 border-l-4 border-l-orange-500 flex flex-col justify-between h-24 shadow-xs" id="card-revenue">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chiffre d'Affaires</span>
            <div className="p-1 bg-orange-50 text-orange-600 rounded">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">
                {totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs font-semibold text-slate-500">FCFA</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
              <span className="text-emerald-600 font-bold">+4.2%</span>
              <span>vs hier</span>
            </div>
          </div>
        </div>

        {/* Bénéfice Estimé */}
        <div className="bg-white p-3 rounded border border-slate-200 border-l-4 border-l-emerald-500 flex flex-col justify-between h-24 shadow-xs" id="card-profit">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bénéfice Net Estimé</span>
            <div className="p-1 bg-emerald-50 text-emerald-600 rounded">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-mono">
                {estimatedProfit.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs font-semibold text-slate-500">FCFA</span>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
              <span className="text-emerald-600 font-mono font-bold">
                {((estimatedProfit / (totalRevenue || 1)) * 100).toFixed(1)}% marge
              </span>
            </div>
          </div>
        </div>

        {/* Dépenses du Jour */}
        <div className="bg-white p-3 rounded border border-slate-200 border-l-4 border-l-red-500 flex flex-col justify-between h-24 shadow-xs" id="card-expenses">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dépenses Approuvées</span>
            <div className="p-1 bg-red-50 text-red-500 rounded">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-xl font-bold tracking-tight font-mono text-red-600">
                {todayExpensesApproved.toLocaleString('fr-FR', { minimumFractionDigits: 0 })}
              </span>
              <span className="text-xs font-semibold text-red-600">FCFA</span>
              {todayExpensesPending > 0 && (
                <span className="text-[9px] text-amber-600 font-bold font-mono ml-1 bg-amber-50 px-1 rounded">
                  (+{todayExpensesPending.toLocaleString('fr-FR')} FCFA en attente)
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5">
              <span>Aujourd'hui</span>
              <button onClick={() => onNavigate('caisse')} className="text-red-500 hover:underline font-bold inline-flex items-center gap-0.5">
                Valider <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Écarts/Pertes */}
        <div className="bg-white p-3 rounded border border-slate-200 border-l-4 border-l-amber-500 flex flex-col justify-between h-24 shadow-xs" id="card-gaps">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Situation des Écarts</span>
            <div className={`p-1 rounded ${fuelGapValue < 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-bold tracking-tight font-mono ${fuelGapValue < 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {fuelGapValue < 0 ? '' : '+'}{fuelGapValue.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs font-semibold text-slate-500">FCFA</span>
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5">
              <span>Cuves: {tankLossLiters} L</span>
              <button onClick={() => onNavigate('fuels')} className="text-slate-500 hover:underline hover:text-orange-500 font-bold inline-flex items-center gap-0.5">
                Détails <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Breakdown categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5" id="dashboard-breakdown">
        
        {/* Carburant Share */}
        <div className="bg-white p-3 rounded border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ventes Carburants</p>
            <p className="text-base font-bold text-slate-900 font-mono">{fuelRevenue.toLocaleString('fr-FR')} FCFA</p>
            <p className="text-[10px] text-slate-400 font-mono">{((fuelRevenue / (totalRevenue || 1)) * 100).toFixed(0)}% des revenus</p>
          </div>
        </div>

        {/* Boutique Share */}
        <div className="bg-white p-3 rounded border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 text-orange-600 rounded">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ventes Boutique</p>
            <p className="text-base font-bold text-slate-900 font-mono">{shopRevenue.toLocaleString('fr-FR')} FCFA</p>
            <p className="text-[10px] text-slate-400 font-mono">{((shopRevenue / (totalRevenue || 1)) * 100).toFixed(0)}% des revenus</p>
          </div>
        </div>

        {/* Lavage Share */}
        <div className="bg-white p-3 rounded border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lavage Automobile</p>
            <p className="text-base font-bold text-slate-900 font-mono">{washRevenue.toLocaleString('fr-FR')} FCFA</p>
            <p className="text-[10px] text-slate-450">Services en direct</p>
          </div>
        </div>

        {/* Vidange Share */}
        <div className="bg-white p-3 rounded border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 text-orange-700 rounded">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vidange Moteur</p>
            <p className="text-base font-bold text-slate-900 font-mono">{oilRevenue.toLocaleString('fr-FR')} FCFA</p>
            <p className="text-[10px] text-emerald-600 font-semibold font-mono">Marge: +{oilMargin.toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>

      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="dashboard-charts-layout">
        
        {/* Hourly sales area chart */}
        <div className="bg-white p-4 rounded border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Activité horaire de la journée</h3>
              <p className="text-xs text-slate-500">Répartition des ventes par heure de service</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block"></span> Carburant</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-400 rounded-full inline-block"></span> Boutique</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-600 rounded-full inline-block"></span> Services</span>
            </div>
          </div>
          <div className="h-[260px] w-full" id="hourly-sales-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCarb" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', color: '#fff', fontFamily: 'monospace', fontSize: '11px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#cbd5e1' }}
                />
                <Area type="monotone" dataKey="carburant" name="Carburant (FCFA)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCarb)" />
                <Area type="monotone" dataKey="boutique" name="Boutique (FCFA)" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorBout)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Situation de caisse & Équipes list */}
        <div className="bg-white p-4 rounded border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm mb-3">Situation Actuelle des Caisses</h3>
            <div className="space-y-2 mb-4">
              {cashRegisters.map(cr => (
                <div key={cr.id} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      cr.method === 'Espèces' ? 'bg-green-500' :
                      cr.method === 'Mobile Money' ? 'bg-orange-500' :
                      cr.method === 'Carte Bancaire' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}></span>
                    <span className="text-xs font-semibold text-slate-700">{cr.method}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900">{cr.currentBalance.toLocaleString('fr-FR')} FCFA</span>
                </div>
              ))}
              <div className="flex justify-between items-center bg-slate-900 text-white p-2.5 rounded mt-3">
                <span className="text-xs font-medium">TOTAL ENCAISSÉ (Solde)</span>
                <span className="text-sm font-bold font-mono text-orange-400">{totalCaisse.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider mb-2">
              <span className="text-slate-500 font-medium">Equipe de Service</span>
              <span className="text-green-600 font-bold inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> En cours
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans">De 14:00 à 22:00. Manager : <span className="font-semibold text-slate-700 font-mono">Jean Dupont</span></p>
          </div>
        </div>

      </div>

      {/* History of closings table */}
      <div className="bg-white p-4 rounded border border-slate-200 shadow-xs" id="dashboard-closing-history">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Clôtures Journalières Récentes</h3>
            <p className="text-xs text-slate-500">Historique des 5 derniers rapports de service validés</p>
          </div>
          <button 
            onClick={() => onNavigate('reports')} 
            className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-850 px-3 py-1.5 rounded border border-slate-200 transition-colors"
          >
            Consulter les rapports avancés
          </button>
        </div>

        <div className="overflow-x-auto rounded border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[9px] uppercase tracking-widest">
                <th className="p-2.5">Date clôture</th>
                <th className="p-2.5">Total Ventes</th>
                <th className="p-2.5">Bénéfice estimé</th>
                <th className="p-2.5 text-center">Écarts finaux</th>
                <th className="p-2.5 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-sans text-slate-700">
              {RECENT_HISTORY.map(day => (
                <tr key={day.id} className="hover:bg-slate-50 cursor-pointer text-[11px]" onClick={() => onNavigate('reports')}>
                  <td className="p-2.5 font-semibold text-slate-900">{day.date === '2026-06-11' ? 'Aujourd\'hui (11 Juin)' : day.date}</td>
                  <td className="p-2.5 font-mono">{day.totalSales.toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-2.5 font-mono text-emerald-700 font-bold">+{day.profit.toLocaleString('fr-FR')} FCFA</td>
                  <td className="p-2.5 text-center font-mono">
                    {day.gap === 0 ? (
                      <span className="text-slate-400">Équilibré (0.00)</span>
                    ) : day.gap < 0 ? (
                      <span className="text-red-500 bg-red-50 px-1 py-0.5 rounded font-bold font-mono text-[10px]">
                        {day.gap.toLocaleString('fr-FR')} FCFA
                      </span>
                    ) : (
                      <span className="text-green-600 bg-green-50 px-1 py-0.5 rounded font-bold font-mono text-[10px]">
                        +{day.gap.toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-right">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${
                      day.status === 'Clôturé' ? 'bg-slate-100 text-slate-705 text-slate-700' : 'bg-orange-50 text-orange-700 border border-orange-100'
                    }`}>
                      {day.status === 'Clôturé' && <CheckCircle className="w-2.5 h-2.5 text-slate-500" />}
                      {day.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
