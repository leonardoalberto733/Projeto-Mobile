import { SafeAreaView, StyleSheet } from 'react-native';
import TelaCadastro from './src/screens/TelaCadastro';
import TelaLogin from './src/screens/TelaLogin';
import TelaGrupos from './src/screens/TelaGrupos';
import TelaDetalhesGrupo from './src/screens/TelaDetalhesGrupo';
import TelaSaldo from './src/screens/TelaSaldo';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <TelaSaldo/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});