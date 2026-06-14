import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  // fuel_prices a la clé primaire 'product' et non 'id'
  const products = ['Super', 'Sans plomb', 'Gasoil', 'Pétrole', 'Gaz', 'Lubrifiants'];
  const { error } = await supabase.from('fuel_prices').delete().in('product', products);
  if (error) console.error('fuel_prices:', error.message);
  else console.log('✅ fuel_prices: vidée');
}
run();
