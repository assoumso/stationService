import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Initialize Supabase. If credentials are empty or invalid, it returns null.
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey);
};

export const SUPABASE_TABLE = 'station_store';

/**
 * Saves a key-value state to Supabase JSON store.
 */
export async function saveStateToSupabase(key: string, value: any): Promise<{ success: boolean; error?: any }> {
  if (!supabase) return { success: false, error: 'Supabase URL or Key is missing' };

  try {
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .upsert({ 
        id: key, 
        value: value, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'id' });

    if (error) {
      console.warn(`Supabase save error for key "${key}":`, error);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.error(`Supabase save exception for key "${key}":`, err);
    return { success: false, error: err };
  }
}

/**
 * Loads a key-value state from Supabase JSON store.
 */
export async function loadStateFromSupabase(key: string): Promise<any | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .select('value')
      .eq('id', key)
      .maybeSingle();

    if (error) {
      // PGRST116 indicates 0 rows, which is expected before tables have content.
      if (error.code !== 'PGRST116') {
        console.warn(`Supabase load error for key "${key}":`, error);
      }
      return null;
    }
    return data?.value || null;
  } catch (err) {
    console.error(`Supabase load exception for key "${key}":`, err);
    return null;
  }
}

/**
 * Verifies if the connection is active and if the schema exists.
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; schemaExists: boolean; error?: string }> {
  if (!supabase) return { connected: false, schemaExists: false, error: 'Credentials are not configured yet.' };
  try {
    // Try doing a select to check if table is present
    const { error } = await supabase
      .from(SUPABASE_TABLE)
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') { // Relation / Table doesn't exist
        return { connected: true, schemaExists: false, error: 'Table "station_store" is missing in Supabase.' };
      }
      return { connected: false, schemaExists: false, error: error.message };
    }
    return { connected: true, schemaExists: true };
  } catch (err: any) {
    return { connected: false, schemaExists: false, error: err.message || 'Unknown network error.' };
  }
}
