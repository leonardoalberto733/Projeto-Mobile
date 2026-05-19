import { SafeAreaView, StyleSheet } from 'react-native';
import TelaCadastro from './src/components/TelaCadastro';
import TelaLogin from './src/components/TelaLogin';
import TelaGrupos from './src/components/TelaGrupos';
import TelaDetalhesGrupo from './src/components/TelaDetalhesGrupo';
import TelaSaldo from './src/components/TelaSaldo';

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