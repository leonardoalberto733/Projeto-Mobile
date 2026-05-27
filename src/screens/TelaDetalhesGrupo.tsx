import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Share,
  ScrollView,
} from 'react-native';

import { useState, useCallback } from 'react';

import {
  useRoute,
  RouteProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import ModalAdicionarParticipante from '../components/ModalAdicionarParticipante';
import ModalNovaDespesa from '../components/ModalNovaDespesa';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { GruposStackParamList } from '../navigation/AppNavigator';

type RouteT = RouteProp<GruposStackParamList, 'DetalhesGrupo'>;

interface Despesa {
  id: string; description: string; amount: number;
  paid_by: string; receipt_url: string | null; created_at: string;
  users: { name: string } | null;
}

interface Membro { 
  user_id: string; 
  users: { 
    name: string } | null; }

interface Balanco { 
  userId: string; 
  nome: string; 
  totalPago: number; 
  cota: number; 
  saldo: number; 
}

export default function TelaDetalhesGrupo() {
  const route = useRoute<RouteT>();
  const navigation = useNavigation();

  const { groupId, groupName } = route.params;
  const { atualizarSaldo } = useAuth();

  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [balanco, setBalanco] = useState<Balanco[]>([]);

  const [mostrarBalanco, setMostrarBalanco] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [calculando, setCalculando] = useState(false);

  const [modalDespesa, setModalDespesa] = useState(false);
  const [modalParticipante, setModalParticipante] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const [{ data: mData, error: mErr }, { data: dData, error: dErr }] =
        await Promise.all([
          supabase
            .from('group_members')
            .select(`
              user_id,
              users (
                name
              )
            `)
            .eq('group_id', groupId),

          supabase
            .from('expenses')
            .select(`
              id,
              description,
              amount,
              paid_by,
              receipt_url,
              created_at,
              users (
                name
              )
            `)
            .eq('group_id', groupId)
            .order('created_at', { ascending: false }),
        ]);

      if (mErr) {
        throw mErr;
      }

      if (dErr) {
        throw dErr;
      }
    setMembros((mData ?? []) as unknown as Membro[]);
    setDespesas((dData ?? []) as unknown as Despesa[]);
    } catch (err) {
      console.error('Erro ao carregar grupo:', err);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, [groupId]);

  useFocusEffect(
    useCallback(() => {
      setCarregando(true);
      setMostrarBalanco(false);

      carregarDados();
    }, [carregarDados]),
  );

  function onRefresh() {
    setRefreshing(true);
    carregarDados();
  }

  function calcularBalanco() {
    if (membros.length === 0 || despesas.length === 0) {
      return;
    }

    setCalculando(true);

    setTimeout(() => {
      const total = despesas.reduce(
        (acc, d) => acc + Number(d.amount),
        0,
      );

      const cota = total / membros.length;

      const resultado: Balanco[] = membros.map((m) => {
        const pago = despesas
          .filter((d) => d.paid_by === m.user_id)
          .reduce((acc, d) => acc + Number(d.amount), 0);

        return {
          userId: m.user_id,
          nome: m.users?.name ?? 'Desconhecido',
          totalPago: pago,
          cota,
          saldo: Math.round((pago - cota) * 100) / 100,
        };
      });

      setBalanco(resultado);
      setMostrarBalanco(true);
      setCalculando(false);

      atualizarSaldo();
    }, 500);
  }

  async function handleConvidar() {
    try {
      await Share.share({
        message: `Ei! Te convido para o grupo "${groupName}" no app de despesas. Código: ${groupId}`,
        title: `Convite — ${groupName}`,
      });
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível abrir o compartilhamento.',
      );
    }
  }

  if (carregando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator
          size="large"
          color="#4F46E5"
        />
      </View>
    );
  }

  const membrosParaModal = membros.map((m) => ({
    user_id: m.user_id,
    name: m.users?.name ?? '?',
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.btnVoltar}
        >
          <Text style={styles.txtVoltar}>
            ‹ Voltar
          </Text>
        </TouchableOpacity>

        <Text
          style={styles.titulo}
          numberOfLines={1}
        >
          {groupName}
        </Text>

        <View style={styles.espacoHeader} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {membros.map((m) => (
          <View
            key={m.user_id}
            style={styles.chip}
          >
            <Text style={styles.chipTxt}>
              {m.users?.name ?? '?'}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.acoes}>
        <TouchableOpacity
          style={styles.btnSecundario}
          onPress={() => setModalParticipante(true)}
        >
          <Text style={styles.txtSecundario}>
            + Participante
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnPrimario}
          onPress={() => setModalDespesa(true)}
        >
          <Text style={styles.txtPrimario}>
            + Nova Despesa
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.btnConvidar}
        onPress={handleConvidar}
      >
        <Text style={styles.txtConvidar}>
          🔗 Convidar Amigo
        </Text>
      </TouchableOpacity>

      <FlatList
        data={despesas}
        keyExtractor={(item) => item.id}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emojiEmpty}>
              🧾
            </Text>

            <Text style={styles.emptyTxt}>
              Nenhuma despesa ainda. Adicione a primeira!
            </Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={[
              styles.btnCalcular,
              (calculando || despesas.length === 0) && {
                opacity: 0.5,
              },
            ]}
            onPress={calcularBalanco}
            disabled={
              calculando || despesas.length === 0
            }
          >
            {calculando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.txtCalcular}>
                ⚖️ Calcular Balanço
              </Text>
            )}
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <View style={styles.cardDespesa}>
            <View style={styles.cardConteudo}>
              <Text style={styles.valorDespesa}>
                R$ {Number(item.amount).toFixed(2)} ·{' '}
                {item.users?.name ?? '?'}
              </Text>

              <Text style={styles.descDespesa}>
                {item.description}
              </Text>

              <Text style={styles.dataDespesa}>
                {new Date(
                  item.created_at,
                ).toLocaleDateString('pt-BR')}
              </Text>
            </View>

            {item.receipt_url ? (
              <View style={styles.badgeRecibo}>
                <Text style={styles.iconeRecibo}>
                  🖼️
                </Text>
              </View>
            ) : null}
          </View>
        )}
      />

      {mostrarBalanco && (
        <View style={styles.painelBalanco}>
          <Text style={styles.painelTitulo}>
            Balanço do Grupo
          </Text>

          {balanco.map((item) => (
            <View
              key={item.userId}
              style={styles.linhaBalanco}
            >
              <Text style={styles.nomeBalanco}>
                {item.nome}
              </Text>

              <Text
                style={[
                  styles.saldoBalanco,
                  {
                    color:
                      item.saldo >= 0
                        ? '#16A34A'
                        : '#DC2626',
                  },
                ]}
              >
                {item.saldo >= 0 ? '+' : ''}
                R$ {item.saldo.toFixed(2)}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            onPress={() =>
              setMostrarBalanco(false)
            }
          >
            <Text style={styles.fecharBalanco}>
              Fechar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ModalNovaDespesa
        visible={modalDespesa}
        groupId={groupId}
        membros={membrosParaModal}
        onClose={() => setModalDespesa(false)}
        onSuccess={() => {
          setModalDespesa(false);
          carregarDados();
        }}
      />

      <ModalAdicionarParticipante
        visible={modalParticipante}
        groupId={groupId}
        onClose={() =>
          setModalParticipante(false)
        }
        onSuccess={() => {
          setModalParticipante(false);
          carregarDados();
        }}
      />
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  btnVoltar: {
    width: 70,
  },

  txtVoltar: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },

  titulo: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },

  espacoHeader: {
    width: 70,
  },

  chipsContainer: {
    paddingRight: 10,
    marginBottom: 14,
    gap: 8,
  },

  chip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 30,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
  },

  chipTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

  acoes: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  btnSecundario: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4F46E5',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  txtSecundario: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
  },

  btnPrimario: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  txtPrimario: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },

  btnConvidar: {
    height: 44,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  txtConvidar: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
  },

  lista: {
    flex: 1,
  },

  cardDespesa: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 14,
    marginBottom: 10,
  },

  cardConteudo: {
    flex: 1,
  },

  valorDespesa: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },

  descDespesa: {
    fontSize: 14,
    color: '#555',
  },

  dataDespesa: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 4,
  },

  badgeRecibo: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#EEE',
  },

  iconeRecibo: {
    fontSize: 20,
  },

  btnCalcular: {
    height: 54,
    marginVertical: 14,
    borderRadius: 14,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  txtCalcular: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emojiEmpty: {
    fontSize: 48,
    marginBottom: 12,
  },

  emptyTxt: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
  },

  painelBalanco: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFF',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  painelTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },

  linhaBalanco: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  nomeBalanco: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  saldoBalanco: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  fecharBalanco: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#4F46E5',
  },
});