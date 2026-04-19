import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import { currentMonth } from '../utils/format'

export function useSummary() {
  const [data, setData] = useState({ income: 0, expense: 0, balance: 0, categories: [], monthly: [], weekly: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetch = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get('/summary'); setData(r.data) } catch (e) { setError(e?.message || String(e)); console.error('useSummary error:', e) }
    setLoading(false)
  }, [])
  useEffect(() => { fetch() }, [])
  return { ...data, loading, error, refresh: fetch }
}

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetch = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get('/transactions'); setTransactions(r.data) } catch (e) { setError(e?.message || String(e)); console.error('useTransactions error:', e) }
    setLoading(false)
  }, [])
  useEffect(() => { fetch() }, [])
  const add = async (payload) => { await api.post('/transactions', payload); fetch() }
  const remove = async (id) => { await api.delete(`/transactions/${id}`); fetch() }
  return { transactions, loading, error, refresh: fetch, add, remove }
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetch = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get('/subscriptions'); setSubscriptions(r.data) } catch (e) { setError(e?.message || String(e)); console.error('useSubscriptions error:', e) }
    setLoading(false)
  }, [])
  useEffect(() => { fetch() }, [])
  const add = async (p) => { await api.post('/subscriptions', p); fetch() }
  const remove = async (id) => { await api.delete(`/subscriptions/${id}`); fetch() }
  return { subscriptions, loading, error, refresh: fetch, add, remove }
}

export function useBills() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const month = currentMonth()
  const fetch = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get('/bills', { params: { month } }); setBills(r.data) } catch (e) { setError(e?.message || String(e)); console.error('useBills error:', e) }
    setLoading(false)
  }, [])
  useEffect(() => { fetch() }, [])
  const add = async (p) => { await api.post('/bills', { ...p, month }); fetch() }
  const toggle = async (id) => { await api.patch(`/bills/${id}/toggle`); fetch() }
  const remove = async (id) => { await api.delete(`/bills/${id}`); fetch() }
  return { bills, loading, error, refresh: fetch, add, toggle, remove }
}

export function useGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetch = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get('/goals'); setGoals(r.data) } catch (e) { setError(e?.message || String(e)); console.error('useGoals error:', e) }
    setLoading(false)
  }, [])
  useEffect(() => { fetch() }, [])
  const add = async (p) => { await api.post('/goals', p); fetch() }
  const deposit = async (id, amount) => { await api.patch(`/goals/${id}/deposit`, { amount }); fetch() }
  const remove = async (id) => { await api.delete(`/goals/${id}`); fetch() }
  return { goals, loading, error, refresh: fetch, add, deposit, remove }
}