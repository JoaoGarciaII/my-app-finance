import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import { useBills } from '../hooks/useFinance'
import { money } from '../utils/format'

export default function BillsScreen() {
  const { theme } = useTheme()
  const { bills, loading, refresh, add, toggle, remove } = useBills()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', due_day: '' })
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false) }
  const paid = bills.filter(b => b.paid)
  const pending = bills.filter(b => !b.paid)
  const totalPending = pending.reduce((s, b) => s + b.amount, 0)

  const submit = async () => {
    if (!form.name || !form.amount) return
    await add({ ...form, amount: parseFloat(form.amount), due_day: parseInt(form.due_day || '1') })
    setForm({ name: '', amount: '', due_day: '' })
    setModal(false)
  }

  const inp = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const ist = (extra = {}) => ({ backgroundColor: theme.surface2, borderRadius: 14, padding: 14, color: theme.text, fontSize: 15, marginBottom: 14, borderWidth: 1, borderColor: theme.border, ...extra })

  const BillItem = ({ item }) => (
    <View style={[styles.item, { backgroundColor: theme.surface, borderColor: item.paid ? 'rgba(39,194,129,0.2)' : theme.border }]}>
      <TouchableOpacity style={[styles.check, { borderColor: item.paid ? theme.success : theme.border, backgroundColor: item.paid ? 'rgba(39,194,129,0.12)' : 'transparent' }]} onPress={() => toggle(item.id)}>
        {item.paid && <Ionicons name="checkmark" size={14} color={theme.success} />}
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[styles.name, { color: item.paid ? theme.muted : theme.text, textDecorationLine: item.paid ? 'line-through' : 'none' }]}>{item.name}</Text>
        <Text style={[styles.due, { color: theme.muted }]}>Vence dia {item.due_day}</Text>
      </View>
      <Text style={[styles.val, { color: item.paid ? theme.success : theme.danger }]}>{money(item.amount)}</Text>
      <TouchableOpacity onPress={() => remove(item.id)} style={{ padding: 8 }}>
        <Ionicons name="trash-outline" size={16} color={theme.muted} />
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Contas do mês</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.gold }]} onPress={() => setModal(true)}>
          <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={[styles.summary, { backgroundColor: theme.surface, borderColor: theme.goldBorder }]}>
        <View style={styles.sumItem}>
          <Text style={[styles.sumLabel, { color: theme.muted }]}>Pendente</Text>
          <Text style={[styles.sumVal, { color: theme.danger }]}>{money(totalPending)}</Text>
        </View>
        <View style={[styles.sumDiv, { backgroundColor: theme.border }]} />
        <View style={styles.sumItem}>
          <Text style={[styles.sumLabel, { color: theme.muted }]}>Pagas</Text>
          <Text style={[styles.sumVal, { color: theme.success }]}>{paid.length}/{bills.length}</Text>
        </View>
      </View>

      <FlatList
        data={bills}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => <BillItem item={item} />}
        contentContainerStyle={{ padding: 20, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.gold} />}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="receipt-outline" size={48} color={theme.muted} /><Text style={{ color: theme.muted, marginTop: 12 }}>Nenhuma conta cadastrada</Text></View>}
      />

      <Modal visible={modal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' }}>Nova Conta</Text>
            <TextInput style={ist()} value={form.name} onChangeText={v => inp('name', v)} placeholder="Nome da conta" placeholderTextColor={theme.muted} />
            <TextInput style={ist()} value={form.amount} onChangeText={v => inp('amount', v)} placeholder="Valor" placeholderTextColor={theme.muted} keyboardType="decimal-pad" />
            <TextInput style={ist()} value={form.due_day} onChangeText={v => inp('due_day', v)} placeholder="Dia de vencimento" placeholderTextColor={theme.muted} keyboardType="number-pad" />
            <TouchableOpacity style={{ backgroundColor: theme.gold, borderRadius: 16, padding: 16, alignItems: 'center' }} onPress={submit}>
              <Text style={{ color: '#000', fontWeight: '700', fontSize: 15 }}>Adicionar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal(false)}><Text style={{ color: theme.muted, textAlign: 'center', marginTop: 14 }}>Cancelar</Text></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800' },
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summary: { marginHorizontal: 20, borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 8, flexDirection: 'row' },
  sumItem: { flex: 1, alignItems: 'center' },
  sumLabel: { fontSize: 12, marginBottom: 4 },
  sumVal: { fontSize: 22, fontWeight: '700' },
  sumDiv: { width: 1, marginHorizontal: 16 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  check: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  name: { fontSize: 14, fontWeight: '600' },
  due: { fontSize: 11, marginTop: 2 },
  val: { fontSize: 14, fontWeight: '700', marginRight: 8 },
  empty: { alignItems: 'center', paddingTop: 60 },
})
