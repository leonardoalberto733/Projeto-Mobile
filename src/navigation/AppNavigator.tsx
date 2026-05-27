import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TelaLogin           from '../screens/TelaLogin';
import TelaCadastro        from '../screens/TelaCadastro';
import TelaGrupos          from '../screens/TelaGrupos';
import TelaDetalhesGrupo   from '../screens/TelaDetalhesGrupo';
import TelaSaldo           from '../screens/TelaSaldo';
import TelaPerfil          from '../screens/TelaPerfil';
import { useAuth }         from '../contexts/AuthContext';

export type AuthStackParamList = {
  Login:    undefined;
  Cadastro: undefined;
};

export type GruposStackParamList = {
  ListaGrupos:   undefined;
  DetalhesGrupo: { groupId: string; groupName: string };
};

export type AppTabsParamList = {
  Grupos:  undefined;
  Extrato: undefined;
  Perfil:  undefined;
};

const AuthStack   = createNativeStackNavigator<AuthStackParamList>();
const GruposStack = createNativeStackNavigator<GruposStackParamList>();
const AppTabs     = createBottomTabNavigator<AppTabsParamList>();
const Root        = createNativeStackNavigator();

function GruposStackNav() {
  return (
    <GruposStack.Navigator screenOptions={{ headerShown: false }}>
      <GruposStack.Screen name="ListaGrupos"   component={TelaGrupos} />
      <GruposStack.Screen name="DetalhesGrupo" component={TelaDetalhesGrupo} />
    </GruposStack.Navigator>
  );
}

function AppTabsNav() {
  const ICONS: Record<string, string> = {
    Grupos: '👥',
    Extrato: '💰',
    Perfil: '👤'
  };

  return (
    <AppTabs.Navigator
      screenOptions={({ route }: { route: { name: keyof AppTabsParamList } }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopColor: '#E5E5E5',
          height: 60,
          paddingBottom: 8
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600'
        },

        tabBarIcon: ({ size }: { size: number }) => (
          <Text style={{ fontSize: size - 4 }}>
            {ICONS[route.name]}
          </Text>
        ),
      })}
    >
      <AppTabs.Screen name="Grupos" component={GruposStackNav} options={{ title: 'Meus Grupos' }}/>

      <AppTabs.Screen name="Extrato" component={TelaSaldo} options={{ title: 'Extrato' }}/>

      <AppTabs.Screen name="Perfil" component={TelaPerfil} options={{ title: 'Perfil' }}/>
    </AppTabs.Navigator>
  );
}

function AuthStackNav() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login"    component={TelaLogin} />
      <AuthStack.Screen name="Cadastro" component={TelaCadastro} />
    </AuthStack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      {user
        ? <Root.Screen name="App"  component={AppTabsNav} />
        : <Root.Screen name="Auth" component={AuthStackNav} />}
    </Root.Navigator>
  );
}
