import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { today } from '../utils/format'

const CATEGORIES = ['Alimentação','Transporte','Lazer','Saúde','Educação','Moradia','Assinatura','Investimentos','Salário','Freelance','Outros']

export default function AddModal({ visible, onClose, onSubmit, title = 'Nova Transação' }) {
  const { theme } = useTheme()
  const [form, setForm] = useState({ type: 'expense', category: 'Alimentação', description: '', amount: '', date: today() })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = () => {
    if (!form.description || !form.amount) return
    onSubmit({ ...form, amount: parseFloat(form.amount) })
    setForm({ type: 'expense', category: 'Alimentação', description: '', amount: '', date: today() })
    onClose()
  }

  const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: theme.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
    title: { color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
    label: { color: theme.muted, fontSize: 12, marginBottom: 6, letterSpacing: 0.5 },
    input: { backgroundColor: theme.surface2, borderRadius: 14, padding: 14, color: theme.text, fontSize: 15, marginBottom: 14, borderWidth: 1, borderColor: theme.border },
    typeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    typeBtn: { flex: 1, padding: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
    catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    catBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 99, borderWidth: 1 },
    catTxt: { fontSize: 12, fontWeight: '600' },
    btn: { backgroundColor: theme.gold, borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 4 },
    btnTxt: { color: '#000', fontWeight: '700', fontSize: 15 },
    cancelTxt: { color: theme.muted, textAlign: 'center', marginTop: 14, fontSize: 14 },
  })

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.overlay}>
        <ScrollView style={s.sheet} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>{title}</Text>

          <Text style={s.label}>TIPO</Text>
          <View style={s.typeRow}>
            {['income','expense'].map(t => (
              <TouchableOpacity key={t} style={[s.typeBtn, {
                borderColor: form.type === t ? theme.gold : theme.border,
                backgroundColor: form.type === t ? theme.goldSoft : 'transparent',
              }]} onPress={() => set('type', t)}>
                <Text style={{ color: form.type === t ? theme.gold : theme.muted, fontWeight: '600', fontSize: 13 }}>
                  {t === 'income' ? '💰 Receita' : '💸 Despesa'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>CATEGORIA</Text>
          <View style={s.catWrap}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} style={[s.catBtn, {
                borderColor: form.category === c ? theme.gold : theme.border,
                backgroundColor: form.category === c ? theme.goldSoft : 'transparent',
              }]} onPress={() => set('category', c)}>
                <Text style={[s.catTxt, { color: form.category === c ? theme.gold : theme.muted }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>DESCRIÇÃO</Text>
          <TextInput style={s.input} value={form.description} onChangeText={v => set('description', v)} placeholder="Ex: Almoço no restaurante" placeholderTextColor={theme.muted} />

          <Text style={s.label}>VALOR (R$)</Text>
          <TextInput style={s.input} value={form.amount} onChangeText={v => set('amount', v)} placeholder="0,00" placeholderTextColor={theme.muted} keyboardType="decimal-pad" />

          <Text style={s.label}>DATA</Text>
          <TextInput style={s.input} value={form.date} onChangeText={v => set('date', v)} placeholder="AAAA-MM-DD" placeholderTextColor={theme.muted} />

          <TouchableOpacity style={s.btn} onPress={submit}>
            <Text style={s.btnTxt}>Adicionar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={s.cancelTxt}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}
