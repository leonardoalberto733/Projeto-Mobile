import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useState } from 'react';

import ModalNovoGrupo from './ModalNovoGrupo';

function TelaGrupos() {
  const [modalNovoGrupoVisivel, setModalNovoGrupoVisivel] = useState(false);

  const grupos = [
    'Restaurante Bagual',
    'Viagem Paraná',
    'Amistoso de Verão',
    'Churrasco da Firma',
    'Apartamento Praia',
    'Aniversário do Lucas',
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Seus Grupos</Text>

      <TouchableOpacity style={styles.botao} onPress={() => setModalNovoGrupoVisivel(true)}>
        <Text style={styles.textoBotao}>+ Novo Grupo</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.lista}
        showsVerticalScrollIndicator={false}
      >
        {grupos.map((grupo, index) => (
          <TouchableOpacity key={index} style={styles.cardGrupo}>
            <Text style={styles.nomeGrupo}>{grupo}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ModalNovoGrupo
        visible={modalNovoGrupoVisivel}
        onClose={() => setModalNovoGrupoVisivel(false)}
      />
    </View>
  );
}

export default TelaGrupos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 30,
    paddingTop: 40,
  },

  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 30,
    textAlign: 'center',
  },

  botao: {
    width: '100%',
    height: 55,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },

  textoBotao: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  lista: {
    flex: 1,
  },

  cardGrupo: {
    width: '100%',
    minHeight: 70,
    backgroundColor: '#FFF',
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  nomeGrupo: {
    fontSize: 18,
    color: '#222',
    fontWeight: '600',
  },
});