import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wrsnielsnrrjlconcxqu.supabase.co/rest/v1/';
const supabaseKey = 'sb_publishable_uaH_RZ_cCMP9hMYclkxXNA_wc3wfY7g';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});