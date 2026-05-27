import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { AuthStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function TelaLogin() {
  const navigation = useNavigation<Nav>();
  const [email, setEmail]   = useState('');
  const [senha, setSenha]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.'); return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });
      if (error) throw error;
    } catch (err: any) {
      Alert.alert('Erro ao entrar', err.message || 'Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Bem-vindo 👋</Text>
        <Text style={styles.subtitulo}>Faça login para continuar</Text>

        <TextInput placeholder="E-mail" placeholderTextColor="#999" style={styles.input}
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput placeholder="Senha" placeholderTextColor="#999" style={styles.input}
          value={senha} onChangeText={setSenha} secureTextEntry />

        <TouchableOpacity style={[styles.botao, loading && { opacity: 0.7 }]}
          onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textoBotao}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
          <Text style={styles.link}>Não possui conta? Cadastre-se</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },

  subtitulo: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 40,
  },

  input: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 16,
    color: '#222',
  },

  botao: {
    width: '100%',
    height: 55,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },

  textoBotao: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  link: {
    marginTop: 25,
    textAlign: 'center',
    color: '#4F46E5',
    fontSize: 15,
  },
});