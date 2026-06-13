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

// Standard rates of margins or pricing to make math dynamic
export const FUEL_PRICES: Record<string, { buy: number; sell: number }> = {
  'Super': { buy: 1.35, sell: 1.84 },
  'Sans plomb': { buy: 1.30, sell: 1.79 },
  'Gasoil': { buy: 1.25, sell: 1.68 },
  'Pétrole': { buy: 0.95, sell: 1.30 },
  'Gaz': { buy: 8.50, sell: 12.00 }, // Per unit/bottle
  'Lubrifiants': { buy: 12.00, sell: 19.50 }, // Per Liter/Can
};

export const INITIAL_FUEL_STOCKS: FuelStock[] = [
  { id: 'f1', product: 'Super', initialStock: 8000, inputs: 5000, outputs: 4200, theoreticalStock: 8800, realStock: 8750, gap: -50, lastUpdated: '2026-06-11' },
  { id: 'f2', product: 'Sans plomb', initialStock: 11000, inputs: 6000, outputs: 5100, theoreticalStock: 11900, realStock: 11880, gap: -20, lastUpdated: '2026-06-11' },
  { id: 'f3', product: 'Gasoil', initialStock: 15000, inputs: 10000, outputs: 8400, theoreticalStock: 16600, realStock: 16615, gap: 15, lastUpdated: '2026-06-11' },
  { id: 'f4', product: 'Pétrole', initialStock: 2500, inputs: 0, outputs: 850, theoreticalStock: 1650, realStock: 1650, gap: 0, lastUpdated: '2026-06-11' },
  { id: 'f5', product: 'Gaz', initialStock: 120, inputs: 50, outputs: 32, theoreticalStock: 138, realStock: 140, gap: 2, lastUpdated: '2026-06-11' },
  { id: 'f6', product: 'Lubrifiants', initialStock: 350, inputs: 80, outputs: 45, theoreticalStock: 385, realStock: 382, gap: -3, lastUpdated: '2026-06-11' },
];

export const INITIAL_PUMPS: Pump[] = [
  { id: 'p1', name: 'Pompe 1', fuelType: 'Super', nozzlesCount: 2, startIndex: 152000, endIndex: 152850, volumeSold: 850, lastUpdated: '2026-06-11' },
  { id: 'p2', name: 'Pompe 2', fuelType: 'Sans plomb', nozzlesCount: 2, startIndex: 98400, endIndex: 99120, volumeSold: 720, lastUpdated: '2026-06-11' },
  { id: 'p3', name: 'Pompe 3', fuelType: 'Gasoil', nozzlesCount: 4, startIndex: 320400, endIndex: 321850, volumeSold: 1450, lastUpdated: '2026-06-11' },
  { id: 'p4', name: 'Pompe 4', fuelType: 'Gasoil', nozzlesCount: 4, startIndex: 210500, endIndex: 211600, volumeSold: 1100, lastUpdated: '2026-06-11' },
  { id: 'p5', name: 'Pompe 5', fuelType: 'Super', nozzlesCount: 2, startIndex: 440100, endIndex: 440920, volumeSold: 820, lastUpdated: '2026-06-11' },
  { id: 'p6', name: 'Pompe 6', fuelType: 'Pétrole', nozzlesCount: 1, startIndex: 12000, endIndex: 12180, volumeSold: 180, lastUpdated: '2026-06-11' },
];

export const INITIAL_TANKS: Tank[] = [
  { id: 't1', name: 'Cuve Super 1', fuelType: 'Super', capacity: 20000, initialStock: 12000, deliveries: 5000, sales: 4200, theoreticalStock: 12800, realDipstickStock: 12750, lossDetected: -50, lastUpdated: '2026-06-11' },
  { id: 't2', name: 'Cuve Sans Plomb 1', fuelType: 'Sans plomb', capacity: 25000, initialStock: 15000, deliveries: 6000, sales: 5100, theoreticalStock: 15900, realDipstickStock: 15880, lossDetected: -20, lastUpdated: '2026-06-11' },
  { id: 't3', name: 'Cuve Gasoil 1', fuelType: 'Gasoil', capacity: 30000, initialStock: 18000, deliveries: 10000, sales: 8400, theoreticalStock: 19600, realDipstickStock: 19550, lossDetected: -50, lastUpdated: '2026-06-11' },
  { id: 't4', name: 'Cuve Pétrole 1', fuelType: 'Pétrole', capacity: 10000, initialStock: 5000, deliveries: 0, sales: 850, theoreticalStock: 4150, realDipstickStock: 4150, lossDetected: 0, lastUpdated: '2026-06-11' },
];

export const INITIAL_DELIVERIES: Delivery[] = [
  { 
    id: 'd1', 
    supplier: 'TotalEnergies Pro', 
    date: '2026-06-10', 
    product: 'Sans plomb', 
    quantity: 6000, 
    purchasePricePerLiter: 1.30, 
    totalAmount: 7800, 
    invoiceNumber: 'BL-985A-62', 
    status: 'Reçu',
    attachmentName: 'bon_livraison_sp_985.pdf'
  },
  { 
    id: 'd2', 
    supplier: 'Shell Distribution', 
    date: '2026-06-11', 
    product: 'Gasoil', 
    quantity: 10000, 
    purchasePricePerLiter: 1.25, 
    totalAmount: 12500, 
    invoiceNumber: 'FAC-742-G', 
    status: 'Reçu',
    attachmentName: 'facture_gasoil_742.pdf'
  },
  { 
    id: 'd3', 
    supplier: 'Oilibya Wholesale', 
    date: '2026-06-13', 
    product: 'Super', 
    quantity: 8000, 
    purchasePricePerLiter: 1.35, 
    totalAmount: 10800, 
    invoiceNumber: 'PREV-5561', 
    status: 'Planifié'
  }
];

export const INITIAL_SHOP_PRODUCTS: ShopProduct[] = [
  { id: 'sp1', name: 'Eau Minérale 1.5L (Pack)', category: 'Eau', stock: 120, minStock: 20, purchasePrice: 1.50, sellingPrice: 2.80, salesCount: 35, totalRevenue: 98.00 },
  { id: 'sp2', name: 'Coca-Cola Canette 33cl', category: 'Boissons', stock: 450, minStock: 50, purchasePrice: 0.35, sellingPrice: 0.85, salesCount: 140, totalRevenue: 119.00 },
  { id: 'sp3', name: 'Biscuits Belvita 50g', category: 'Biscuits', stock: 80, minStock: 15, purchasePrice: 0.40, sellingPrice: 0.90, salesCount: 24, totalRevenue: 21.60 },
  { id: 'sp4', name: 'Liquide de Frein 500ml', category: 'Accessoires Auto', stock: 15, minStock: 5, purchasePrice: 3.20, sellingPrice: 6.50, salesCount: 4, totalRevenue: 26.00 },
  { id: 'sp5', name: 'Huile Moteur 15W40 5L X-Trend', category: 'Huiles', stock: 40, minStock: 8, purchasePrice: 18.00, sellingPrice: 32.00, salesCount: 12, totalRevenue: 384.00 },
  { id: 'sp6', name: 'Batterie Automobile 12V 70Ah', category: 'Batteries', stock: 11, minStock: 3, purchasePrice: 42.00, sellingPrice: 79.00, salesCount: 3, totalRevenue: 237.00 },
  { id: 'sp7', name: 'Boisson énergisante Monster', category: 'Boissons', stock: 12, minStock: 25, purchasePrice: 1.10, sellingPrice: 2.50, salesCount: 78, totalRevenue: 195.00 }, // Under stock alarm
];

export const INITIAL_SHOP_SALES: ShopSale[] = [
  { id: 'ss1', productId: 'sp2', productName: 'Coca-Cola Canette 33cl', quantity: 2, price: 0.85, total: 1.70, date: '2026-06-11T10:15:00Z' },
  { id: 'ss2', productId: 'sp5', productName: 'Huile Moteur 15W40 5L X-Trend', quantity: 1, price: 32.00, total: 32.00, date: '2026-06-11T11:45:00Z' },
  { id: 'ss3', productId: 'sp1', productName: 'Eau Minérale 1.5L (Pack)', quantity: 4, price: 2.80, total: 11.20, date: '2026-06-11T12:05:00Z' },
];

export const INITIAL_CAR_WASH_RECORDS: CarWashRecord[] = [
  { id: 'cw1', date: '2026-06-11', vehicleType: 'Citadine', washType: 'Complet', quantity: 8, pricePerWash: 15, revenue: 120 },
  { id: 'cw2', date: '2026-06-11', vehicleType: 'SUV/Berline', washType: 'Premium', quantity: 5, pricePerWash: 25, revenue: 125 },
  { id: 'cw3', date: '2026-06-11', vehicleType: 'Moto', washType: 'Simple', quantity: 12, pricePerWash: 5, revenue: 60 },
  { id: 'cw4', date: '2026-06-10', vehicleType: 'Citadine', washType: 'Simple', quantity: 9, pricePerWash: 10, revenue: 90 },
];

export const INITIAL_OIL_CHANGE_RECORDS: OilChangeRecord[] = [
  { id: 'oc1', date: '2026-06-11', vehiclePlate: 'DK-2354-AF', oilBrand: 'Castrol GTX 10W40', oilLiterUsed: 4.5, oilCost: 15, filterCost: 8, laborCost: 10, totalCost: 23, chargedPrice: 55, margin: 32 },
  { id: 'oc2', date: '2026-06-11', vehiclePlate: 'LT-8812-Y', oilBrand: 'Shell Helix Ultra 5W30', oilLiterUsed: 5.0, oilCost: 35, filterCost: 12, laborCost: 15, totalCost: 47, chargedPrice: 90, margin: 43 },
  { id: 'oc3', date: '2026-06-10', vehiclePlate: 'RC-103-ZZ', oilBrand: 'Total Quartz 5000', oilLiterUsed: 4.0, oilCost: 12, filterCost: 6, laborCost: 10, totalCost: 18, chargedPrice: 45, margin: 27 },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp1', name: 'Jean-Marc Koffi', role: 'Gérant', isPresent: true, performanceScore: 96, commissionRate: 0, baseSalary: 1500, commissionsAccumulated: 0, lastActive: '2026-06-11' },
  { id: 'emp2', name: 'Amadou Diallo', role: 'Caissier', isPresent: true, performanceScore: 89, commissionRate: 1.5, baseSalary: 650, commissionsAccumulated: 95.50, lastActive: '2026-06-11' },
  { id: 'emp3', name: 'Sarah Kamara', role: 'Pompiste', isPresent: true, performanceScore: 94, commissionRate: 2.0, baseSalary: 550, commissionsAccumulated: 180.20, lastActive: '2026-06-11' },
  { id: 'emp4', name: 'Ousmane Sow', role: 'Pompiste', isPresent: true, performanceScore: 85, commissionRate: 2.0, baseSalary: 550, commissionsAccumulated: 145.00, lastActive: '2026-06-11' },
  { id: 'emp5', name: 'Mariama Ba', role: 'Comptable', isPresent: false, performanceScore: 90, commissionRate: 0, baseSalary: 1100, commissionsAccumulated: 0, lastActive: '2026-06-10' },
  { id: 'emp6', name: 'Koffi Paul', role: 'Opérateur Lavage', isPresent: true, performanceScore: 92, commissionRate: 3.5, baseSalary: 500, commissionsAccumulated: 85.00, lastActive: '2026-06-11' }
];

export const INITIAL_SHIFTS: Shift[] = [
  { id: 's1', name: 'Équipe Matin', startTime: '06:00', endTime: '14:00', activeEmployees: ['Amadou Diallo', 'Sarah Kamara'], cashInvoiced: 4850.50, cashReceived: 4850.50, gap: 0, status: 'Clos' },
  { id: 's2', name: 'Équipe Soir', startTime: '14:00', endTime: '22:00', activeEmployees: ['Jean-Marc Koffi', 'Ousmane Sow', 'Koffi Paul'], cashInvoiced: 3120.00, cashReceived: 3095.00, gap: -25.00, status: 'Ouvert' }
];

export const INITIAL_CASH_REGISTERS: CashRegister[] = [
  { id: 'cr1', method: 'Espèces', currentBalance: 3254.50, lastUpdated: '2026-06-11' },
  { id: 'cr2', method: 'Mobile Money', currentBalance: 2450.00, lastUpdated: '2026-06-11' },
  { id: 'cr3', method: 'Carte Bancaire', currentBalance: 4120.00, lastUpdated: '2026-06-11' },
  { id: 'cr4', method: 'Chèque', currentBalance: 850.00, lastUpdated: '2026-06-11' }
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'ex1', category: 'Carburant groupe électrogène', description: 'Gasoil de secours pour pannes d\'électricité d\'Eneo', amount: 150.00, date: '2026-06-11', requestedBy: 'Jean-Marc Koffi', approvedBy: 'Jean-Marc Koffi', status: 'Approuvé' },
  { id: 'ex2', category: 'Entretien', description: 'Nettoyage des sols de la piste après fuite', amount: 45.00, date: '2026-06-10', requestedBy: 'Sarah Kamara', approvedBy: 'Jean-Marc Koffi', status: 'Approuvé' },
  { id: 'ex3', category: 'Fournitures', description: 'Rouleaux de papier ticket de caisse thermiques x10', amount: 25.00, date: '2026-06-11', requestedBy: 'Amadou Diallo', status: 'En attente' },
  { id: 'ex4', category: 'Réparations', description: 'Soudure du portail d\'entrée de secours', amount: 180.00, date: '2026-06-11', requestedBy: 'Jean-Marc Koffi', status: 'En attente' }
];

export const INITIAL_QUALITY_TESTS: FuelQualityTest[] = [
  {
    id: 'qt1',
    date: '2026-06-11',
    fuelType: 'Super',
    tankName: 'Cuve Super 1',
    density: 0.742,
    temperature: 15.6,
    waterPresence: false,
    waterHeightMm: 0,
    nozzleAccuracyPercent: 0.08,
    isConform: true,
    operator: 'Jean-Marc Koffi',
    notes: 'Essai éprouvette de 20L impeccable. Pas de trace d\'eau.'
  },
  {
    id: 'qt2',
    date: '2026-06-11',
    fuelType: 'Gasoil',
    tankName: 'Cuve Gasoil 1',
    density: 0.835,
    temperature: 16.2,
    waterPresence: false,
    waterHeightMm: 0,
    nozzleAccuracyPercent: -0.15,
    isConform: true,
    operator: 'Jean-Marc Koffi',
    notes: 'Contrôle de densité conforme aux spécifications du terminal d\'approvisionnement.'
  },
  {
    id: 'qt3',
    date: '2026-06-10',
    fuelType: 'Sans plomb',
    tankName: 'Cuve Sans Plomb 1',
    density: 0.738,
    temperature: 15.1,
    waterPresence: false,
    waterHeightMm: 0,
    nozzleAccuracyPercent: 0.22,
    isConform: true,
    operator: 'Ousmane Sow',
    notes: 'Recherche d\'eau négative après test pâte.'
  }
];

export const INITIAL_HOURLY_SALES = [
  { time: '08:00', carburant: 850, boutique: 45, services: 10 },
  { time: '10:00', carburant: 1200, boutique: 85, services: 30 },
  { time: '12:00', carburant: 1450, boutique: 120, services: 45 },
  { time: '14:00', carburant: 1800, boutique: 90, services: 60 },
  { time: '16:00', carburant: 2100, boutique: 150, services: 40 },
  { time: '18:00', carburant: 2500, boutique: 210, services: 80 },
  { time: '20:00', carburant: 1900, boutique: 130, services: 50 },
  { time: '22:00', carburant: 950, boutique: 60, services: 20 },
];

export const RECENT_HISTORY = [
  { id: 'h1', date: '2026-06-11', totalSales: 16254.50, profit: 3410.20, gap: -25.00, status: 'En cours' },
  { id: 'h2', date: '2026-06-10', totalSales: 18450.00, profit: 4110.50, gap: -5.00, status: 'Clôturé' },
  { id: 'h3', date: '2026-06-09', totalSales: 15120.20, profit: 3105.10, gap: 12.00, status: 'Clôturé' },
  { id: 'h4', date: '2026-06-08', totalSales: 19280.00, profit: 4520.80, gap: 0.00, status: 'Clôturé' },
  { id: 'h5', date: '2026-06-07', totalSales: 17150.40, profit: 3820.50, gap: -40.00, status: 'Clôturé' },
];

export const MONTHLY_TRENDS = [
  { month: 'Jan', carburant: 125000, boutique: 18400, services: 8500 },
  { month: 'Fév', carburant: 130000, boutique: 19500, services: 9200 },
  { month: 'Mar', carburant: 145000, boutique: 22000, services: 11000 },
  { month: 'Avr', carburant: 140000, boutique: 21000, services: 10400 },
  { month: 'Mai', carburant: 155000, boutique: 24500, services: 12500 },
  { month: 'Juin', carburant: 168000, boutique: 27000, services: 14800 },
];

export const DEFAULT_JOURNAL_CONFIG: JournalConfig = {
  col1Title: "Entretien & Dépenses",
  col2Title: "Dépôts & Avance",
  col3Title: "Gazole / Carburant",
  col4Title: "Autres / Péages"
};

export const INITIAL_JOURNAL_RECORDS: JournalRecord[] = [
  {
    id: 'jr1',
    date: '2026-06-11',
    camionNo: 'LT 1928 A',
    chauffeur: 'Jean-Marc Koffi',
    col1Pos: 125000,
    col1Neg: 15000,
    col2Pos: 400000,
    col2Neg: 50000,
    col3Pos: 180000,
    col3Neg: 0,
    col4Pos: 25000,
    col4Neg: 5000,
    destination: 'Douala - Yaoundé'
  },
  {
    id: 'jr2',
    date: '2026-06-12',
    camionNo: 'OU 4421 B',
    chauffeur: 'Ousmane Sow',
    col1Pos: 45000,
    col1Neg: 0,
    col2Pos: 350000,
    col2Neg: 30000,
    col3Pos: 150000,
    col3Neg: 15000,
    col4Pos: 12000,
    col4Neg: 2000,
    destination: 'Kribi - Douala'
  },
  {
    id: 'jr3',
    date: '2026-06-13',
    camionNo: 'LT 0588 C',
    chauffeur: 'Koffi Paul',
    col1Pos: 0,
    col1Neg: 35000,
    col2Pos: 250000,
    col2Neg: 0,
    col3Pos: 220000,
    col3Neg: 0,
    col4Pos: 30000,
    col4Neg: 8000,
    destination: 'Bafoussam - Douala'
  }
];

export const INITIAL_CLIENT_ACCOUNTS: ClientAccount[] = [
  {
    id: 'cli1',
    companyName: 'Trans-Est Cameroun S.A.',
    contactName: 'M. Ndongo Dieudonné',
    phoneNumber: '+237 699 88 77 66',
    creditLimit: 5000000,
    totalCreditDetails: 1450000,
    lastOperationDate: '2026-06-12'
  },
  {
    id: 'cli2',
    companyName: 'Société Forestière du Littoral',
    contactName: 'Mme. Biya Marthe',
    phoneNumber: '+237 677 55 44 33',
    creditLimit: 10000000,
    totalCreditDetails: 3200000,
    lastOperationDate: '2026-06-13'
  },
  {
    id: 'cli3',
    companyName: 'Boulangerie Centrale de Douala',
    contactName: 'M. Tagne Samuel',
    phoneNumber: '+237 655 22 11 00',
    creditLimit: 3000000,
    totalCreditDetails: 450000,
    lastOperationDate: '2026-06-10'
  }
];

export const INITIAL_CREDIT_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'ctx1',
    clientId: 'cli1',
    date: '2026-06-11',
    type: 'Achat Crédit',
    amount: 650000,
    fuelType: 'Gasoil',
    volumeLiters: 1000,
    couponNumber: 'BON-TEC-0092',
    driverName: 'Kamdem Lucas',
    plates: 'LT 8892 B',
    notes: 'Ravitaillement tracteur lourd direction Yaoundé'
  },
  {
    id: 'ctx2',
    clientId: 'cli2',
    date: '2026-06-12',
    type: 'Achat Crédit',
    amount: 1200000,
    fuelType: 'Gasoil',
    volumeLiters: 1800,
    couponNumber: 'BON-SFL-452',
    driverName: 'Amadou Ibrahim',
    plates: 'OU 0233 A',
    notes: 'Approvisionnement grumier voyage de Kribi'
  },
  {
    id: 'ctx3',
    clientId: 'cli1',
    date: '2026-06-12',
    type: 'Règlement / Paiement',
    amount: 400000,
    paymentMethod: 'Virement',
    notes: 'Règlement partiel factures mai par virement Afriland'
  },
  {
    id: 'ctx4',
    clientId: 'cli3',
    date: '2026-06-10',
    type: 'Achat Crédit',
    amount: 450000,
    fuelType: 'Super',
    volumeLiters: 600,
    couponNumber: 'BON-BCD-012',
    driverName: 'Fouda Pierre',
    plates: 'LT 1234 A',
    notes: 'Ravitaillement camionnette de livraison'
  }
];

export const INITIAL_MAINTENANCE_INCIDENTS: MaintenanceIncident[] = [
  {
    id: 'm1',
    deviceName: 'Pompe N°2 - Volucompteur Gazole',
    category: 'Pompes & Pistolets',
    reportedDate: '2026-06-10',
    description: 'Baisse de pression anormale et débit très lent sur le pistolet B.',
    status: 'En cours de réparation',
    priority: 'Élevée',
    technicianName: 'Ets Lucien & Fils Hydraulique',
    cost: 75000,
    notes: 'Changement de filtre interne et test de calage prévu ce soir.'
  },
  {
    id: 'm2',
    deviceName: 'Groupe Électrogène Caterpillar 150kVA',
    category: 'Électricité & Groupe',
    reportedDate: '2026-06-05',
    resolvedDate: '2026-06-06',
    description: 'Vidange complète périodique, changement filtre à huile et filtre à gazole.',
    status: 'Résolu',
    priority: 'Critique',
    technicianName: 'Cameroun Énergie Service',
    cost: 180000,
    notes: 'Opération effectuée avec succès. Autonomie opérationnelle garantie pour les coupures de la société d\'électricité.'
  },
  {
    id: 'm3',
    deviceName: 'Extincteurs CO2 50kg (Ilot Central)',
    category: 'Sécurité & Incendie',
    reportedDate: '2026-06-12',
    description: 'Recharge annuelle réglementaire et contrôle de pression des 4 extincteurs lourds mobiles.',
    status: 'Planifié/Maintenance',
    priority: 'Élevée',
    technicianName: 'Securifix Cameroun',
    cost: 120000,
    notes: 'Rendez-vous programmée pour le 18 juin. Conforme aux assurances.'
  },
  {
    id: 'm4',
    deviceName: 'Caméra d\'Angle Entrée Boutique',
    category: 'Informatique & Caméras',
    reportedDate: '2026-06-13',
    description: 'Perte de signal vidéo intermittent sur le moniteur de surveillance principal.',
    status: 'Signalé',
    priority: 'Moyenne',
    cost: 0,
    notes: 'Vérifier le câble RJ45 POE au niveau du switch de bureau.'
  }
];


