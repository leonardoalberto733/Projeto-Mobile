// src/components/ModalNovoGrupo.tsx

import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import { useState } from 'react';

interface ModalNovoGrupoProps {
  visible: boolean;
  onClose: () => void;
}

function ModalNovoGrupo({
  visible,
  onClose,
}: ModalNovoGrupoProps) {
  const [nomeGrupo, setNomeGrupo] = useState('');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.titulo}>
            Novo Grupo
          </Text>

          <TextInput
            placeholder="Nome do Grupo"
            placeholderTextColor="#999"
            value={nomeGrupo}
            onChangeText={setNomeGrupo}
            style={styles.input}
          />

          <View style={styles.botoes}>
            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={onClose}
            >
              <Text style={styles.textoCancelar}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCriar}
              onPress={onClose}
            >
              <Text style={styles.textoCriar}>
                Criar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default ModalNovoGrupo;

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
    color: '#222',
    marginBottom: 25,
  },

  botoes: {
    flexDirection: 'row',
    gap: 12,
  },

  botaoCancelar: {
    flex: 1,
    height: 52,
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

  botaoCriar: {
    flex: 1,
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoCriar: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});