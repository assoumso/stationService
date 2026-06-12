import React, { useState } from 'react';
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
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  MONTHLY_TRENDS, 
  RECENT_HISTORY 
} from '../mockData';
import { 
  Building2, 
  Calendar, 
  Download, 
  FileCheck, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Layers 
} from 'lucide-react';

export default function ReportsView() {
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  // Static mock weekly trends to support period swapping
  const weeklyTrends = [
    { period: 'Semaine 21', carburant: 32000, boutique: 4800, services: 2100 },
    { period: 'Semaine 22', carburant: 29000, boutique: 3900, services: 1800 },
    { period: 'Semaine 23', carburant: 38000, boutique: 5100, services: 3200 },
    { period: 'Semaine 24 (En cours)', carburant: 24500, boutique: 3350, services: 1540 },
  ];

  const yearlyTrends = [
    { year: '2022', carburant: 1100000, boutique: 150000, services: 65000 },
    { year: '2023', carburant: 1250000, boutique: 185000, services: 82000 },
    { year: '2024', carburant: 1420000, boutique: 210000, services: 98000 },
    { year: '2025', carburant: 1680000, boutique: 270000, services: 148000 },
  ];

  // Dynamic selector values depending on selected period
  const activeChartData = 
    reportPeriod === 'weekly' ? weeklyTrends.map(item => ({ name: item.period, carburant: item.carburant, boutique: item.boutique, services: item.services, total: item.carburant + item.boutique + item.services })) :
    reportPeriod === 'yearly' ? yearlyTrends.map(item => ({ name: item.year, carburant: item.carburant, boutique: item.boutique, services: item.services, total: item.carburant + item.boutique + item.services })) :
    reportPeriod === 'daily' ? RECENT_HISTORY.map(item => ({ name: item.date, total: item.totalSales, margin: item.profit })).reverse() :
    MONTHLY_TRENDS.map(item => ({ name: item.month, carburant: item.carburant, boutique: item.boutique, services: item.services, total: item.carburant + item.boutique + item.services }));

  // Financial summary numbers based on current model outputs
  const summaryRevenueTotal = activeChartData.reduce((acc: number, item: any) => acc + (item.total || 0), 0);
  const summaryFuelShare = activeChartData.reduce((acc: number, item: any) => acc + (item.carburant || 0), 0);
  const summaryShopShare = activeChartData.reduce((acc: number, item: any) => acc + (item.boutique || 0), 0);
  const summaryServicesShare = activeChartData.reduce((acc: number, item: any) => acc + (item.services || 0), 0);
  
  const estimatedCostOfSales = summaryFuelShare * 0.74 + summaryShopShare * 0.55 + summaryServicesShare * 0.20;
  const estimatedSummaryMargin = summaryRevenueTotal - estimatedCostOfSales;

  return (
    <div className="space-y-6" id="reports-view-root font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Statistiques & Rapports Avancés</h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">Analyses consolidées de rentabilité, évolution du chiffre d'affaires et volumes de carburants.</p>
        </div>

        {/* Time controllers */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-205 shrink-0 self-start sm:self-center">
          <button 
            type="button" 
            onClick={() => setReportPeriod('daily')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md ${reportPeriod === 'daily' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Quotidien
          </button>
          <button 
            type="button" 
            onClick={() => setReportPeriod('weekly')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md ${reportPeriod === 'weekly' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Hebdo
          </button>
          <button 
            type="button" 
            onClick={() => setReportPeriod('monthly')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md ${reportPeriod === 'monthly' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Mensuel
          </button>
          <button 
            type="button" 
            onClick={() => setReportPeriod('yearly')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md ${reportPeriod === 'yearly' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Annuel
          </button>
        </div>
      </div>

      {/* Numerical summary indicators widget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="reports-kpis">
        <div className="bg-white p-5 rounded-xl border border-slate-203 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Chiffre d'Affaires cumulé</span>
          <span className="text-2xl font-extrabold font-mono text-slate-950">{summaryRevenueTotal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA</span>
          <p className="text-[10px] text-slate-500 mt-2">Période concernée : {reportPeriod === 'daily' ? '5 derniers jours' : reportPeriod === 'weekly' ? '4 dernières semaines' : reportPeriod === 'yearly' ? 'Historique 4 ans' : 'Semestre en cours'}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-203 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Marge Brute Global Estimée</span>
          <span className="text-2xl font-extrabold font-mono text-emerald-705 text-emerald-700">+{estimatedSummaryMargin.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA</span>
          <p className="text-[10px] text-emerald-600/80 font-bold mt-2">Marge moyenne de +{((estimatedSummaryMargin / (summaryRevenueTotal || 1)) * 100).toFixed(1)}%</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-203 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Part des Ventes Carburants</span>
          <span className="text-2xl font-extrabold font-mono text-blue-650">{summaryFuelShare > 0 ? ((summaryFuelShare / summaryRevenueTotal) * 100).toFixed(0) : '85'}%</span>
          <p className="text-[10px] text-slate-500 mt-2">Le carburant reste l'activité dominante d'attraction</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="reports-charts font-sans">
        
        {/* CHART 1: Evolution CA */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Évolution du Chiffre d'Affaires</h3>
            <p className="text-xs text-slate-500 font-sans">Visualisation de la croissance des ventes par secteur d'activité</p>
          </div>

          <div className="h-[280px] w-full" id="rep-ca-chart-container">
            {reportPeriod === 'daily' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData as any[]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }} />
                  <Area type="monotone" dataKey="total" name="CA Journalier (FCFA)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeChartData as any[]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }} />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} style={{ fontSize: '11px' }} />
                  <Bar dataKey="carburant" name="Carburants (FCFA)" stackId="a" fill="#3b82f6" barSize={35} />
                  <Bar dataKey="boutique" name="Boutique (FCFA)" stackId="a" fill="#f97316" />
                  <Bar dataKey="services" name="Services (FCFA)" stackId="a" fill="#14b8a6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 2: Consommation carburant / Distribution volumes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Volume Distribution Carburant estimé</h3>
            <p className="text-xs text-slate-500 font-sans">Répartition du volume liquide distribué en litres</p>
          </div>

          <div className="h-[280px] w-full" id="rep-conso-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              {reportPeriod === 'daily' ? (
                // Linear representation of profit margins for daily review
                <LineChart data={activeChartData as any[]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }} />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} />
                  <Line type="monotone" dataKey="margin" name="Bénéfice Réalisé (FCFA)" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </LineChart>
              ) : (
                <AreaChart data={activeChartData as any[]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colFuel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }} />
                  <Area type="monotone" dataKey="carburant" name="Volume Carburants vendus (Litres)" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colFuel)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Period summary tabular rows */}
      <div className="bg-white rounded-xl border border-slate-205 p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Tableau Consolidé des Performances</h3>

        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-sans">
                <th className="p-3">Référence d'exercice</th>
                <th className="p-3 text-right">Carburants vendus</th>
                <th className="p-3 text-right">Revenus Boutique</th>
                <th className="p-3 text-right">Services Annexes</th>
                <th className="p-3 text-right font-bold text-slate-950">Chiffre d'Affaires Brut</th>
                <th className="p-3 text-right font-bold text-emerald-800">Marge estimée (+/-)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {reportPeriod === 'weekly' ? (
                weeklyTrends.map(w => {
                  const tot = w.carburant + w.boutique + w.services;
                  const estimatedMargin = w.carburant * 0.25 + w.boutique * 0.45 + w.services * 0.80;
                  return (
                    <tr key={w.period} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900 font-sans">{w.period}</td>
                      <td className="p-3 text-right">{w.carburant.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right">{w.boutique.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right">{w.services.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-bold text-slate-950">{tot.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-bold text-emerald-700 bg-emerald-50/20">+{estimatedMargin.toLocaleString()} FCFA</td>
                    </tr>
                  );
                })
              ) : reportPeriod === 'yearly' ? (
                yearlyTrends.map(y => {
                  const tot = y.carburant + y.boutique + y.services;
                  const estimatedMargin = y.carburant * 0.25 + y.boutique * 0.45 + y.services * 0.80;
                  return (
                    <tr key={y.year} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900 font-sans">Exercice {y.year}</td>
                      <td className="p-3 text-right">{y.carburant.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right">{y.boutique.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right">{y.services.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-bold text-slate-950">{tot.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-bold text-emerald-700 bg-emerald-50/20">+{estimatedMargin.toLocaleString()} FCFA</td>
                    </tr>
                  );
                })
              ) : (
                MONTHLY_TRENDS.map(m => {
                  const tot = m.carburant + m.boutique + m.services;
                  const estimatedMargin = m.carburant * 0.25 + m.boutique * 0.45 + m.services * 0.80;
                  return (
                    <tr key={m.month} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900 font-sans font-sans">Mois de {m.month} 2026</td>
                      <td className="p-3 text-right">{m.carburant.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right">{m.boutique.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right">{m.services.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-bold text-slate-950">{tot.toLocaleString()} FCFA</td>
                      <td className="p-3 text-right font-bold text-emerald-700 bg-emerald-50/20">+{estimatedMargin.toLocaleString()} FCFA</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
