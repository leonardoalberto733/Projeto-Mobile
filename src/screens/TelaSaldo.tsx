import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

function TelaSaldo() {
  const saldos = [
    {
      nome: 'Lucas',
      total: '320R$',
      gastos: [
        {
          descricao: 'Mercado do Seu Izaías',
          valor: '200R$',
        },
        {
          descricao: 'Carvão e gelo',
          valor: '120R$',
        },
      ],
    },

    {
      nome: 'Marina',
      total: '85R$',
      gastos: [
        {
          descricao: 'Gasolina da viagem',
          valor: '85R$',
        },
      ],
    },

    {
      nome: 'João',
      total: '140R$',
      gastos: [
        {
          descricao: 'Pizza do jantar',
          valor: '90R$',
        },
        {
          descricao: 'Refrigerantes',
          valor: '50R$',
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Saldo</Text>

      <ScrollView
        style={styles.lista}
        showsVerticalScrollIndicator={false}
      >
        {saldos.map((participante, index) => (
          <View key={index} style={styles.card}>
            {/* Cabeçalho */}
            <View style={styles.headerCard}>
              <Text style={styles.nome}>
                {participante.nome}
              </Text>

              <Text style={styles.total}>
                {participante.total}
              </Text>
            </View>

            {/* Lista de gastos */}
            <View style={styles.listaGastos}>
              {participante.gastos.map((gasto, gastoIndex) => (
                <View
                  key={gastoIndex}
                  style={styles.itemGasto}
                >
                  <Text style={styles.descricao}>
                    {gasto.descricao}
                  </Text>

                  <Text style={styles.valor}>
                    {gasto.valor}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default TelaSaldo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: 40,
    paddingHorizontal: 20,
  },

  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 30,
  },

  lista: {
    flex: 1,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  nome: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#222',
  },

  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16A34A',
  },

  listaGastos: {
    gap: 12,
  },

  itemGasto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  descricao: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    paddingRight: 15,
    lineHeight: 21,
  },

  valor: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },
});

