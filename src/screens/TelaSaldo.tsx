import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DespesaExtrato {
  description: string;
  amount: number;
  paidByMe: boolean;
  payerName: string;
  payerAvatar: string | null;
}

interface ItemExtrato {
  groupId: string;
  groupName: string;
  totalPago: number;
  cota: number;
  saldo: number;
  despesas: DespesaExtrato[];
}

function AvatarPagador({ avatarUrl, paidByMe }: { avatarUrl: string | null; paidByMe: boolean }) {
  if (!paidByMe) return <View style={styles.avatarEspacador} />;
  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={styles.avatarPagador} />;
  }
  return (
    <View style={styles.avatarPagadorPlaceholder}>
      <FontAwesome name="user-circle-o" size={15} color="#16A34A" />
    </View>
  );
}

export default function TelaSaldo() {
  const { user } = useAuth();
  const [extrato, setExtrato] = useState<ItemExtrato[]>([]);
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
          supabase
            .from('expenses')
            .select('description, amount, paid_by, users(name, avatar_url)')
            .eq('group_id', group.id),
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
          despesas: despesas.map((d: any) => ({
            description: d.description,
            amount:      Number(d.amount),
            paidByMe:    d.paid_by === user.id,
            payerName:   d.users?.name ?? '?',
            payerAvatar: d.users?.avatar_url ?? null,
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
      <View style={styles.tituloRow}>
        <MaterialCommunityIcons name="cash-minus" size={30} color="#4F46E5" />
        <Text style={styles.titulo}>Extrato</Text>
      </View>

      {extrato.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="cash-minus" size={64} color="#C7D2FE" />
          <Text style={styles.emptyTitulo}>Nenhum extrato ainda</Text>
          <Text style={styles.emptySubtitulo}>Participe de um grupo!</Text>
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
                  <View style={styles.itemGastoLeft}>
                    <AvatarPagador avatarUrl={d.payerAvatar} paidByMe={d.paidByMe} />
                    <Text style={styles.descGasto} numberOfLines={1}>{d.description}</Text>
                  </View>
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

  tituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
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
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
  },

  itemGastoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
    gap: 8,
  },

  avatarPagador: {
    width: 22,
    height: 22,
    borderRadius: 11,
    flexShrink: 0,
  },

  avatarPagadorPlaceholder: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  avatarEspacador: {
    width: 22,
    flexShrink: 0,
  },

  descGasto: {
    flex: 1,
    fontSize: 14,
    color: '#444',
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
    marginTop: 16,
  },

  emptySubtitulo: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
  },
});