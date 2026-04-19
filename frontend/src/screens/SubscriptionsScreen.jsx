import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, RefreshControl, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import { useSubscriptions } from '../hooks/useFinance'
import { money } from '../utils/format'

export default function SubscriptionsScreen() {
  const { theme } = useTheme()
  const { subscriptions, loading, refresh, add, remove } = useSubscriptions()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', billing_day: '', category: 'Streaming' })
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false) }

  const total = subscriptions.reduce((s, i) => s + i.amount, 0)

  const submit = async () => {
    if (!form.name || !form.amount) return
    await add({ ...form, amount: parseFloat(form.amount), billing_day: parseInt(form.billing_day || '1') })
    setForm({ name: '', amount: '', billing_day: '', category: 'Streaming' })
    setModal(false)
  }

  const input = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const s = (extra = {}) => ({ backgroundColor: theme.surface2, borderRadius: 14, padding: 14, color: theme.text, fontSize: 15, marginBottom: 14, borderWidth: 1, borderColor: theme.border, ...extra })

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Assinaturas</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.gold }]} onPress={() => setModal(true)}>
          <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View style={[styles.totalCard, { backgroundColor: theme.surface, borderColor: theme.goldBorder }]}>
        <Text style={[styles.totalLabel, { color: theme.muted }]}>Total mensal em assinaturas</Text>
        <Text style={[styles.totalValue, { color: theme.gold }]}>{money(total)}</Text>
      </View>

      <FlatList
        data={subscriptions}
        keyExtractor={i => String(i.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.gold} />}
        contentContainerStyle={{ padding: 20, paddingTop: 4 }}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.dot, { backgroundColor: theme.goldSoft }]}>
              <Ionicons name="card" size={18} color={theme.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.day, { color: theme.muted }]}>Cobra dia {item.billing_day} · {item.category}</Text>
            </View>
            <Text style={[styles.val, { color: theme.gold }]}>{money(item.amount)}</Text>
            <TouchableOpacity onPress={() => remove(item.id)} style={{ padding: 8 }}>
              <Ionicons name="trash-outline" size={16} color={theme.muted} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="card-outline" size={48} color={theme.muted} />
            <Text style={{ color: theme.muted, marginTop: 12 }}>Nenhuma assinatura cadastrada</Text>
          </View>
        }
      />

      <Modal visible={modal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' }}>Nova Assinatura</Text>
            <TextInput style={s()} value={form.name} onChangeText={v => input('name', v)} placeholder="Nome (ex: Netflix)" placeholderTextColor={theme.muted} />
            <TextInput style={s()} value={form.amount} onChangeText={v => input('amount', v)} placeholder="Valor mensal" placeholderTextColor={theme.muted} keyboardType="decimal-pad" />
            <TextInput style={s()} value={form.billing_day} onChangeText={v => input('billing_day', v)} placeholder="Dia de cobrança (1-31)" placeholderTextColor={theme.muted} keyboardType="number-pad" />
            <TouchableOpacity style={{ backgroundColor: theme.gold, borderRadius: 16, padding: 16, alignItems: 'center' }} onPress={submit}>
              <Text style={{ color: '#000', fontWeight: '700', fontSize: 15 }}>Adicionar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 14 }}>Cancelar</Text>
            </TouchableOpacity>
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
  totalCard: { marginHorizontal: 20, borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 8 },
  totalLabel: { fontSize: 12, marginBottom: 6 },
  totalValue: { fontSize: 28, fontWeight: '800' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  dot: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  name: { fontSize: 14, fontWeight: '600' },
  day: { fontSize: 11, marginTop: 2 },
  val: { fontSize: 14, fontWeight: '700', marginRight: 8 },
  empty: { alignItems: 'center', paddingTop: 60 },
})
