import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, RefreshControl } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { BarChart } from 'react-native-chart-kit'
import { useTheme } from '../context/ThemeContext'
import { useSummary } from '../hooks/useFinance'
import KpiCard from '../components/KpiCard'
import SectionHeader from '../components/SectionHeader'
import { money, monthName } from '../utils/format'

const W = Dimensions.get('window').width

export default function DashboardScreen() {
  const { theme, isDark, toggleTheme } = useTheme()
  const { income, expense, balance, monthly, categories, loading, refresh } = useSummary()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false) }

  const expenseCategories = categories.filter(c => c.type === 'expense').slice(0, 5)

  const chartData = {
    labels: monthly.length ? monthly.map(m => monthName(m.month)) : ['Abr'],
    datasets: [{ data: monthly.length ? monthly.map(m => m.expense) : [0] }],
  }

  const chartConfig = {
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    color: (opacity = 1) => `rgba(212,162,76,${opacity})`,
    labelColor: () => theme.muted,
    barPercentage: 0.6,
    decimalPlaces: 0,
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia 👋'
    if (h < 18) return 'Boa tarde 👋'
    return 'Boa noite 👋'
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.gold} />}
    >
      {/* Header */}
      <LinearGradient colors={isDark ? ['#161208','#080808'] : ['#F5EDD8','#F5F2EA']} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: theme.muted }]}>{greeting()}</Text>
            <Text style={[styles.name, { color: theme.text }]}>João Pedro</Text>
          </View>
          <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: theme.surface2, borderColor: theme.goldBorder }]}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={theme.gold} />
          </TouchableOpacity>
        </View>

        {/* Balance card */}
        <LinearGradient colors={['rgba(212,162,76,0.15)','rgba(212,162,76,0.04)']} style={[styles.balanceCard, { borderColor: theme.goldBorder }]}>
          <Text style={[styles.balLabel, { color: theme.muted }]}>Saldo disponível</Text>
          <Text style={[styles.balValue, { color: theme.text }]}>{money(balance)}</Text>
          <View style={styles.balRow}>
            <View style={styles.balItem}>
              <Ionicons name="arrow-up-circle" size={14} color={theme.success} />
              <Text style={[styles.balSmall, { color: theme.success }]}>{money(income)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.goldBorder }]} />
            <View style={styles.balItem}>
              <Ionicons name="arrow-down-circle" size={14} color={theme.danger} />
              <Text style={[styles.balSmall, { color: theme.danger }]}>{money(expense)}</Text>
            </View>
          </View>
        </LinearGradient>
      </LinearGradient>

      <View style={styles.body}>
        {/* KPIs */}
        <View style={styles.kpiRow}>
          <KpiCard label="Receitas" value={income} tone="success" style={{ marginRight: 6 }} />
          <KpiCard label="Despesas" value={expense} tone="danger" style={{ marginLeft: 6 }} />
        </View>

        {/* Chart */}
        {monthly.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.goldBorder }]}>
            <SectionHeader title="Gastos mensais" />
            <BarChart
              data={chartData}
              width={W - 64}
              height={180}
              chartConfig={chartConfig}
              style={{ borderRadius: 12, marginTop: 4 }}
              showValuesOnTopOfBars
              withInnerLines={false}
              fromZero
            />
          </View>
        )}

        {/* Categories */}
        {expenseCategories.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.goldBorder }]}>
            <SectionHeader title="Por categoria" />
            {expenseCategories.map((cat, i) => {
              const pct = expense > 0 ? (cat.total / expense) * 100 : 0
              return (
                <View key={i} style={styles.catRow}>
                  <Text style={[styles.catName, { color: theme.text }]}>{cat.category}</Text>
                  <View style={[styles.barBg, { backgroundColor: theme.surface2 }]}>
                    <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: theme.gold }]} />
                  </View>
                  <Text style={[styles.catVal, { color: theme.muted }]}>{money(cat.total)}</Text>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 13, marginBottom: 2 },
  name: { fontSize: 22, fontWeight: '800' },
  themeBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  balanceCard: { borderRadius: 22, borderWidth: 1, padding: 22 },
  balLabel: { fontSize: 12, marginBottom: 6 },
  balValue: { fontSize: 34, fontWeight: '800', letterSpacing: -1, marginBottom: 16 },
  balRow: { flexDirection: 'row', alignItems: 'center' },
  balItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balSmall: { fontSize: 13, fontWeight: '600' },
  divider: { width: 1, height: 16, marginHorizontal: 16 },
  body: { padding: 20 },
  kpiRow: { flexDirection: 'row', marginBottom: 4 },
  chartCard: { borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 14 },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  catName: { fontSize: 12, width: 90 },
  barBg: { flex: 1, height: 6, borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99 },
  catVal: { fontSize: 11, width: 72, textAlign: 'right' },
})
