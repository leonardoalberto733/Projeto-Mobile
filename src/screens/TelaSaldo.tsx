import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator,} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ItemExtrato {
  groupId: string;
  groupName: string;
  totalPago: number; 
  cota: number; 
  saldo: number;
  despesas: { description: string; amount: number; paidByMe: boolean }[];
}

export default function TelaSaldo() {
  const { user } = useAuth();
  const [extrato,   setExtrato] = useState<ItemExtrato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarExtrato = useCallback(async () => {
    if (!user) return;
    try {
      const { data: memberships, error: mErr } = await supabase
        .from('group_members')
        .select('group_id, groups(id, name)')
        .eq('user_id', user.id);

      if (mErr) throw mErr;
      if (!memberships || memberships.length === 0) { setExtrato([]); return; }

      const itens: ItemExtrato[] = [];

      for (const membership of memberships) {
        const group = (membership as any).groups;
        if (!group) continue;

        const [{ data: membros }, { data: despesas }] = await Promise.all([
          supabase.from('group_members').select('user_id').eq('group_id', group.id),
          supabase.from('expenses').select('description, amount, paid_by').eq('group_id', group.id),
        ]);

        if (!membros || !despesas) continue;

        const totalGrupo = despesas.reduce((acc, d) => acc + Number(d.amount), 0);
        const cota       = membros.length > 0 ? totalGrupo / membros.length : 0;
        const totalPago  = despesas
          .filter((d) => d.paid_by === user.id)
          .reduce((acc, d) => acc + Number(d.amount), 0);

        itens.push({
          groupId:   group.id,
          groupName: group.name,
          totalPago, cota,
          saldo: Math.round((totalPago - cota) * 100) / 100,
          despesas: despesas.map((d) => ({
            description: d.description,
            amount:      Number(d.amount),
            paidByMe:    d.paid_by === user.id,
          })),
        });
      }

      setExtrato(itens);
    } catch (err) {
      console.error('Erro ao carregar extrato:', err);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => {
    setCarregando(true);
    carregarExtrato();
  }, [carregarExtrato]));

  function onRefresh() { setRefreshing(true); carregarExtrato(); }

  if (carregando) {
    return <View style={styles.centrado}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Extrato</Text>

      {extrato.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>💸</Text>
          <Text style={styles.emptyTitulo}>Nenhum extrato ainda</Text>
          <Text style={styles.emptySubtitulo}>
            Participe de um grupo!
          </Text>
        </View>
      ) : (
        <FlatList
          data={extrato}
          keyExtractor={(item) => item.groupId}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
              colors={['#4F46E5']} tintColor="#4F46E5" />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.headerCard}>
                <Text style={styles.nomeGrupo} numberOfLines={1}>{item.groupName}</Text>
                <Text style={[styles.saldoGrupo, { color: item.saldo >= 0 ? '#16A34A' : '#DC2626' }]}>
                  {item.saldo >= 0 ? '+' : ''}R$ {item.saldo.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.subInfo}>
                Você pagou: R$ {item.totalPago.toFixed(2)}  ·  Sua cota: R$ {item.cota.toFixed(2)}
              </Text>
              {item.despesas.map((d, i) => (
                <View key={i} style={styles.itemGasto}>
                  <Text style={styles.descGasto} numberOfLines={1}>
                    {d.paidByMe ? '✅ ' : '   '}{d.description}
                  </Text>
                  <Text style={styles.valorGasto}>R$ {d.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  nomeGrupo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    marginRight: 10,
  },

  saldoGrupo: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  subInfo: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },

  itemGasto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
  },

  descGasto: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    paddingRight: 10,
  },

  valorGasto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  emptyTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
    textAlign: 'center',
  },

  emptySubtitulo: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
  },
});
