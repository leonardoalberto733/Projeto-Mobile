import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';


interface Props { visible: boolean; groupId: string; onClose: () => void; onSuccess: () => void; }
interface Usuario { id: string; name: string; email: string; }


export default function ModalAdicionarParticipante({ visible, groupId, onClose, onSuccess }: Props) {
 const { user } = useAuth();
 const [pesquisa, setPesquisa] = useState('');
 const [resultados, setResultados] = useState<Usuario[]>([]);
 const [buscando, setBuscando] = useState(false);
 const [adicionando, setAdicionando] = useState<string | null>(null);


 async function buscarUsuarios() {
   if (!pesquisa.trim()) return;
   setBuscando(true);
   try {
     const { data, error } = await supabase
       .from('users')
       .select('id, name, email')
       .ilike('email', `%${pesquisa.trim()}%`)
       .neq('id', user?.id ?? '')
       .limit(10);


     if (error) throw error;
     setResultados(data ?? []);
   } catch (err) {
     console.error('Erro ao buscar usuários:', err);
   } finally {
     setBuscando(false);
   }
 }


 async function handleAdicionar(userId: string) {
   setAdicionando(userId);
   try {
     const { data: existe } = await supabase
       .from('group_members')
       .select('user_id')
       .eq('group_id', groupId)
       .eq('user_id', userId)
       .maybeSingle();


     if (existe) { Alert.alert('Atenção', 'Este usuário já é membro do grupo.'); return; }


     const { error } = await supabase
       .from('group_members')
       .insert([{ group_id: groupId, user_id: userId }]);


     if (error) throw error;


     Alert.alert('Sucesso', 'Participante adicionado ao grupo com sucesso!');
     onSuccess();
     handleFechar();
   } catch (err: any) {
     Alert.alert('Erro', err.message || 'Não foi possível adicionar o participante.');
   } finally {
     setAdicionando(null);
   }
 }


 function handleFechar() { setPesquisa(''); setResultados([]); onClose(); }


 return (
   <Modal visible={visible} transparent animationType="fade">
     <View style={styles.overlay}>
       <View style={styles.modal}>
         <Text style={styles.titulo}>Adicionar Participante</Text>
         <View style={styles.inputRow}>
           <TextInput placeholder="Buscar por e-mail" placeholderTextColor="#999" value={pesquisa} onChangeText={setPesquisa} onSubmitEditing={buscarUsuarios}
             style={styles.input} autoCapitalize="none" keyboardType="email-address"/>
           <TouchableOpacity style={styles.btnBuscar} onPress={buscarUsuarios} disabled={buscando}>
             {buscando
               ? <ActivityIndicator color="#FFF" size="small" />
               : <Text style={styles.txtBuscar}>Buscar</Text>}
           </TouchableOpacity>
         </View>


         <FlatList data={resultados} keyExtractor={(item) => item.id} style={styles.lista} showsVerticalScrollIndicator={false}
           ListEmptyComponent={
             pesquisa.trim().length > 0 && !buscando
               ? <Text style={styles.semResultado}>Nenhum usuário encontrado.</Text>
               : null
           }
           renderItem={({ item }) => (
             <View style={styles.cardUsuario}>
               <View style={{ flex: 1 }}>
                 <Text style={styles.nomeUsuario}>{item.name}</Text>
                 <Text style={styles.emailUsuario}>{item.email}</Text>
               </View>
               <TouchableOpacity style={[styles.btnAdd, adicionando === item.id && { opacity: 0.7 }]} onPress={() => handleAdicionar(item.id)}
                 disabled={adicionando === item.id}>
                 {adicionando === item.id
                   ? <ActivityIndicator color="#FFF" size="small" />
                   : <Text style={styles.txtAdd}>+</Text>}
               </TouchableOpacity>
             </View>
           )}
         />


         <TouchableOpacity style={styles.btnCancelar} onPress={handleFechar}>
           <Text style={styles.txtCancelar}>Cancelar</Text>
         </TouchableOpacity>
       </View>
     </View>
   </Modal>
 );
}


const styles = StyleSheet.create({
 overlay:     {
 flex: 1,
 backgroundColor: 'rgba(0,0,0,0.45)',
 justifyContent: 'center',
 paddingHorizontal: 20 },

 modal:       { 
  backgroundColor: '#FFF', 
  borderRadius: 22, padding: 22, 
  maxHeight: '80%' },

 titulo:      { 
  fontSize: 22, 
  fontWeight: 'bold', 
  color: '#222', 
  marginBottom: 18 
},

 inputRow:    { 
  flexDirection: 'row', 
  gap: 10, 
  marginBottom: 16 
},

 input:       { 
  flex: 1, 
  height: 50, 
  backgroundColor: '#F5F5F5', 
  borderRadius: 12, 
  borderWidth: 1, 
  borderColor: '#DDD', 
  paddingHorizontal: 14, 
  fontSize: 15, 
  color: '#222' 
},

 btnBuscar:   { 
  height: 50, 
  backgroundColor: '#4F46E5', 
  borderRadius: 12, 
  paddingHorizontal: 16, 
  justifyContent: 'center', 
  alignItems: 'center' 
},

 txtBuscar:   { 
  color: '#FFF', 
  fontWeight: 'bold', 
  fontSize: 14 
},

 lista:       { 
  marginBottom: 16, 
  maxHeight: 260 
},

 semResultado:{ 
  textAlign: 'center', 
  color: '#999', 
  paddingVertical: 20 
},

 cardUsuario: { 
  flexDirection: 'row', 
  alignItems: 'center', 
  backgroundColor: '#F9F9F9', 
  borderRadius: 12, 
  padding: 12, 
  marginBottom: 8, 
  borderWidth: 1, 
  borderColor: 
  '#EFEFEF' 
},
 nomeUsuario: { 
  fontSize: 15, 
  fontWeight: '600', 
  color: '#222' 
},

 emailUsuario:{ 
  fontSize: 13, 
  color: '#888', 
  marginTop: 2 
},

 btnAdd:      { 
  width: 40, 
  height: 40, 
  backgroundColor: '#16A34A', 
  borderRadius: 12, 
  justifyContent: 'center', 
  alignItems: 'center' 
},

 txtAdd:      { 
  color: '#FFF', 
  fontSize: 22, 
  fontWeight: 'bold', 
  marginTop: -2 
},

 btnCancelar: { 
  height: 50, 
  borderRadius: 12, 
  borderWidth: 1, 
  borderColor: '#DDD', 
  justifyContent: 'center', 
  alignItems: 'center' 
},

 txtCancelar: { 
  fontSize: 15, 
  fontWeight: '600', 
  color: '#555' 
},
});