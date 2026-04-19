import { View, StyleSheet } from 'react-native'
import { useTheme } from '../context/ThemeContext'

export default function Card({ children, style }) {
  const { theme } = useTheme()
  return (
    <View style={[styles.card, {
      backgroundColor: theme.surface,
      borderColor: theme.goldBorder,
    }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#D4A24C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  }
})
