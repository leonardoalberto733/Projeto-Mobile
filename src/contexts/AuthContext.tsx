import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  saldoConsolidado: number;
  signOut: () => Promise<void>;
  atualizarSaldo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                     = useState<User | null>(null);
  const [loading, setLoading]               = useState(true);
  const [saldoConsolidado, setSaldoConsolidado] = useState(0);

  const atualizarSaldo = useCallback(async () => {
    if (!user) return;
    try {
      const { data: memberships, error } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (error || !memberships || memberships.length === 0) {
        setSaldoConsolidado(0);
        return;
      }

      let saldoTotal = 0;

      for (const { group_id } of memberships) {
        const [{ data: membros }, { data: despesas }] = await Promise.all([
          supabase.from('group_members').select('user_id').eq('group_id', group_id),
          supabase.from('expenses').select('amount, paid_by').eq('group_id', group_id),
        ]);

        if (!membros || membros.length === 0 || !despesas || despesas.length === 0) continue;

        const totalGrupo   = despesas.reduce((acc, d) => acc + Number(d.amount), 0);
        const cota         = totalGrupo / membros.length;
        const totalPago    = despesas
          .filter((d) => d.paid_by === user.id)
          .reduce((acc, d) => acc + Number(d.amount), 0);

        saldoTotal += totalPago - cota;
      }

      setSaldoConsolidado(Math.round(saldoTotal * 100) / 100);
    } catch (err) {
      console.error('Erro ao calcular saldo:', err);
    }
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) atualizarSaldo();
    else setSaldoConsolidado(0);
  }, [user, atualizarSaldo]);

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('signOut error:', e);
    } finally {
      const allKeys = await AsyncStorage.getAllKeys();
      const sbKeys  = allKeys.filter((k) => k.startsWith('sb-'));
      if (sbKeys.length > 0) await AsyncStorage.multiRemove(sbKeys);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, saldoConsolidado, signOut, atualizarSaldo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
