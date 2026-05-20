import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const TelaCadastro = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro</Text>

      <TextInput
        placeholder="Nome"
        placeholderTextColor="#999"
        style={styles.input}
      />

      <TextInput
        placeholder="E-mail"
        placeholderTextColor="#999"
        style={styles.input}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#999"
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        placeholder="Confirmar senha"
        placeholderTextColor="#999"
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.botao}>
        <Text style={styles.textoBotao}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.link}>
          Já possui conta? Fazer login
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TelaCadastro;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 40,
    textAlign: 'center',
  },

  input: {
    width: '100%',
    height: 55,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    fontSize: 16,
  },

  botao: {
    width: '100%',
    height: 55,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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