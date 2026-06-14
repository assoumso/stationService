import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Variables .env manquantes : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const TABLES = [
  'station_store',
  'fuel_prices',
  'fuel_stocks',
  'pumps',
  'tanks',
  'deliveries',
  'shop_products',
  'shop_sales',
  'car_wash_records',
  'oil_change_records',
  'employees',
  'shifts',
  'cash_registers',
  'expenses',
  'fuel_quality_tests',
  'journal_records',
  'journal_config',
  'client_accounts',
  'credit_transactions',
  'maintenance_incidents',
  'daily_reports',
];

async function clearAll() {
  console.log("🧹 Suppression de toutes les données fictives de Supabase...\n");

  for (const table of TABLES) {
    try {
      // Delete all rows by matching a condition that's always true
      const { error, count } = await supabase
        .from(table)
        .delete()
        .neq('id', '___never_match___')  // fallback pour tables avec id TEXT
        .throwOnError();

      if (error) {
        // Certaines tables peuvent ne pas avoir d'id, essayer sans filtre
        const { error: e2 } = await supabase.rpc('truncate_table', { table_name: table });
        if (e2) {
          console.warn(`  ⚠️  ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ ${table}: vidée via RPC`);
        }
      } else {
        console.log(`  ✅ ${table}: vidée`);
      }
    } catch (err) {
      console.warn(`  ⚠️  ${table}: ${err.message || err}`);
    }
  }

  // Vider station_store spécifiquement avec la clé 'test_key' qui avait été créée
  await supabase.from('station_store').delete().eq('id', 'test_key');

  console.log("\n✅ Nettoyage Supabase terminé.");
  console.log("ℹ️  Le localStorage devra être vidé manuellement dans le navigateur");
  console.log("   via les DevTools → Application → Local Storage → Clear All\n");
}

clearAll();
