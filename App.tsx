import { SafeAreaView, StyleSheet } from 'react-native';
import TelaCadastro from './components/TelaCadastro';
import TelaLogin from './components/TelaLogin';
import TelaGrupos from './components/TelaGrupos';
import TelaDetalhesGrupo from './components/TelaDetalhesGrupo';


export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <TelaDetalhesGrupo/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});