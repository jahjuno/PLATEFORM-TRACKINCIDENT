import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement Supabase sont manquantes. Assurez-vous d\'avoir configuré VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'incident-management-system'
    }
  }
});

// Vérifier la connexion à la base de données
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Erreur de connexion à la base de données:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erreur inattendue lors de la vérification de la connexion:', err);
    return false;
  }
}