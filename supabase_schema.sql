-- ============================================================
-- STATIONPRO - Schéma SQL complet pour Supabase
-- Généré automatiquement depuis src/types.ts
-- Exécutez ce script dans : Supabase > SQL Editor > New Query
-- ============================================================

-- 1. TABLE DE STOCKAGE GLOBAL (clé-valeur JSON - architecture actuelle)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS station_store (
  id TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STOCKS DE CARBURANT (FuelStock)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fuel_stocks (
  id TEXT PRIMARY KEY,
  product TEXT NOT NULL CHECK (product IN ('Super','Sans plomb','Gasoil','Pétrole','Gaz','Lubrifiants')),
  initial_stock NUMERIC(12,2) DEFAULT 0,
  inputs NUMERIC(12,2) DEFAULT 0,
  outputs NUMERIC(12,2) DEFAULT 0,
  theoretical_stock NUMERIC(12,2) DEFAULT 0,
  real_stock NUMERIC(12,2) DEFAULT 0,
  gap NUMERIC(12,2) DEFAULT 0,
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. POMPES (Pump)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pumps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Super','Sans plomb','Gasoil','Pétrole','Gaz','Lubrifiants')),
  nozzles_count INT DEFAULT 2,
  start_index NUMERIC(14,2) DEFAULT 0,
  end_index NUMERIC(14,2) DEFAULT 0,
  volume_sold NUMERIC(12,2) DEFAULT 0,
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUVES (Tank)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tanks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Super','Sans plomb','Gasoil','Pétrole','Gaz','Lubrifiants')),
  capacity NUMERIC(12,2) DEFAULT 0,
  initial_stock NUMERIC(12,2) DEFAULT 0,
  deliveries NUMERIC(12,2) DEFAULT 0,
  sales NUMERIC(12,2) DEFAULT 0,
  theoretical_stock NUMERIC(12,2) DEFAULT 0,
  real_dipstick_stock NUMERIC(12,2) DEFAULT 0,
  loss_detected NUMERIC(12,2) DEFAULT 0,
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LIVRAISONS (Delivery)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deliveries (
  id TEXT PRIMARY KEY,
  supplier TEXT NOT NULL,
  date DATE NOT NULL,
  product TEXT NOT NULL CHECK (product IN ('Super','Sans plomb','Gasoil','Pétrole','Gaz','Lubrifiants')),
  quantity NUMERIC(12,2) DEFAULT 0,
  purchase_price_per_liter NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(14,2) DEFAULT 0,
  invoice_number TEXT DEFAULT 'N/A',
  status TEXT DEFAULT 'Reçu' CHECK (status IN ('Reçu','En transit','Planifié')),
  attachment_name TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUITS BOUTIQUE (ShopProduct)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shop_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Eau','Boissons','Biscuits','Accessoires Auto','Huiles','Batteries')),
  stock INT DEFAULT 0,
  min_stock INT DEFAULT 0,
  purchase_price NUMERIC(10,2) DEFAULT 0,
  selling_price NUMERIC(10,2) DEFAULT 0,
  sales_count INT DEFAULT 0,
  total_revenue NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VENTES BOUTIQUE (ShopSale)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shop_sales (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES shop_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT DEFAULT 1,
  price NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(14,2) DEFAULT 0,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LAVAGES AUTO (CarWashRecord)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS car_wash_records (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('Moto','Citadine','SUV/Berline','Utilitaire')),
  wash_type TEXT NOT NULL CHECK (wash_type IN ('Simple','Complet','Premium')),
  quantity INT DEFAULT 1,
  price_per_wash NUMERIC(10,2) DEFAULT 0,
  revenue NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'Espèces',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. VIDANGES (OilChangeRecord)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS oil_change_records (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  vehicle_plate TEXT NOT NULL,
  oil_brand TEXT NOT NULL,
  oil_liter_used NUMERIC(6,2) DEFAULT 0,
  oil_cost NUMERIC(10,2) DEFAULT 0,
  filter_cost NUMERIC(10,2) DEFAULT 0,
  labor_cost NUMERIC(10,2) DEFAULT 0,
  total_cost NUMERIC(12,2) DEFAULT 0,
  charged_price NUMERIC(12,2) DEFAULT 0,
  margin NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'Espèces',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EMPLOYÉS (Employee)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Gérant','Caissier','Pompiste','Comptable','Opérateur Lavage')),
  is_present BOOLEAN DEFAULT TRUE,
  performance_score NUMERIC(5,2) DEFAULT 0,
  commission_rate NUMERIC(5,2) DEFAULT 0,
  base_salary NUMERIC(12,2) DEFAULT 0,
  commissions_accumulated NUMERIC(12,2) DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ÉQUIPES / SHIFTS (Shift)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (name IN ('Équipe Matin','Équipe Soir')),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  active_employees JSONB DEFAULT '[]',
  cash_invoiced NUMERIC(14,2) DEFAULT 0,
  cash_received NUMERIC(14,2) DEFAULT 0,
  gap NUMERIC(14,2) DEFAULT 0,
  status TEXT DEFAULT 'Ouvert' CHECK (status IN ('Ouvert','Clos')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CAISSES (CashRegister)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cash_registers (
  id TEXT PRIMARY KEY,
  method TEXT NOT NULL CHECK (method IN ('Espèces','Mobile Money','Carte Bancaire','Chèque')),
  current_balance NUMERIC(14,2) DEFAULT 0,
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. DÉPENSES (Expense)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('Carburant groupe électrogène','Transport','Entretien','Réparations','Fournitures','Autres')),
  description TEXT NOT NULL,
  amount NUMERIC(12,2) DEFAULT 0,
  date DATE NOT NULL,
  requested_by TEXT NOT NULL,
  approved_by TEXT,
  status TEXT DEFAULT 'En attente' CHECK (status IN ('En attente','Approuvé','Rejeté')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. CONTRÔLES QUALITÉ (FuelQualityTest)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fuel_quality_tests (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Super','Sans plomb','Gasoil','Pétrole','Gaz','Lubrifiants')),
  tank_name TEXT NOT NULL,
  density NUMERIC(8,4) DEFAULT 0,
  temperature NUMERIC(6,2) DEFAULT 0,
  water_presence BOOLEAN DEFAULT FALSE,
  water_height_mm NUMERIC(6,2) DEFAULT 0,
  nozzle_accuracy_percent NUMERIC(6,3) DEFAULT 0,
  is_conform BOOLEAN DEFAULT TRUE,
  operator TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. JOURNAL DE STATION (JournalRecord)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS journal_records (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  camion_no TEXT NOT NULL,
  chauffeur TEXT NOT NULL,
  col1_pos NUMERIC(12,2) DEFAULT 0,
  col1_neg NUMERIC(12,2) DEFAULT 0,
  col2_pos NUMERIC(12,2) DEFAULT 0,
  col2_neg NUMERIC(12,2) DEFAULT 0,
  col3_pos NUMERIC(12,2) DEFAULT 0,
  col3_neg NUMERIC(12,2) DEFAULT 0,
  col4_pos NUMERIC(12,2) DEFAULT 0,
  col4_neg NUMERIC(12,2) DEFAULT 0,
  destination TEXT,
  type TEXT DEFAULT 'depense',
  attachment_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. CONFIG JOURNAL (JournalConfig)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS journal_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  col1_title TEXT DEFAULT 'Entretien Et Dépense',
  col2_title TEXT DEFAULT 'Dépôt & Avance',
  col3_title TEXT DEFAULT 'Carburant',
  col4_title TEXT DEFAULT 'Divers / Péages',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. COMPTES CLIENTS B2B (ClientAccount)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_accounts (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone_number TEXT,
  credit_limit NUMERIC(14,2) DEFAULT 0,
  total_credit_details NUMERIC(14,2) DEFAULT 0,
  last_operation_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Actif' CHECK (status IN ('Actif','Inactif','Suspendu')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. TRANSACTIONS CRÉDIT (CreditTransaction)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_transactions (
  id TEXT PRIMARY KEY,
  client_id TEXT REFERENCES client_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Achat Crédit','Règlement / Paiement')),
  amount NUMERIC(14,2) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('Espèces','Chèque','Virement','Mobile Money')),
  fuel_type TEXT CHECK (fuel_type IN ('Super','Sans plomb','Gasoil','Pétrole','Gaz','Lubrifiants')),
  volume_liters NUMERIC(10,2),
  coupon_number TEXT,
  driver_name TEXT,
  plates TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Complété',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. INCIDENTS MAINTENANCE (MaintenanceIncident)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_incidents (
  id TEXT PRIMARY KEY,
  device_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Pompes & Pistolets','Électricité & Groupe','Sécurité & Incendie','Bâtiment & Réseau','Informatique & Caméras')),
  reported_date DATE NOT NULL,
  resolved_date DATE,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'Signalé' CHECK (status IN ('Signalé','En cours de réparation','Résolu','Planifié/Maintenance')),
  priority TEXT DEFAULT 'Moyenne' CHECK (priority IN ('Basse','Moyenne','Élevée','Critique')),
  technician_name TEXT,
  cost NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. PRIX DES CARBURANTS (FuelPrices config)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fuel_prices (
  product TEXT PRIMARY KEY CHECK (product IN ('Super','Sans plomb','Gasoil','Pétrole','Gaz','Lubrifiants')),
  buy_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sell_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. RAPPORTS DE CLÔTURE JOURNALIÈRE (DailyReport)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_reports (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  fuel_revenue NUMERIC(14,2) DEFAULT 0,
  shop_revenue NUMERIC(14,2) DEFAULT 0,
  car_wash_revenue NUMERIC(14,2) DEFAULT 0,
  oil_change_revenue NUMERIC(14,2) DEFAULT 0,
  total_revenue NUMERIC(14,2) DEFAULT 0,
  total_expenses NUMERIC(14,2) DEFAULT 0,
  net_profit NUMERIC(14,2) DEFAULT 0,
  mobile_money_collected NUMERIC(14,2) DEFAULT 0,
  cash_collected NUMERIC(14,2) DEFAULT 0,
  card_collected NUMERIC(14,2) DEFAULT 0,
  cheque_collected NUMERIC(14,2) DEFAULT 0,
  fuel_gaps JSONB DEFAULT '{}',
  status TEXT DEFAULT 'En cours' CHECK (status IN ('En cours','Clôturé')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- POLITIQUES DE SÉCURITÉ (Row Level Security)
-- ============================================================

ALTER TABLE station_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_wash_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE oil_change_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_quality_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Politique d'accès public pour toutes les tables (application mono-station)
CREATE POLICY "Allow all" ON station_store FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON fuel_stocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON pumps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON tanks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON deliveries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON shop_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON shop_sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON car_wash_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON oil_change_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON shifts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON cash_registers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON fuel_quality_tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON journal_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON journal_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON client_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON credit_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON maintenance_incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON fuel_prices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON daily_reports FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- DONNÉES INITIALES DES PRIX CARBURANTS
-- ============================================================
INSERT INTO fuel_prices (product, buy_price, sell_price) VALUES
  ('Super',       580, 615),
  ('Sans plomb',  560, 595),
  ('Gasoil',      535, 575),
  ('Pétrole',     430, 480),
  ('Gaz',        6800, 7500),
  ('Lubrifiants', 4500, 5500)
ON CONFLICT (product) DO NOTHING;

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
