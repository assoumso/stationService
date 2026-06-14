import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Initialize Supabase client
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseKey);

export const SUPABASE_TABLE = 'station_store';

// ─────────────────────────────────────────────────────────────
// 1. SAVE TO station_store (generic JSON blob — primary store)
// ─────────────────────────────────────────────────────────────
export async function saveStateToSupabase(
  key: string,
  value: any
): Promise<{ success: boolean; error?: any }> {
  if (!supabase) return { success: false, error: 'Supabase not configured' };
  try {
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .upsert({ id: key, value, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    if (error) {
      console.warn(`[Supabase] save error for "${key}":`, error.message);
      return { success: false, error };
    }

    // Also write to dedicated typed table in parallel (best-effort)
    syncToTypedTable(key, value).catch(err =>
      console.warn(`[Supabase] typed table sync failed for "${key}":`, err)
    );

    return { success: true };
  } catch (err: any) {
    console.error(`[Supabase] exception for "${key}":`, err);
    return { success: false, error: err };
  }
}

// ─────────────────────────────────────────────────────────────
// 2. SYNC TO DEDICATED TYPED TABLES (for each entity type)
// ─────────────────────────────────────────────────────────────
async function syncToTypedTable(key: string, value: any): Promise<void> {
  if (!supabase || !value) return;

  switch (key) {
    // ── Prix Carburants ───────────────────────────────────────
    case 'fuelPrices': {
      const entries = Object.entries(value as Record<string, { buy: number; sell: number }>);
      const rows = entries.map(([product, prices]) => ({
        product,
        buy_price: prices.buy,
        sell_price: prices.sell,
        updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('fuel_prices').upsert(rows, { onConflict: 'product' });
      if (error) throw error;
      break;
    }

    // ── Stocks Carburant ──────────────────────────────────────
    case 'fuels': {
      if (!Array.isArray(value)) break;
      const rows = value.map((f: any) => ({
        id: f.id, product: f.product,
        initial_stock: f.initialStock, inputs: f.inputs, outputs: f.outputs,
        theoretical_stock: f.theoreticalStock, real_stock: f.realStock,
        gap: f.gap, last_updated: f.lastUpdated, updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('fuel_stocks').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Pompes ────────────────────────────────────────────────
    case 'pumps': {
      if (!Array.isArray(value)) break;
      const rows = value.map((p: any) => ({
        id: p.id, name: p.name, fuel_type: p.fuelType,
        nozzles_count: p.nozzlesCount, start_index: p.startIndex,
        end_index: p.endIndex, volume_sold: p.volumeSold,
        last_updated: p.lastUpdated, updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('pumps').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Cuves ─────────────────────────────────────────────────
    case 'tanks': {
      if (!Array.isArray(value)) break;
      const rows = value.map((t: any) => ({
        id: t.id, name: t.name, fuel_type: t.fuelType,
        capacity: t.capacity, initial_stock: t.initialStock,
        deliveries: t.deliveries, sales: t.sales,
        theoretical_stock: t.theoreticalStock,
        real_dipstick_stock: t.realDipstickStock,
        loss_detected: t.lossDetected, last_updated: t.lastUpdated,
        updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('tanks').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Livraisons ────────────────────────────────────────────
    case 'deliveries': {
      if (!Array.isArray(value)) break;
      const rows = value.map((d: any) => ({
        id: d.id, supplier: d.supplier, date: d.date, product: d.product,
        quantity: d.quantity, purchase_price_per_liter: d.purchasePricePerLiter,
        total_amount: d.totalAmount, invoice_number: d.invoiceNumber,
        status: d.status, attachment_name: d.attachmentName || null,
        updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('deliveries').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Produits Boutique ─────────────────────────────────────
    case 'shopProducts': {
      if (!Array.isArray(value)) break;
      const rows = value.map((p: any) => ({
        id: p.id, name: p.name, category: p.category,
        stock: p.stock, min_stock: p.minStock,
        purchase_price: p.purchasePrice, selling_price: p.sellingPrice,
        sales_count: p.salesCount, total_revenue: p.totalRevenue,
        updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('shop_products').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Ventes Boutique ───────────────────────────────────────
    case 'shopSales': {
      if (!Array.isArray(value)) break;
      const rows = value.map((s: any) => ({
        id: s.id, product_id: s.productId, product_name: s.productName,
        quantity: s.quantity, price: s.price, total: s.total, date: s.date
      }));
      const { error } = await supabase!.from('shop_sales').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Lavages ───────────────────────────────────────────────
    case 'carWash': {
      if (!Array.isArray(value)) break;
      const rows = value.map((w: any) => ({
        id: w.id, date: w.date, vehicle_type: w.vehicleType,
        wash_type: w.washType, quantity: w.quantity,
        price_per_wash: w.pricePerWash, revenue: w.revenue
      }));
      const { error } = await supabase!.from('car_wash_records').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Vidanges ──────────────────────────────────────────────
    case 'oilChanges': {
      if (!Array.isArray(value)) break;
      const rows = value.map((o: any) => ({
        id: o.id, date: o.date, vehicle_plate: o.vehiclePlate,
        oil_brand: o.oilBrand, oil_liter_used: o.oilLiterUsed,
        oil_cost: o.oilCost, filter_cost: o.filterCost,
        labor_cost: o.laborCost, total_cost: o.totalCost,
        charged_price: o.chargedPrice, margin: o.margin
      }));
      const { error } = await supabase!.from('oil_change_records').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Employés ──────────────────────────────────────────────
    case 'employees': {
      if (!Array.isArray(value)) break;
      const rows = value.map((e: any) => ({
        id: e.id, name: e.name, role: e.role,
        is_present: e.isPresent, performance_score: e.performanceScore,
        commission_rate: e.commissionRate, base_salary: e.baseSalary,
        commissions_accumulated: e.commissionsAccumulated,
        last_active: e.lastActive, updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('employees').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Shifts ────────────────────────────────────────────────
    case 'shifts': {
      if (!Array.isArray(value)) break;
      const rows = value.map((s: any) => ({
        id: s.id, name: s.name, start_time: s.startTime,
        end_time: s.endTime, active_employees: s.activeEmployees,
        cash_invoiced: s.cashInvoiced, cash_received: s.cashReceived,
        gap: s.gap, status: s.status, updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('shifts').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Caisses ───────────────────────────────────────────────
    case 'cashRegisters': {
      if (!Array.isArray(value)) break;
      const rows = value.map((c: any) => ({
        id: c.id, method: c.method,
        current_balance: c.currentBalance,
        last_updated: c.lastUpdated, updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('cash_registers').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Dépenses ──────────────────────────────────────────────
    case 'expenses': {
      if (!Array.isArray(value)) break;
      const rows = value.map((e: any) => ({
        id: e.id, category: e.category, description: e.description,
        amount: e.amount, date: e.date, requested_by: e.requestedBy,
        approved_by: e.approvedBy || null, status: e.status,
        updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('expenses').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Contrôles Qualité ─────────────────────────────────────
    case 'qualityTests': {
      if (!Array.isArray(value)) break;
      const rows = value.map((t: any) => ({
        id: t.id, date: t.date, fuel_type: t.fuelType,
        tank_name: t.tankName, density: t.density,
        temperature: t.temperature, water_presence: t.waterPresence,
        water_height_mm: t.waterHeightMm,
        nozzle_accuracy_percent: t.nozzleAccuracyPercent,
        is_conform: t.isConform, operator: t.operator, notes: t.notes || null
      }));
      const { error } = await supabase!.from('fuel_quality_tests').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Journal ───────────────────────────────────────────────
    case 'journalRecords': {
      if (!Array.isArray(value)) break;
      const rows = value.map((r: any) => ({
        id: r.id, date: r.date, camion_no: r.camionNo,
        chauffeur: r.chauffeur, col1_pos: r.col1Pos, col1_neg: r.col1Neg,
        col2_pos: r.col2Pos, col2_neg: r.col2Neg,
        col3_pos: r.col3Pos, col3_neg: r.col3Neg,
        col4_pos: r.col4Pos, col4_neg: r.col4Neg,
        destination: r.destination, type: r.type || 'depense',
        attachment_name: r.attachmentName || null,
        updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('journal_records').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Config Journal ────────────────────────────────────────
    case 'journalConfig': {
      if (!value) break;
      await supabase!.from('journal_config').upsert(
        {
          id: 'default',
          col1_title: value.col1Title,
          col2_title: value.col2Title,
          col3_title: value.col3Title,
          col4_title: value.col4Title,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
      break;
    }

    // ── Comptes Clients ───────────────────────────────────────
    case 'clientAccounts': {
      if (!Array.isArray(value)) break;
      const rows = value.map((a: any) => ({
        id: a.id, company_name: a.companyName, contact_name: a.contactName,
        phone_number: a.phoneNumber, credit_limit: a.creditLimit,
        total_credit_details: a.totalCreditDetails,
        last_operation_date: a.lastOperationDate,
        status: a.status || 'Actif', updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('client_accounts').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Transactions Crédit ───────────────────────────────────
    case 'creditTransactions': {
      if (!Array.isArray(value)) break;
      const rows = value.map((t: any) => ({
        id: t.id, client_id: t.clientId, date: t.date,
        type: t.type, amount: t.amount,
        payment_method: t.paymentMethod || null,
        fuel_type: t.fuelType || null,
        volume_liters: t.volumeLiters || null,
        coupon_number: t.couponNumber || null,
        driver_name: t.driverName || null,
        plates: t.plates || null, notes: t.notes || null,
        status: t.status || 'Complété'
      }));
      const { error } = await supabase!.from('credit_transactions').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    // ── Incidents Maintenance ─────────────────────────────────
    case 'maintenanceIncidents': {
      if (!Array.isArray(value)) break;
      const rows = value.map((i: any) => ({
        id: i.id, device_name: i.deviceName, category: i.category,
        reported_date: i.reportedDate, resolved_date: i.resolvedDate || null,
        description: i.description, status: i.status, priority: i.priority,
        technician_name: i.technicianName || null, cost: i.cost,
        notes: i.notes || null, updated_at: new Date().toISOString()
      }));
      const { error } = await supabase!.from('maintenance_incidents').upsert(rows, { onConflict: 'id' });
      if (error) throw error;
      break;
    }

    default:
      break;
  }
}

// ─────────────────────────────────────────────────────────────
// 3. LOAD FROM station_store (primary read source)
// ─────────────────────────────────────────────────────────────
export async function loadStateFromSupabase(key: string): Promise<any | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .select('value')
      .eq('id', key)
      .maybeSingle();

    if (error) {
      if (error.code !== 'PGRST116') {
        console.warn(`[Supabase] load error for "${key}":`, error.message);
      }
      return null;
    }
    return data?.value ?? null;
  } catch (err) {
    console.error(`[Supabase] load exception for "${key}":`, err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 4. TEST CONNECTION
// ─────────────────────────────────────────────────────────────
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  schemaExists: boolean;
  error?: string;
}> {
  if (!supabase) {
    return { connected: false, schemaExists: false, error: 'Identifiants Supabase non configurés.' };
  }
  try {
    const { error } = await supabase.from(SUPABASE_TABLE).select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return { connected: true, schemaExists: false, error: 'Table "station_store" manquante. Exécutez le script SQL.' };
      }
      return { connected: false, schemaExists: false, error: error.message };
    }
    return { connected: true, schemaExists: true };
  } catch (err: any) {
    return { connected: false, schemaExists: false, error: err.message || 'Erreur réseau inconnue.' };
  }
}
