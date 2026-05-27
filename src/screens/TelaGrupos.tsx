import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ModalNovoGrupo from '../components/ModalNovoGrupo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { GruposStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<GruposStackParamList, 'ListaGrupos'>;

interface Grupo { id: string; name: string; created_at: string; }

export default function TelaGrupos() {
  const navigation = useNavigation<Nav>();
  const { user }   = useAuth();
  const [grupos, setGrupos]           = useState<Grupo[]>([]);
  const [carregando, setCarregando]   = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);

  const carregarGrupos = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('groups(id, name, created_at)')
        .eq('user_id', user.id);

      if (error) throw error;
      const lista: Grupo[] = (data ?? []).map((r: any) => r.groups).filter(Boolean);
      setGrupos(lista);
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => {
    setCarregando(true);
    carregarGrupos();
  }, [carregarGrupos]));

  function onRefresh() { setRefreshing(true); carregarGrupos(); }

  if (carregando) {
    return <View style={styles.centrado}><ActivityIndicator size="large" color="#4F46E5" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meus Grupos</Text>

      {grupos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏡</Text>
          <Text style={styles.emptyTitulo}>Nenhum grupo ainda</Text>
          <Text style={styles.emptySubtitulo}>
            Crie um grupo para começar a dividir despesas com amigos
          </Text>
          <TouchableOpacity style={styles.botaoPrimario} onPress={() => setModalVisivel(true)}>
            <Text style={styles.textoBotaoPrimario}>Criar meu primeiro grupo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.botaoPrimario} onPress={() => setModalVisivel(true)}>
            <Text style={styles.textoBotaoPrimario}>+ Novo Grupo</Text>
          </TouchableOpacity>

          <FlatList
            data={grupos}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                colors={['#4F46E5']} tintColor="#4F46E5" />
            }
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card}
                onPress={() => navigation.navigate('DetalhesGrupo', { groupId: item.id, groupName: item.name })}>
                <View style={styles.cardIcone}><Text style={{ fontSize: 22 }}>👥</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nomeGrupo}>{item.name}</Text>
                  <Text style={styles.dataGrupo}>
                    Criado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <Text style={styles.seta}>›</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <ModalNovoGrupo
        visible={modalVisivel}
        onClose={() => setModalVisivel(false)}
        onSuccess={() => { setModalVisivel(false); carregarGrupos(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingTop: 50,
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
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  cardIcone: {
    width: 44,
    height: 44,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  nomeGrupo: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },

  dataGrupo: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },

  seta: {
    fontSize: 22,
    color: '#CCC',
    fontWeight: 'bold',
  },

  botaoPrimario: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  textoBotaoPrimario: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
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
    marginBottom: 30,
  },
});