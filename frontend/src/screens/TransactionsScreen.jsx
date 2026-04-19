import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../context/ThemeContext'
import { useTransactions } from '../hooks/useFinance'
import TransactionItem from '../components/TransactionItem'
import AddModal from '../components/AddModal'

export default function TransactionsScreen() {
  const { theme } = useTheme()
  const { transactions, loading, refresh, add, remove } = useTransactions()
  const [modal, setModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => { setRefreshing(true); await refresh(); setRefreshing(false) }

  const filtered = filter === 'all' ? transactions
    : transactions.filter(t => t.type === filter)

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.bg }]}>
        <Text style={[styles.title, { color: theme.text }]}>Transações</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.gold }]} onPress={() => setModal(true)}>
          <Ionicons name="add" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {[['all','Todas'],['income','Receitas'],['expense','Despesas']].map(([val, label]) => (
          <TouchableOpacity key={val} style={[styles.filterBtn, {
            backgroundColor: filter === val ? theme.gold : theme.surface2,
            borderColor: filter === val ? theme.gold : theme.border,
          }]} onPress={() => setFilter(val)}>
            <Text style={{ color: filter === val ? '#000' : theme.muted, fontSize: 12, fontWeight: '600' }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => String(i.id)}
        renderItem={({ item }) => <TransactionItem item={item} onDelete={remove} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.gold} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="wallet-outline" size={48} color={theme.muted} />
            <Text style={[styles.emptyTxt, { color: theme.muted }]}>Nenhuma transação ainda</Text>
          </View>
        }
      />

      <AddModal visible={modal} onClose={() => setModal(false)} onSubmit={add} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '800' },
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, borderWidth: 1 },
  list: { padding: 20, paddingTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTxt: { fontSize: 15 },
})
