import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function TelaPerfil() {
  const { user, signOut, saldoConsolidado, atualizarSaldo } = useAuth();
  const [saindo, setSaindo] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadando, setUploadando] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('users')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data?.avatar_url) setAvatarUrl(data.avatar_url); });
  }, [user]);

  async function handleTrocarFoto() {
    const opcoes: any[] = [
      {
        text: 'Câmera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permissão negada', 'Precisamos de acesso à câmera.'); return; }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.7 });
          if (!result.canceled) await uploadAvatar(result.assets[0].uri);
        },
      },
      {
        text: 'Galeria',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') { Alert.alert('Permissão negada', 'Precisamos de acesso à galeria.'); return; }
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.7 });
          if (!result.canceled) await uploadAvatar(result.assets[0].uri);
        },
      },
    ];

    if (avatarUrl) {
      opcoes.push({
        text: 'Remover foto',
        style: 'destructive',
        onPress: async () => {
          setUploadando(true);
          try {
            await supabase.from('users').update({ avatar_url: null }).eq('id', user!.id);
            setAvatarUrl(null);
          } catch (err: any) {
            Alert.alert('Erro', err.message);
          } finally {
            setUploadando(false);
          }
        },
      });
    }

    opcoes.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert('Foto de perfil', 'O que deseja fazer?', opcoes);
  }

  async function uploadAvatar(uri: string) {
    if (!user) return;
    setUploadando(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileName = `avatars/${user.id}.jpg`;

      const { error: upErr } = await supabase.storage
        .from('receipts')
        .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: true });

      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
      const publicUrl = urlData?.publicUrl ?? null;

      if (publicUrl) {
        const { error: dbErr } = await supabase
          .from('users')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);
        if (dbErr) throw dbErr;
        setAvatarUrl(publicUrl + `?t=${Date.now()}`);
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Não foi possível salvar a foto.');
    } finally {
      setUploadando(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Sair', 'Quer encerrar sua seção?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => { setSaindo(true); await signOut(); setSaindo(false); },
      },
    ]);
  }

  const email = user?.email ?? '—';
  const nome  = (user?.user_metadata?.name as string | undefined) ?? email.split('@')[0] ?? 'Usuário';

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <TouchableOpacity onPress={handleTrocarFoto} disabled={uploadando} style={styles.avatarTouch}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}>
              <FontAwesome name="user-circle-o" size={56} color="#FFF" />
            </View>
          )}
          <View style={styles.avatarBadge}>
            {uploadando
              ? <ActivityIndicator size="small" color="#FFF" />
              : <FontAwesome name="camera" size={13} color="#FFF" />}
          </View>
        </TouchableOpacity>
        <Text style={styles.nome}>{nome}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={[styles.cardSaldo, { borderColor: saldoConsolidado >= 0 ? '#86EFAC' : '#FCA5A5' }]}>
        <Text style={styles.labelSaldo}>Saldo consolidado</Text>
        <Text style={[styles.valorSaldo, { color: saldoConsolidado >= 0 ? '#16A34A' : '#DC2626' }]}>
          {saldoConsolidado >= 0 ? '+' : ''}R$ {saldoConsolidado.toFixed(2)}
        </Text>
        <Text style={styles.descSaldo}>
          {saldoConsolidado >= 0 ? 'Você pagou mais do que devia' : 'Você tem valores a acertar'}
        </Text>
        <TouchableOpacity onPress={atualizarSaldo} style={styles.btnAtualizar}>
          <Text style={styles.txtAtualizar}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.btnSair, saindo && { opacity: 0.7 }]} onPress={handleLogout} disabled={saindo}>
        {saindo ? <ActivityIndicator color="#DC2626" /> : <Text style={styles.txtSair}>Sair da conta</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 60,
    paddingHorizontal: 24,
  },

  avatarWrap: {
    alignItems: 'center',
    marginBottom: 30,
  },

  avatarTouch: {
    position: 'relative',
    marginBottom: 14,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },

  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },

  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },

  email: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },

  cardSaldo: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 2,
    marginBottom: 30,
    alignItems: 'center',
  },

  labelSaldo: {
    fontSize: 14,
    color: '#777',
    marginBottom: 6,
  },

  valorSaldo: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  descSaldo: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },

  btnAtualizar: {
    marginTop: 12,
  },

  txtAtualizar: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 14,
  },

  btnSair: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },

  txtSair: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
});