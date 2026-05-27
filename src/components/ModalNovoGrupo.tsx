import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ModalNovoGrupoProps { visible: boolean; onClose: () => void; onSuccess: () => void; }

export default function ModalNovoGrupo({ visible, onClose, onSuccess }: ModalNovoGrupoProps) {
 const { user } = useAuth();
 const [nome, setNome] = useState('');
 const [loading, setLoading] = useState(false);


 async function handleCriar() {
   if (!nome.trim()) { Alert.alert('Erro', 'O nome do grupo não pode estar vazio.'); return; }
   if (!user) return;


   setLoading(true);
   try {
     const { data: grupo, error: gErr } = await supabase
       .from('groups')
       .insert([{ name: nome.trim(), created_by: user.id }])
       .select()
       .single();


     if (gErr) throw gErr;


     const { error: mErr } = await supabase
       .from('group_members')
       .insert([{ group_id: grupo.id, user_id: user.id }]);


     if (mErr) throw mErr;


     setNome('');
     onSuccess();
     onClose();
   } catch (err: any) {
     console.error(err);
     Alert.alert('Erro', err.message || 'Não foi possível criar o grupo.');
   } finally {
     setLoading(false);
   }
 }


 return (
   <Modal visible={visible} transparent animationType="fade">
     <View style={styles.overlay}>
       <View style={styles.modal}>
         <Text style={styles.titulo}>Novo Grupo</Text>
         <TextInput placeholder="Nome do grupo" placeholderTextColor="#999" value={nome} onChangeText={setNome}style={styles.input}/>
         <View style={styles.botoes}>
           <TouchableOpacity style={styles.botaoCancelar} onPress={onClose} disabled={loading}>
             <Text style={styles.textoCancelar}>Cancelar</Text>
           </TouchableOpacity>
           <TouchableOpacity style={[styles.botaoCriar, loading && { opacity: 0.7 }]} onPress={handleCriar} disabled={loading}>
             {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textoCriar}>Criar</Text>}
           </TouchableOpacity>
         </View>
       </View>
     </View>
   </Modal>
 );
}


const styles = StyleSheet.create({
 overlay: {
 flex: 1,
 backgroundColor: 'rgba(0,0,0,0.45)',
 justifyContent: 'center',
 paddingHorizontal: 20
 },


 modal: {
 backgroundColor: '#FFF',
 borderRadius: 22,
 padding: 22
 },


 titulo: {
 fontSize: 26,
 fontWeight: 'bold',
 color: '#222',
 marginBottom: 20
 },


 input: {
 height: 55,
 backgroundColor: '#F5F5F5',
 borderRadius: 12,
 borderWidth: 1,
 borderColor: '#DDD',
 paddingHorizontal: 15,
 fontSize: 16,
 color: '#222',
 marginBottom: 25
 },


 botoes: {
 flexDirection: 'row',
 gap: 12
 },


 botaoCancelar: {
 flex: 1,
 height: 52,
 borderRadius: 12,
 borderWidth: 1,
 borderColor: '#DDD',
 justifyContent: 'center',
 alignItems: 'center'
 },


 textoCancelar: {
 fontSize: 16,
 fontWeight: '600',
 color: '#555'
 },


 botaoCriar: {
 flex: 1,
 height: 52,
 backgroundColor: '#4F46E5',
 borderRadius: 12,
 justifyContent: 'center',
 alignItems: 'center'
 },


 textoCriar: {
 fontSize: 16,
 fontWeight: 'bold',
 color: '#FFF'
},
});