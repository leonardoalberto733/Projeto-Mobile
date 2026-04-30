import { View } from 'react-native';
import TelaCadastro from './components/TelaCadastro';
import TelaLogin from './components/TelaLogin';

export default function App() {
  return (
    <View>
      <TelaCadastro></TelaCadastro>
      <TelaLogin></TelaLogin>
    </View>
  );
}