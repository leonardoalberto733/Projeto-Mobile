import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

interface Membro { 
  user_id: string; 
  name: string; 
}

interface Props {
  visible: boolean;
  groupId: string;
  membros: Membro[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalNovaDespesa({ visible, groupId, membros, onClose, onSuccess }: Props) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [paganteId, setPaganteId] = useState<string | null>(null);
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFechar() {
    setDescricao(''); setValor(''); setPaganteId(null); setImagemUri(null); onClose();
  }

  async function handleEscolherImagem() {
    const opcoes: any[] = [
      {
        text: 'Câmera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permissão negada', 'Precisamos de acesso à câmera.'); return; }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.7 });
          if (!result.canceled) setImagemUri(result.assets[0].uri);
        },
      },
      {
        text: 'Galeria',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permissão negada', 'Precisamos de acesso à galeria.'); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.7 });
          if (!result.canceled) setImagemUri(result.assets[0].uri);
        },
      },
    ];

    if (imagemUri) {
      opcoes.push({ text: 'Remover recibo', style: 'destructive', onPress: () => setImagemUri(null) });
    }

    opcoes.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert('Recibo', 'Como deseja adicionar?', opcoes);
  }

  async function uploadImagem(uri: string): Promise<string | null> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileName = `${groupId}/${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('receipts')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
      return urlData?.publicUrl ?? null;
    } catch (err) {
      console.error('Erro no upload:', err);
      return null;
    }
  }

  async function handleSalvar() {
    if (!descricao.trim()) { Alert.alert('Atenção', 'Informe uma descrição.'); return; }
    const valorNum = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNum) || valorNum <= 0) { Alert.alert('Atenção', 'Informe um valor válido.'); return; }
    if (!paganteId) { Alert.alert('Atenção', 'Selecione quem pagou.'); return; }

    setLoading(true);
    try {
      let receiptUrl: string | null = null;
      if (imagemUri) receiptUrl = await uploadImagem(imagemUri);

      const { error } = await supabase.from('expenses').insert([{
        group_id: groupId,
        description: descricao.trim(),
        amount: valorNum,
        paid_by: paganteId,
        receipt_url: receiptUrl,
      }]);

      if (error) throw error;
      onSuccess();
      handleFechar();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível salvar a despesa.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={{ justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
          <View style={styles.modal}>
            <Text style={styles.titulo}>Nova despesa</Text>

            <View style={styles.inputPreco}>
              <Text style={styles.rs}>R$</Text>
              <TextInput
                placeholder="0,00" keyboardType="numeric" placeholderTextColor="#999"
                style={styles.txtInput} value={valor} onChangeText={setValor}
              />
            </View>

            <Text style={styles.label}>Quem pagou?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {membros.map((m) => (
                <TouchableOpacity
                  key={m.user_id}
                  style={[styles.chip, paganteId === m.user_id && styles.chipSel]}
                  onPress={() => setPaganteId(m.user_id)}>
                  <Text style={[styles.chipTxt, paganteId === m.user_id && styles.chipTxtSel]}>
                    {m.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              placeholder="Descrição"
              placeholderTextColor="#999" multiline
              style={styles.inputDesc}
              value={descricao} onChangeText={setDescricao} />

            <TouchableOpacity style={styles.btnRecibo} onPress={handleEscolherImagem}>
              <FontAwesome name="camera" size={18} color="#666" style={{ marginRight: 10 }} />
              <Text style={styles.txtRecibo}>
                {imagemUri ? 'Alterar imagem' : 'Adicionar recibo'}
              </Text>
            </TouchableOpacity>

            {imagemUri && (
              <View style={styles.previewWrap}>
                <Image source={{ uri: imagemUri }} style={styles.preview} resizeMode="cover" />
                <TouchableOpacity style={styles.btnRemoverRecibo} onPress={() => setImagemUri(null)}>
                  <FontAwesome name="times-circle" size={22} color="#DC2626" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.botoes}>
              <TouchableOpacity style={styles.btnCancelar} onPress={handleFechar} disabled={loading}>
                <Text style={styles.txtCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnSalvar, loading && { opacity: 0.7 }]}
                onPress={handleSalvar} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.txtSalvar}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
  },

  inputPreco: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 15,
    marginBottom: 16,
  },

  rs: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginRight: 8,
  },

  txtInput: {
    flex: 1,
    fontSize: 18,
    color: '#222',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },

  chip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },

  chipSel: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },

  chipTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },

  chipTxtSel: {
    color: '#FFF',
  },

  inputDesc: {
    minHeight: 90,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 14,
    textAlignVertical: 'top',
    fontSize: 15,
    marginBottom: 16,
    color: '#222',
  },

  btnRecibo: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 12,
  },

  txtRecibo: {
    fontSize: 15,
    color: '#444',
    fontWeight: '600',
  },

  previewWrap: {
    position: 'relative',
    marginBottom: 16,
  },

  preview: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },

  btnRemoverRecibo: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },

  botoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },

  btnCancelar: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },

  txtCancelar: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },

  btnSalvar: {
    flex: 1,
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  txtSalvar: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});