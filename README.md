# My Finance — App Android

Aplicativo mobile de controle financeiro pessoal desenvolvido com React Native + Expo e backend Flask.

## Stack
- **Frontend:** React Native + Expo (expo-router)
- **Backend:** Flask + SQLite
- **UI:** Dark/Light mode, design premium âmbar/dourado
- **Charts:** react-native-chart-kit

## Estrutura
```
my-finance-app/
├── backend/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── app/                  ← rotas (expo-router)
│   │   ├── _layout.jsx       ← Bottom Tab Navigator
│   │   ├── index.jsx         ← Dashboard
│   │   ├── transactions.jsx
│   │   ├── subscriptions.jsx
│   │   ├── bills.jsx
│   │   └── goals.jsx
│   └── src/
│       ├── screens/          ← telas do app
│       ├── components/       ← componentes reutilizáveis
│       ├── hooks/            ← useFinance (CRUD completo)
│       ├── context/          ← ThemeContext (dark/light)
│       └── utils/            ← api.js, format.js, theme.js
└── README.md
```

---

## ▶️ COMO RODAR

### 1. Backend (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Rodando em http://0.0.0.0:5000
```

### 2. Descubra o IP local da sua máquina
O celular e o computador precisam estar na mesma rede Wi-Fi.

**Windows:**
```bash
ipconfig
# Procure: Endereço IPv4 → ex: 192.168.1.5
```
**Mac/Linux:**
```bash
ifconfig | grep "inet "
# Procure o IP local → ex: 192.168.1.5
```

### 3. Atualize o IP no frontend
Abra `frontend/src/utils/api.js` e troque:
```js
export const API_BASE = 'http://192.168.1.1:5000/api'
// Por:
export const API_BASE = 'http://SEU_IP_AQUI:5000/api'
// Ex: 'http://192.168.1.5:5000/api'
```

### 4. Frontend (Expo)
```bash
cd frontend
npm install
npx expo start
```
- Abre o **Expo Go** no celular (Android ou iOS)
- Escaneia o QR code que aparece no terminal
- O app abre no celular em tempo real ✅

---

## 📱 GERAR APK (para instalar no Android)

### Pré-requisitos
```bash
npm install -g eas-cli
eas login   # cria conta em expo.dev se não tiver
```

### Gerar o APK
```bash
cd frontend
eas build -p android --profile preview
```
- O build roda na nuvem (Expo EAS) — não precisa de Android Studio
- Quando terminar (~10 min), você recebe o link para baixar o `.apk`
- Instala direto no Android

### Para publicar na Play Store (futuro)
```bash
eas build -p android --profile production
# Gera um .aab (Android App Bundle) para a Play Store
```

---

## 🌐 DEPLOY (backend no Render)

1. Sobe o projeto no GitHub
2. Cria Web Service no [render.com](https://render.com)
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
3. Pega a URL gerada (ex: `https://my-finance-xxx.onrender.com`)
4. Atualiza `frontend/src/utils/api.js`:
```js
export const API_BASE = 'https://my-finance-xxx.onrender.com/api'
```
5. Rebuilda o APK com `eas build`

---

## ✨ Funcionalidades

| Tela | O que faz |
|---|---|
| **Dashboard** | Saldo, KPIs, gráfico de barras mensal, breakdown por categoria, dark/light toggle |
| **Transações** | CRUD completo, filtros por tipo, ícones por categoria |
| **Assinaturas** | Cadastro de serviços recorrentes, total mensal |
| **Contas** | Contas fixas mensais, toggle pago/pendente |
| **Metas** | Metas financeiras com barra de progresso, depósito parcial |

## 🎨 Design
- Dark mode por padrão (toggle para light)
- Palette âmbar/dourado premium
- Bottom Tab Navigation
- Cards com gradiente e glow dourado
- Pull-to-refresh em todas as telas

## 🚀 Próximas melhorias (para o portfólio)
- Autenticação (login/registro)
- Notificações de vencimento
- Export PDF do relatório mensal
- Modo offline com AsyncStorage
- Publicação na Play Store
