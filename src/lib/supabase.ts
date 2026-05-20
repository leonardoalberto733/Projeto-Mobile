import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wrsnielsnrrjlconcxqu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyc25pZWxzbnJyamxjb25jeHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzQ4NTAsImV4cCI6MjA5NDIxMDg1MH0.cXsqv6XuHxxaKth3qIBvM4gBwqXYXT85YbcPMwHZcjs';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});