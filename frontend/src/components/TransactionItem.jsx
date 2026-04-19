import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import { money, dateBR } from '../utils/format'

const categoryIcons = {
  'Alimentação': 'restaurant',
  'Transporte': 'car',
  'Lazer': 'game-controller',
  'Saúde': 'medkit',
  'Educação': 'book',
  'Moradia': 'home',
  'Assinatura': 'card',
  'Investimentos': 'trending-up',
  'Salário': 'cash',
  'Freelance': 'laptop',
  'default': 'ellipse',
}

export default function TransactionItem({ item, onDelete }) {
  const { theme } = useTheme()
  const isIncome = item.type === 'income'
  const icon = categoryIcons[item.category] || categoryIcons.default

  return (
    <View style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.iconBox, { backgroundColor: isIncome ? 'rgba(39,194,129,0.12)' : theme.goldSoft }]}>
        <Ionicons name={icon} size={18} color={isIncome ? theme.success : theme.gold} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.desc, { color: theme.text }]} numberOfLines={1}>{item.description}</Text>
        <Text style={[styles.cat, { color: theme.muted }]}>{item.category} · {dateBR(item.date)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isIncome ? theme.success : theme.danger }]}>
          {isIncome ? '+' : '-'} {money(item.amount)}
        </Text>
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.del}>
            <Ionicons name="trash-outline" size={14} color={theme.muted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  info: { flex: 1 },
  desc: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  cat: { fontSize: 11 },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 14, fontWeight: '700' },
  del: { padding: 4 },
})
