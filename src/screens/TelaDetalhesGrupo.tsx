import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';

import { useState } from 'react';

import RNPickerSelect from 'react-native-picker-select';
import ModalAdicionarParticipante from './ModalAdicionarParticipante';

function TelaDetalhesGrupo() {
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalParticipanteVisivel, setModalParticipanteVisivel] = useState(false);

  const participantes = [
    'Lucas',
    'Marina',
    'João',
    'Carlos',
    'Fernanda',
    'Amanda',
    'Rafael',
  ];

  const despesas = [
    {
      valor: '200R$',
      pagante: 'Lucas',
      descricao:
        'Compra de leite, pão, margarina e carne no mercado do Seu Izaías.',
    },
    {
      valor: '85R$',
      pagante: 'Marina',
      descricao:
        'Pagamento da gasolina para a viagem até o litoral.',
    },
    {
      valor: '120R$',
      pagante: 'João',
      descricao:
        'Compra de carvão, refrigerante e gelo para o churrasco.',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Viagem Paraná</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.participantesContainer}
        contentContainerStyle={styles.participantesContent}
      >
        {participantes.map((participante, index) => (
          <View key={index} style={styles.participante}>
            <Text style={styles.nomeParticipante}>
              {participante}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.botoesContainer}>
        <TouchableOpacity style={styles.botaoSecundario} onPress={() => setModalParticipanteVisivel(true)}>
            <Text style={styles.textoBotaoSecundario}>
            + Add Participante
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoPrincipal}
          onPress={() => setModalVisivel(true)}
        >
          <Text style={styles.textoBotaoPrincipal}>
            + Nova Despesa
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.listaDespesas}
        showsVerticalScrollIndicator={false}
      >
        {despesas.map((despesa, index) => (
          <View key={index} style={styles.cardDespesa}>
            <View style={styles.infoDespesa}>
              <Text style={styles.valor}>
                {despesa.valor} • {despesa.pagante}
              </Text>

              <Text style={styles.descricao}>
                {despesa.descricao}
              </Text>
            </View>

            <TouchableOpacity style={styles.botaoImagem}>
              <Text style={styles.iconeImagem}>🖼️</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.botaoCalcular}>
          <Text style={styles.textoBotaoCalcular}>
            Calcular
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>
              Nova Despesa
            </Text>

            <View style={styles.linha}>
              <View style={styles.inputPreco}>
                <Text style={styles.rs}>R$</Text>

                <TextInput
                  placeholder="0,00"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                  style={styles.textInput}
                />
              </View>

                <View style={styles.selectPagante}>
                    <RNPickerSelect
                        placeholder={{
                        label: 'Quem pagou?',
                        value: null,
                        }}
                        items={participantes.map((participante) => ({
                        label: participante,
                        value: participante,
                        }))}
                        onValueChange={(value) => console.log(value)}
                        style={{
                        inputIOS: styles.inputPicker,
                        inputAndroid: styles.inputPicker,
                        placeholder: {
                            color: '#666',
                        },
                        }}
                    />
                </View>
            </View>

            <TextInput
              placeholder="Descrição"
              placeholderTextColor="#999"
              multiline
              style={styles.inputDescricao}
            />

            <TouchableOpacity style={styles.botaoRecibo}>
              <Text style={styles.iconeMais}>＋</Text>

              <Text style={styles.textoRecibo}>
                Adicionar Recibo
              </Text>
            </TouchableOpacity>

            <View style={styles.botoesModal}>
              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.textoCancelar}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.botaoSalvar}>
                <Text style={styles.textoSalvar}>
                  Salvar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ModalAdicionarParticipante
        visible={modalParticipanteVisivel}
        onClose={() => setModalParticipanteVisivel(false)}
      />
    </View>
  );
}

export default TelaDetalhesGrupo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 40,
    paddingHorizontal: 20,
  },

  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 25,
  },

  participantesContainer: {
    maxHeight: 55,
    marginBottom: 20,
  },

  participantesContent: {
    paddingRight: 20,
  },

  participante: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 30,
    paddingHorizontal: 18,
    justifyContent: 'center',
    marginRight: 10,
    height: 45,
  },

  nomeParticipante: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },

  botoesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },

  botaoSecundario: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },

  textoBotaoSecundario: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 15,
  },

  botaoPrincipal: {
    flex: 1,
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoBotaoPrincipal: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },

  listaDespesas: {
    flex: 1,
  },

  cardDespesa: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  infoDespesa: {
    flex: 1,
    paddingRight: 15,
  },

  valor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 10,
  },

  descricao: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },

  botaoImagem: {
    width: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#EEE',
    paddingLeft: 10,
  },

  iconeImagem: {
    fontSize: 28,
  },

  botaoCalcular: {
    width: '100%',
    height: 58,
    backgroundColor: '#16A34A',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },

  textoBotaoCalcular: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

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

  modalTitulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 25,
  },

  linha: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },

  inputPreco: {
    flex: 1,
    height: 55,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  rs: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginRight: 8,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
  },

selectPagante: {
  flex: 1,
  height: 55,
  backgroundColor: '#F5F5F5',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#DDD',
  justifyContent: 'center',
  paddingHorizontal: 10,
},

  textoSelect: {
    color: '#666',
    fontSize: 15,
  },

  inputDescricao: {
    minHeight: 100,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 15,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 18,
  },

  botaoRecibo: {
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 25,
  },

  iconeMais: {
    fontSize: 24,
    color: '#4F46E5',
    marginRight: 10,
  },

  textoRecibo: {
    fontSize: 16,
    color: '#444',
    fontWeight: '600',
  },

  botoesModal: {
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

  botaoSalvar: {
    flex: 1,
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoSalvar: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
    inputPicker: {
    fontSize: 15,
    color: '#222',
    },
});