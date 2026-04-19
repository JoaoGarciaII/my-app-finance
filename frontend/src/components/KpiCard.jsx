import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../context/ThemeContext'
import { money } from '../utils/format'

const toneMap = {
  gold:    ['rgba(212,162,76,0.18)', 'rgba(212,162,76,0.04)'],
  success: ['rgba(39,194,129,0.18)', 'rgba(39,194,129,0.04)'],
  danger:  ['rgba(255,107,107,0.18)', 'rgba(255,107,107,0.04)'],
}

const borderMap = {
  gold:    'rgba(212,162,76,0.3)',
  success: 'rgba(39,194,129,0.3)',
  danger:  'rgba(255,107,107,0.3)',
}

export default function KpiCard({ label, value, tone = 'gold', icon }) {
  const { theme } = useTheme()
  return (
    <LinearGradient
      colors={toneMap[tone]}
      style={[styles.card, { borderColor: borderMap[tone] }]}
    >
      <Text style={[styles.label, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.text }]}>{money(value)}</Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
    flex: 1,
  },
  label: { fontSize: 12, marginBottom: 8, letterSpacing: 0.5 },
  value: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
})
