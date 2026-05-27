import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,} from 'react-native';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function TelaPerfil() {
  const { user, signOut, saldoConsolidado, atualizarSaldo } = useAuth();
  const [saindo, setSaindo] = useState(false);

  async function handleLogout() {
    Alert.alert('Sair', 'Quer encerrar sua seção?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => {
          setSaindo(true);
          await signOut();
          setSaindo(false);
        },
      },
    ]);
  }

  const email = user?.email ?? '—';
  const nome  = (user?.user_metadata?.name as string | undefined)
    ?? email.split('@')[0]
    ?? 'Usuário';

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetra}>{nome.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.nome}>{nome}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={[styles.cardSaldo, { borderColor: saldoConsolidado >= 0 ? '#86EFAC' : '#FCA5A5' }]}>
        <Text style={styles.labelSaldo}>Saldo consolidado</Text>
        <Text style={[styles.valorSaldo, { color: saldoConsolidado >= 0 ? '#16A34A' : '#DC2626' }]}>
          {saldoConsolidado >= 0 ? '+' : ''}R$ {saldoConsolidado.toFixed(2)}
        </Text>
        <Text style={styles.descSaldo}>
          {saldoConsolidado >= 0
            ? 'Voce pagou mais do que devia'
            : 'Você tem valores a acertar'}
        </Text>
        <TouchableOpacity onPress={atualizarSaldo} style={styles.btnAtualizar}>
          <Text style={styles.txtAtualizar}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.btnSair, saindo && { opacity: 0.7 }]} onPress={handleLogout} disabled={saindo}>
        {saindo
          ? <ActivityIndicator color="#DC2626" />
          : <Text style={styles.txtSair}>Sair da conta</Text>}
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

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  avatarLetra: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
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
