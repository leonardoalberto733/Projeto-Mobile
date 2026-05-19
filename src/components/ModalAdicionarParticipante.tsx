// src/components/ModalAdicionarParticipante.tsx

import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';

import { useMemo, useState } from 'react';

interface ModalAdicionarParticipanteProps {
  visible: boolean;
  onClose: () => void;
}

function ModalAdicionarParticipante({
  visible,
  onClose,
}: ModalAdicionarParticipanteProps) {
  const [pesquisa, setPesquisa] = useState('');

  const participantes = [
    'Lucas',
    'Marina',
    'João',
    'Carlos',
    'Fernanda',
    'Amanda',
    'Rafael',
    'Gabriel',
    'Eduardo',
    'Larissa',
    'Camila',
    'Vinicius',
    'Renata',
    'Bruno',
    'Patrícia',
    'Felipe',
    'Aline',
    'Ricardo',
    'Juliana',
    'Thiago',
  ];

  const participantesFiltrados = useMemo(() => {
    return participantes.filter((participante) =>
      participante
        .toLowerCase()
        .includes(pesquisa.toLowerCase())
    );
  }, [pesquisa]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.titulo}>
            Add Participante
          </Text>

          <TextInput
            placeholder="Digite um nome..."
            placeholderTextColor="#999"
            value={pesquisa}
            onChangeText={setPesquisa}
            style={styles.input}
          />

          <ScrollView
            style={styles.lista}
            showsVerticalScrollIndicator={false}
          >
            {participantesFiltrados.map((participante, index) => (
              <View
                key={index}
                style={styles.cardParticipante}
              >
                <Text style={styles.nomeParticipante}>
                  {participante}
                </Text>

                <TouchableOpacity
                  style={styles.botaoAdicionar}
                  onPress={onClose}
                >
                  <Text style={styles.textoBotaoAdicionar}>
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.botaoCancelar}
            onPress={onClose}
          >
            <Text style={styles.textoCancelar}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default ModalAdicionarParticipante;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  modal: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 22,
    maxHeight: '80%',
  },

  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
  },

  input: {
    height: 55,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    color: '#222',
  },

  lista: {
    marginBottom: 20,
  },

  cardParticipante: {
    height: 65,
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  nomeParticipante: {
    fontSize: 17,
    color: '#222',
    fontWeight: '600',
  },

  botaoAdicionar: {
    width: 40,
    height: 40,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoBotaoAdicionar: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -2,
  },

  botaoCancelar: {
    height: 55,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoCancelar: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
});