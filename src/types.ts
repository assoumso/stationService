/**
 * Types representing the data models for Station Manager Pro.
 */

// Fuel types
export type FuelType = 'Super' | 'Sans plomb' | 'Gasoil' | 'Pétrole' | 'Gaz' | 'Lubrifiants';

export interface FuelStock {
  id: string;
  product: FuelType;
  initialStock: number; // in Liters / Units
  inputs: number; // deliveries
  outputs: number; // pump sales / direct sales
  theoreticalStock: number; // initialStock + inputs - outputs
  realStock: number; // physical dip-stick measure
  gap: number; // realStock - theoreticalStock
  lastUpdated: string;
}

// Pumps configuration & daily index tracking
export interface Pump {
  id: string;
  name: string; // e.g. P1, P2
  fuelType: FuelType;
  nozzlesCount: number;
  startIndex: number; // Index début
  endIndex: number; // Index fin
  volumeSold: number; // Calculated: endIndex - startIndex
  lastUpdated: string;
}

// Tanks (Cuves)
export interface Tank {
  id: string;
  name: string; // e.g. Cuve 1 (Super)
  fuelType: FuelType;
  capacity: number; // in Liters
  initialStock: number;
  deliveries: number;
  sales: number;
  theoreticalStock: number; // initialStock + deliveries - sales
  realDipstickStock: number; // Physical measurement in Liters
  lossDetected: number; // theoreticalStock - realDipstickStock
  lastUpdated: string;
}

// Fuel Deliveries (Livraisons)
export interface Delivery {
  id: string;
  supplier: string;
  date: string;
  product: FuelType;
  quantity: number; // in Liters
  purchasePricePerLiter: number;
  totalAmount: number;
  invoiceNumber: string;
  status: 'Reçu' | 'En transit' | 'Planifié';
  attachmentName?: string;
  attachmentUrl?: string; // Simulated link/base64
}

// Shop products (Boutique)
export type ShopCategory = 'Eau' | 'Boissons' | 'Biscuits' | 'Accessoires Auto' | 'Huiles' | 'Batteries';

export interface ShopProduct {
  id: string;
  name: string;
  category: ShopCategory;
  stock: number;
  minStock: number; // for stock alerts
  purchasePrice: number;
  sellingPrice: number;
  salesCount: number;
  totalRevenue: number;
}

// Shop sale transactions
export interface ShopSale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
}

// Car Wash Service (Lavage Auto)
export interface CarWashRecord {
  id: string;
  date: string;
  vehicleType: 'Moto' | 'Citadine' | 'SUV/Berline' | 'Utilitaire';
  washType: 'Simple' | 'Complet' | 'Premium';
  quantity: number;
  pricePerWash: number;
  revenue: number;
}

// Oil Change Service (Vidange)
export interface OilChangeRecord {
  id: string;
  date: string;
  vehiclePlate: string;
  oilBrand: string;
  oilLiterUsed: number;
  oilCost: number;
  filterCost: number;
  laborCost: number;
  totalCost: number; // cost of items (for margin calculation)
  chargedPrice: number; // what customer paid
  margin: number; // chargedPrice - totalCost
}

// Employees
export type EmployeeRole = 'Gérant' | 'Caissier' | 'Pompiste' | 'Comptable' | 'Opérateur Lavage';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  isPresent: boolean;
  performanceScore: number; // 0 to 100
  commissionRate: number; // percentage
  baseSalary: number; // Monthly base salary
  commissionsAccumulated: number; // accumulated this month
  lastActive: string;
}

// Shifts / Teams (Équipes)
export interface Shift {
  id: string;
  name: 'Équipe Matin' | 'Équipe Soir';
  startTime: string; // e.g. "06:00"
  endTime: string; // e.g. "14:00"
  activeEmployees: string[]; // employee names / IDs
  cashInvoiced: number; // Montant théorique à encaisser
  cashReceived: number; // Montant effectivement versé
  gap: number; // cashReceived - cashInvoiced
  status: 'Ouvert' | 'Clos';
}

// Cash registers / Payment methods (Gestion de Caisse)
export interface CashRegister {
  id: string;
  method: 'Espèces' | 'Mobile Money' | 'Carte Bancaire' | 'Chèque';
  currentBalance: number;
  lastUpdated: string;
}

// Expenses (Dépenses)
export type ExpenseCategory = 'Carburant groupe électrogène' | 'Transport' | 'Entretien' | 'Réparations' | 'Fournitures' | 'Autres';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'En attente' | 'Approuvé' | 'Rejeté';
}

// Daily closure report
export interface DailyReport {
  id: string;
  date: string;
  fuelRevenue: number;
  shopRevenue: number;
  carWashRevenue: number;
  oilChangeRevenue: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  mobileMoneyCollected: number;
  cashCollected: number;
  cardCollected: number;
  chequeCollected: number;
  fuelGapsLiters: Record<FuelType, number>;
  status: 'En cours' | 'Clôturé';
}

// Contrôles Qualité, Densité, Recherche d'eau & Calibrage éprouvette
export interface FuelQualityTest {
  id: string;
  date: string;
  fuelType: FuelType;
  tankName: string; // e.g. "Cuve 1 (Super)" or "Cuve 3 (Gasoil)"
  density: number; // e.g. 0.832 g/cm3 (standard)
  temperature: number; // e.g. 15.4 °C
  waterPresence: boolean; // detected with search paste
  waterHeightMm: number; // e.g. 0 mm (conform)
  nozzleAccuracyPercent: number; // meter error margin deviation% (e.g. +0.1%, limit is usually +/-0.5%)
  isConform: boolean;
  operator: string;
  notes?: string;
}

