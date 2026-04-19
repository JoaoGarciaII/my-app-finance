from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3, os
from datetime import datetime

app = Flask(__name__)
CORS(app)
DB_PATH = os.path.join(os.path.dirname(__file__), 'myfinance.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL CHECK(type IN ('income','expense')),
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            billing_day INTEGER NOT NULL,
            category TEXT DEFAULT 'Assinatura',
            active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            amount REAL NOT NULL,
            due_day INTEGER NOT NULL,
            category TEXT DEFAULT 'Conta Fixa',
            paid INTEGER DEFAULT 0,
            month TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            target_amount REAL NOT NULL,
            current_amount REAL DEFAULT 0,
            deadline TEXT,
            color TEXT DEFAULT '#D4A24C',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    ''')

    # Seed transactions
    cur = conn.execute('SELECT COUNT(*) FROM transactions')
    if cur.fetchone()[0] == 0:
        seeds = [
            ('income','Salário','Salário mensal',8500.00,'2026-04-01'),
            ('income','Freelance','Projeto React Native',3200.00,'2026-04-05'),
            ('expense','Alimentação','Mercado',620.00,'2026-04-06'),
            ('expense','Transporte','Combustível',290.00,'2026-04-08'),
            ('expense','Lazer','Cinema + jantar',180.00,'2026-04-10'),
            ('expense','Saúde','Plano de saúde',320.00,'2026-04-12'),
            ('expense','Educação','Curso online',197.00,'2026-04-14'),
            ('income','Investimentos','Dividendos FIIs',430.00,'2026-04-15'),
            ('expense','Alimentação','Restaurante',95.00,'2026-04-17'),
            ('expense','Moradia','Aluguel',1800.00,'2026-04-05'),
        ]
        conn.executemany('INSERT INTO transactions(type,category,description,amount,date) VALUES(?,?,?,?,?)', seeds)

    # Seed subscriptions
    cur = conn.execute('SELECT COUNT(*) FROM subscriptions')
    if cur.fetchone()[0] == 0:
        conn.executemany('INSERT INTO subscriptions(name,amount,billing_day,category) VALUES(?,?,?,?)', [
            ('Netflix',39.90,5,'Streaming'),
            ('Spotify',21.90,10,'Música'),
            ('Amazon Prime',19.90,15,'Streaming'),
            ('Adobe CC',274.00,20,'Design'),
            ('ChatGPT Plus',107.00,1,'Produtividade'),
        ])

    # Seed bills
    cur = conn.execute('SELECT COUNT(*) FROM bills')
    if cur.fetchone()[0] == 0:
        month = datetime.now().strftime('%Y-%m')
        conn.executemany('INSERT INTO bills(name,amount,due_day,category,paid,month) VALUES(?,?,?,?,?,?)', [
            ('Aluguel',1800.00,5,'Moradia',1,month),
            ('Energia',180.00,10,'Utilidades',1,month),
            ('Internet',99.90,15,'Utilidades',0,month),
            ('Água',65.00,20,'Utilidades',0,month),
            ('Condomínio',320.00,8,'Moradia',1,month),
        ])

    # Seed goals
    cur = conn.execute('SELECT COUNT(*) FROM goals')
    if cur.fetchone()[0] == 0:
        conn.executemany('INSERT INTO goals(title,target_amount,current_amount,deadline,color) VALUES(?,?,?,?,?)', [
            ('Viagem para Europa',15000.00,4200.00,'2026-12-01','#D4A24C'),
            ('Reserva de emergência',20000.00,12000.00,'2026-08-01','#27c281'),
            ('Novo notebook',6000.00,1800.00,'2026-06-01','#7c8cf8'),
        ])

    conn.commit()
    conn.close()

# ─── TRANSACTIONS ────────────────────────────────
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    p = request.args
    conn = get_db()
    q = 'SELECT * FROM transactions WHERE 1=1'
    params = []
    if p.get('date_from'): q += ' AND date >= ?'; params.append(p['date_from'])
    if p.get('date_to'):   q += ' AND date <= ?'; params.append(p['date_to'])
    if p.get('type'):      q += ' AND type = ?';  params.append(p['type'])
    q += ' ORDER BY date DESC, id DESC'
    rows = conn.execute(q, params).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    d = request.get_json()
    conn = get_db()
    cur = conn.execute('INSERT INTO transactions(type,category,description,amount,date) VALUES(?,?,?,?,?)',
        (d['type'],d['category'],d['description'],float(d['amount']),d['date']))
    conn.commit()
    row = conn.execute('SELECT * FROM transactions WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@app.route('/api/transactions/<int:tid>', methods=['PUT'])
def update_transaction(tid):
    d = request.get_json()
    conn = get_db()
    conn.execute('UPDATE transactions SET type=?,category=?,description=?,amount=?,date=? WHERE id=?',
        (d['type'],d['category'],d['description'],float(d['amount']),d['date'],tid))
    conn.commit()
    row = conn.execute('SELECT * FROM transactions WHERE id=?', (tid,)).fetchone()
    conn.close()
    return jsonify(dict(row))

@app.route('/api/transactions/<int:tid>', methods=['DELETE'])
def delete_transaction(tid):
    conn = get_db()
    conn.execute('DELETE FROM transactions WHERE id=?', (tid,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

# ─── SUMMARY ─────────────────────────────────────
@app.route('/api/summary', methods=['GET'])
def get_summary():
    p = request.args
    conn = get_db()
    params = []
    where = 'WHERE 1=1'
    if p.get('date_from'): where += ' AND date >= ?'; params.append(p['date_from'])
    if p.get('date_to'):   where += ' AND date <= ?'; params.append(p['date_to'])
    income  = conn.execute(f'SELECT COALESCE(SUM(amount),0) FROM transactions {where} AND type="income"',  params).fetchone()[0]
    expense = conn.execute(f'SELECT COALESCE(SUM(amount),0) FROM transactions {where} AND type="expense"', params).fetchone()[0]
    cats    = conn.execute(f'SELECT category, type, SUM(amount) as total FROM transactions {where} GROUP BY category,type ORDER BY total DESC', params).fetchall()
    monthly = conn.execute('''SELECT strftime('%Y-%m',date) as month,
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
        FROM transactions GROUP BY month ORDER BY month DESC LIMIT 6''').fetchall()
    weekly  = conn.execute('''SELECT strftime('%w',date) as dow,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
        FROM transactions WHERE date >= date('now','-7 days') GROUP BY dow''').fetchall()
    conn.close()
    return jsonify({
        'income': income, 'expense': expense, 'balance': income - expense,
        'categories': [dict(r) for r in cats],
        'monthly': [dict(r) for r in reversed(monthly)],
        'weekly':  [dict(r) for r in weekly],
    })

# ─── SUBSCRIPTIONS ────────────────────────────────
@app.route('/api/subscriptions', methods=['GET'])
def get_subscriptions():
    conn = get_db()
    rows = conn.execute('SELECT * FROM subscriptions ORDER BY billing_day').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/subscriptions', methods=['POST'])
def create_subscription():
    d = request.get_json()
    conn = get_db()
    cur = conn.execute('INSERT INTO subscriptions(name,amount,billing_day,category) VALUES(?,?,?,?)',
        (d['name'],float(d['amount']),int(d['billing_day']),d.get('category','Assinatura')))
    conn.commit()
    row = conn.execute('SELECT * FROM subscriptions WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@app.route('/api/subscriptions/<int:sid>', methods=['DELETE'])
def delete_subscription(sid):
    conn = get_db()
    conn.execute('DELETE FROM subscriptions WHERE id=?', (sid,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

# ─── BILLS ───────────────────────────────────────
@app.route('/api/bills', methods=['GET'])
def get_bills():
    month = request.args.get('month', datetime.now().strftime('%Y-%m'))
    conn = get_db()
    rows = conn.execute('SELECT * FROM bills WHERE month=? ORDER BY due_day', (month,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/bills', methods=['POST'])
def create_bill():
    d = request.get_json()
    conn = get_db()
    month = d.get('month', datetime.now().strftime('%Y-%m'))
    cur = conn.execute('INSERT INTO bills(name,amount,due_day,category,paid,month) VALUES(?,?,?,?,?,?)',
        (d['name'],float(d['amount']),int(d['due_day']),d.get('category','Conta Fixa'),0,month))
    conn.commit()
    row = conn.execute('SELECT * FROM bills WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@app.route('/api/bills/<int:bid>/toggle', methods=['PATCH'])
def toggle_bill(bid):
    conn = get_db()
    conn.execute('UPDATE bills SET paid = CASE WHEN paid=1 THEN 0 ELSE 1 END WHERE id=?', (bid,))
    conn.commit()
    row = conn.execute('SELECT * FROM bills WHERE id=?', (bid,)).fetchone()
    conn.close()
    return jsonify(dict(row))

@app.route('/api/bills/<int:bid>', methods=['DELETE'])
def delete_bill(bid):
    conn = get_db()
    conn.execute('DELETE FROM bills WHERE id=?', (bid,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

# ─── GOALS ───────────────────────────────────────
@app.route('/api/goals', methods=['GET'])
def get_goals():
    conn = get_db()
    rows = conn.execute('SELECT * FROM goals ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/goals', methods=['POST'])
def create_goal():
    d = request.get_json()
    conn = get_db()
    cur = conn.execute('INSERT INTO goals(title,target_amount,current_amount,deadline,color) VALUES(?,?,?,?,?)',
        (d['title'],float(d['target_amount']),float(d.get('current_amount',0)),d.get('deadline'),d.get('color','#D4A24C')))
    conn.commit()
    row = conn.execute('SELECT * FROM goals WHERE id=?', (cur.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(row)), 201

@app.route('/api/goals/<int:gid>/deposit', methods=['PATCH'])
def deposit_goal(gid):
    d = request.get_json()
    conn = get_db()
    conn.execute('UPDATE goals SET current_amount = MIN(target_amount, current_amount + ?) WHERE id=?',
        (float(d['amount']), gid))
    conn.commit()
    row = conn.execute('SELECT * FROM goals WHERE id=?', (gid,)).fetchone()
    conn.close()
    return jsonify(dict(row))

@app.route('/api/goals/<int:gid>', methods=['DELETE'])
def delete_goal(gid):
    conn = get_db()
    conn.execute('DELETE FROM goals WHERE id=?', (gid,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
