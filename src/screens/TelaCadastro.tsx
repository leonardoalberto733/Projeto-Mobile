import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { AuthStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Cadastro'>;

export default function TelaCadastro() {
  const navigation = useNavigation<Nav>();
  const [nome, setNome]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [senha, setSenha]                 = useState('');
  const [confirmar, setConfirmar]         = useState('');
  const [loading, setLoading]             = useState(false);

  async function handleCadastro() {
    if (!nome.trim() || !email.trim() || !senha || !confirmar) {
      Alert.alert('Atenção', 'Preencha todos os campos'); 
      return;
    }
    if (senha !== confirmar) {
      Alert.alert('Atenção', 'As senhas não coincidem'); 
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres'); 
      return;
    }

    setLoading(true);
    try {
      const { data, error: authErr } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: { data: { name: nome.trim() } },
      });

      if (authErr) throw authErr;
      if (!data.user) throw new Error('Usuário não criado.');

      const { error: profErr } = await supabase.from('users').insert([{
        id:    data.user.id,
        name:  nome.trim(),
        email: email.trim().toLowerCase(),
      }]);

      if (profErr) {
        console.warn('Aviso ao salvar perfil:', profErr.message);
      }
    } catch (err: any) {
      Alert.alert('Erro ao cadastrar', err.message || 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.subtitulo}>É rapidinho e de graça</Text>

        <TextInput placeholder="Nome completo" placeholderTextColor="#999"
          style={styles.input} value={nome} onChangeText={setNome} autoCapitalize="words" />
        <TextInput placeholder="Email" placeholderTextColor="#999"
          style={styles.input} value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" />
        <TextInput placeholder="Senha (min de 6 caracteres)" placeholderTextColor="#999"
          style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />
        <TextInput placeholder="Confirmar senha" placeholderTextColor="#999"
          style={styles.input} value={confirmar} onChangeText={setConfirmar} secureTextEntry />

        <TouchableOpacity style={[styles.botao, loading && { opacity: 0.7 }]}
          onPress={handleCadastro} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textoBotao}>Cadastrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Já tem conta? Faça login</Text>
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
    backgroundColor: '#16A34A',
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
