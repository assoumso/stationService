import { 
  FuelStock, 
  Pump, 
  Tank, 
  Delivery, 
  ShopProduct, 
  ShopSale, 
  CarWashRecord, 
  OilChangeRecord, 
  Employee, 
  Shift, 
  CashRegister, 
  Expense, 
  DailyReport,
  FuelQualityTest,
  JournalRecord,
  JournalConfig,
  ClientAccount,
  CreditTransaction,
  MaintenanceIncident
} from './types';

// ─────────────────────────────────────────────────────────────
// PRIX PAR DÉFAUT — à configurer dans Paramètres Prix
// ─────────────────────────────────────────────────────────────
export const FUEL_PRICES: Record<string, { buy: number; sell: number }> = {
  'Super':      { buy: 0, sell: 0 },
  'Sans plomb': { buy: 0, sell: 0 },
  'Gasoil':     { buy: 0, sell: 0 },
  'Pétrole':    { buy: 0, sell: 0 },
  'Gaz':        { buy: 0, sell: 0 },
  'Lubrifiants':{ buy: 0, sell: 0 },
};

// ─────────────────────────────────────────────────────────────
// DONNÉES INITIALES VIDES — l'application démarre sans données fictives
// ─────────────────────────────────────────────────────────────

export const INITIAL_FUEL_STOCKS: FuelStock[]           = [];
export const INITIAL_PUMPS: Pump[]                       = [];
export const INITIAL_TANKS: Tank[]                       = [];
export const INITIAL_DELIVERIES: Delivery[]              = [];
export const INITIAL_SHOP_PRODUCTS: ShopProduct[]        = [];
export const INITIAL_SHOP_SALES: ShopSale[]              = [];
export const INITIAL_CAR_WASH_RECORDS: CarWashRecord[]   = [];
export const INITIAL_OIL_CHANGE_RECORDS: OilChangeRecord[]= [];
export const INITIAL_EMPLOYEES: Employee[]               = [];
export const INITIAL_SHIFTS: Shift[]                     = [];
export const INITIAL_CASH_REGISTERS: CashRegister[]      = [];
export const INITIAL_EXPENSES: Expense[]                 = [];
export const INITIAL_QUALITY_TESTS: FuelQualityTest[]    = [];
export const INITIAL_JOURNAL_RECORDS: JournalRecord[]    = [];
export const INITIAL_CLIENT_ACCOUNTS: ClientAccount[]    = [];
export const INITIAL_CREDIT_TRANSACTIONS: CreditTransaction[] = [];
export const INITIAL_MAINTENANCE_INCIDENTS: MaintenanceIncident[] = [];

// ─────────────────────────────────────────────────────────────
// CONFIG JOURNAL PAR DÉFAUT (titres des colonnes)
// ─────────────────────────────────────────────────────────────
export const DEFAULT_JOURNAL_CONFIG: JournalConfig = {
  col1Title: "Entretien & Dépenses",
  col2Title: "Dépôts & Avance",
  col3Title: "Gazole / Carburant",
  col4Title: "Autres / Péages"
};

// ─────────────────────────────────────────────────────────────
// DONNÉES GRAPHIQUES (UI uniquement — non liées à Supabase)
// ─────────────────────────────────────────────────────────────
export const INITIAL_HOURLY_SALES = [
  { time: '08:00', carburant: 0, boutique: 0, services: 0 },
  { time: '10:00', carburant: 0, boutique: 0, services: 0 },
  { time: '12:00', carburant: 0, boutique: 0, services: 0 },
  { time: '14:00', carburant: 0, boutique: 0, services: 0 },
  { time: '16:00', carburant: 0, boutique: 0, services: 0 },
  { time: '18:00', carburant: 0, boutique: 0, services: 0 },
  { time: '20:00', carburant: 0, boutique: 0, services: 0 },
  { time: '22:00', carburant: 0, boutique: 0, services: 0 },
];

export const RECENT_HISTORY: { id: string; date: string; totalSales: number; profit: number; gap: number; status: string }[] = [];

export const MONTHLY_TRENDS: { month: string; carburant: number; boutique: number; services: number }[] = [];
