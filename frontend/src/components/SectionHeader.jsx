import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../context/ThemeContext'

export default function SectionHeader({ title, actionLabel, onAction }) {
  const { theme } = useTheme()
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.action, { color: theme.gold }]}>{actionLabel || 'Ver mais'}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  action: { fontSize: 13, fontWeight: '600' },
})
