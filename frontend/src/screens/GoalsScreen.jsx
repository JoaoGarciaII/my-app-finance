import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, StyleSheet, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import { useGoals } from '../hooks/useFinance'
import { money } from '../utils/format'

export default function GoalsScreen() {
  const { theme } = useTheme()
  const { goals, refresh, add, deposit, remove } = useGoals()
  const [modal, setModal] = useState(false)
  const [depositModal, setDepositModal] = useState(null)
  const [form, setForm] = useState({ title: '', target_amount: '', current_amount: '0', deadline: '' })
  const [depAmt, setDepAmt] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false) }
  const inp = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    if (!form.title || !form.target_amount) return
    await add({ ...form, target_amount: parseFloat(form.target_amount), current_amount: parseFloat(form.current_amount || '0') })
    setForm({ title: '', target_amount: '', current_amount: '0', deadline: '' })
    setModal(false)
  }

  const handleDeposit = async () => {
    if (!depAmt || !depositModal) return
    await deposit(depositModal.id, parseFloat(depAmt))
    setDepAmt('')
    setDepositModal(null)
  }

  const ist = (extra = {}) => ({ backgroundColor: theme.surface2, borderRadius: 14, padding: 14, color: theme.text, fontSize: 15, marginBottom: 14, borderWidth: 1, borderColor: theme.border, ...extra })

  const COLORS = ['#D4A24C','#27c281','#7c8cf8','#ff6b6b','#f0a500']

  const GoalCard = ({ item }) => {
    const pct = item.target_amount > 0 ? Math.min((item.current_amount / item.target_amount) * 100, 100) : 0
    const color = item.color || theme.gold
    return (
      <View style={[styles.goalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.goalHeader}>
          <View style={[styles.goalDot, { backgroundColor: color + '22' }]}>
            <Ionicons name="flag" size={18} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.goalTitle, { color: theme.text }]}>{item.title}</Text>
            {item.deadline && <Text style={[styles.goalDeadline, { color: theme.muted }]}>Meta: {item.deadline}</Text>}
          </View>
          <TouchableOpacity onPress={() => remove(item.id)}><Ionicons name="trash-outline" size={16} color={theme.muted} /></TouchableOpacity>
        </View>
        <View style={[styles.progressBg, { backgroundColor: theme.surface2 }]}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
        <View style={styles.goalFooter}>
          <Text style={[styles.goalCurrent, { color }]}>{money(item.current_amount)}</Text>
          <Text style={[styles.goalPct, { color: theme.muted }]}>{pct.toFixed(0)}%</Text>
          <Text style={[styles.goalTarget, { color: theme.muted }]}>{money(item.target_amount)}</Text>
        </View>
        <TouchableOpacity style={[styles.depositBtn, { borderColor: color + '40', backgroundColor: color + '12' }]} onPress={() => setDepositModal(item)}>
          <Ionicons name="add-circle-outline" size={14} color={color} />
          <Text style={[styles.depositTxt, { color }]}>Adicionar valor</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Metas</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.gold }]} onPress={() => setModal(true)}>
          <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => <GoalCard item={item} />}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.gold} />}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="flag-outline" size={48} color={theme.muted} /><Text style={{ color: theme.muted, marginTop: 12 }}>Nenhuma meta cadastrada</Text></View>}
      />

      {/* Add Goal Modal */}
      <Modal visible={modal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' }}>Nova Meta</Text>
            <TextInput style={ist()} value={form.title} onChangeText={v => inp('title', v)} placeholder="Nome da meta" placeholderTextColor={theme.muted} />
            <TextInput style={ist()} value={form.target_amount} onChangeText={v => inp('target_amount', v)} placeholder="Valor alvo (R$)" placeholderTextColor={theme.muted} keyboardType="decimal-pad" />
            <TextInput style={ist()} value={form.current_amount} onChangeText={v => inp('current_amount', v)} placeholder="Valor atual (R$)" placeholderTextColor={theme.muted} keyboardType="decimal-pad" />
            <TextInput style={ist()} value={form.deadline} onChangeText={v => inp('deadline', v)} placeholder="Prazo (AAAA-MM-DD)" placeholderTextColor={theme.muted} />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setForm(p => ({ ...p, color: c }))} style={{ width: 28, height: 28, borderRadius: 99, backgroundColor: c, borderWidth: form.color === c ? 3 : 0, borderColor: '#fff' }} />
              ))}
            </View>
            <TouchableOpacity style={{ backgroundColor: theme.gold, borderRadius: 16, padding: 16, alignItems: 'center' }} onPress={submit}>
              <Text style={{ color: '#000', fontWeight: '700', fontSize: 15 }}>Criar meta</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModal(false)}><Text style={{ color: theme.muted, textAlign: 'center', marginTop: 14 }}>Cancelar</Text></TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Deposit Modal */}
      <Modal visible={!!depositModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>Adicionar à meta</Text>
            <Text style={{ color: theme.muted, textAlign: 'center', marginBottom: 20 }}>{depositModal?.title}</Text>
            <TextInput style={ist()} value={depAmt} onChangeText={setDepAmt} placeholder="Valor a adicionar (R$)" placeholderTextColor={theme.muted} keyboardType="decimal-pad" />
            <TouchableOpacity style={{ backgroundColor: theme.gold, borderRadius: 16, padding: 16, alignItems: 'center' }} onPress={handleDeposit}>
              <Text style={{ color: '#000', fontWeight: '700', fontSize: 15 }}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDepositModal(null)}><Text style={{ color: theme.muted, textAlign: 'center', marginTop: 14 }}>Cancelar</Text></TouchableOpacity>
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
  goalCard: { borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 14 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  goalDot: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  goalTitle: { fontSize: 15, fontWeight: '700' },
  goalDeadline: { fontSize: 11, marginTop: 2 },
  progressBg: { height: 8, borderRadius: 99, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 99 },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  goalCurrent: { fontSize: 16, fontWeight: '700' },
  goalPct: { fontSize: 13 },
  goalTarget: { fontSize: 13 },
  depositBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderRadius: 12, padding: 10 },
  depositTxt: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
})
