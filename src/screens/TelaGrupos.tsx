import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import ModalNovoGrupo from '../components/ModalNovoGrupo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { GruposStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<GruposStackParamList, 'ListaGrupos'>;

interface Grupo { id: string; name: string; created_at: string; cover_url: string | null; }

export default function TelaGrupos() {
  const navigation = useNavigation<Nav>();
  const { user }   = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);

  const carregarGrupos = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('groups(id, name, created_at, cover_url)')
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
      <View style={styles.tituloRow}>
        <MaterialIcons name="groups" size={32} color="#4F46E5" />
        <Text style={styles.titulo}>Meus grupos</Text>
      </View>

      {grupos.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="groups" size={64} color="#C7D2FE" />
          <Text style={styles.emptyTitulo}>Nenhum grupo ainda</Text>
          <Text style={styles.emptySubtitulo}>
            Crie um grupo para começar a calcular as despesas!
          </Text>
          <TouchableOpacity style={styles.botaoPrimario} onPress={() => setModalVisivel(true)}>
            <Text style={styles.textoBotaoPrimario}>Criar meu primeiro grupo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
                <View style={styles.cardIcone}>
                  {item.cover_url ? (
                    <Image source={{ uri: item.cover_url }} style={styles.cardCover} resizeMode="cover" />
                  ) : (
                    <MaterialIcons name="groups" size={26} color="#4F46E5" />
                  )}
                </View>
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
          <TouchableOpacity style={styles.botaoPrimario} onPress={() => setModalVisivel(true)}>
            <Text style={styles.textoBotaoPrimario}>+ Novo grupo</Text>
          </TouchableOpacity>
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
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingTop: 50,
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
    overflow: 'hidden',
  },

  cardCover: {
    width: 44,
    height: 44,
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
    marginBottom: 30,
  },
});