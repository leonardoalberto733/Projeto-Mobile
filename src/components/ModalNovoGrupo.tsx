import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Image,
} from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ModalNovoGrupoProps { visible: boolean; onClose: () => void; onSuccess: () => void; }

export default function ModalNovoGrupo({ visible, onClose, onSuccess }: ModalNovoGrupoProps) {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      opcoes.push({ text: 'Remover foto', style: 'destructive', onPress: () => setImagemUri(null) });
    }

    opcoes.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert('Foto do grupo', 'Como deseja adicionar?', opcoes);
  }

  async function uploadImagem(uri: string): Promise<string | null> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileName = `group-covers/${Date.now()}.jpg`;
      const { error } = await supabase.storage
        .from('receipts')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
      return urlData?.publicUrl ?? null;
    } catch (err) {
      console.error('Erro no upload da capa:', err);
      return null;
    }
  }

  async function handleCriar() {
    if (!nome.trim()) { Alert.alert('Erro', 'O nome do grupo não pode estar vazio.'); return; }
    if (!user) return;

    setLoading(true);
    try {
      let coverUrl: string | null = null;
      if (imagemUri) coverUrl = await uploadImagem(imagemUri);

      const { data: grupo, error: gErr } = await supabase
        .from('groups')
        .insert([{ name: nome.trim(), created_by: user.id, cover_url: coverUrl }])
        .select()
        .single();

      if (gErr) throw gErr;

      const { error: mErr } = await supabase
        .from('group_members')
        .insert([{ group_id: grupo.id, user_id: user.id }]);

      if (mErr) throw mErr;

      setNome('');
      setImagemUri(null);
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível criar o grupo.');
    } finally {
      setLoading(false);
    }
  }

  function handleFechar() { setNome(''); setImagemUri(null); onClose(); }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.titulo}>Novo grupo</Text>

          <TouchableOpacity style={styles.btnFoto} onPress={handleEscolherImagem}>
            {imagemUri ? (
              <>
                <Image source={{ uri: imagemUri }} style={styles.fotoPreview} resizeMode="cover" />
                <View style={styles.fotoBadge}>
                  <FontAwesome name="camera" size={12} color="#FFF" />
                </View>
              </>
            ) : (
              <View style={styles.fotoPlaceholder}>
                <FontAwesome name="camera" size={24} color="#999" />
                <Text style={styles.fotoTexto}>Adicionar foto do grupo</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            placeholder="Nome do grupo"
            placeholderTextColor="#999"
            value={nome}
            onChangeText={setNome}
            style={styles.input}
          />

          <View style={styles.botoes}>
            <TouchableOpacity style={styles.botaoCancelar} onPress={handleFechar} disabled={loading}>
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.botaoCriar, loading && { opacity: 0.7 }]} onPress={handleCriar} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textoCriar}>Criar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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

  btnFoto: {
    width: '100%',
    height: 130,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    position: 'relative',
  },

  fotoPreview: {
    width: '100%',
    height: '100%',
  },

  fotoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fotoPlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  fotoTexto: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
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