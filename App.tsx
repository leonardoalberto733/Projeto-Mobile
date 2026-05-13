import { View } from 'react-native';
import TelaCadastro from './src/components/TelaCadastro';
import TelaLogin from './src/components/TelaLogin';

export default function App() {
  return (
    <View>
      <TelaCadastro></TelaCadastro>
      <TelaLogin></TelaLogin>
    </View>
  );
}