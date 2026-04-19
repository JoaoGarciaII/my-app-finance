import axios from 'axios'

// Troca pela URL do Render quando fizer deploy
export const API_BASE = 'https://my-finance-backend-l88n.onrender.com'
// IMPORTANTE: durante o desenvolvimento, use o IP local da sua máquina
// Ex: 'http://192.168.0.10:5000/api'  ← descubra com: ipconfig (Win) ou ifconfig (Mac/Linux)

const api = axios.create({ baseURL: API_BASE, timeout: 10000 })

export default api
