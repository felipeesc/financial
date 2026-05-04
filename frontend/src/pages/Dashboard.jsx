import { useState, useEffect, useCallback } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getMonthlySummary } from '../api/expenses'
import { getFixedCosts } from '../api/fixedCosts'

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.5rem 0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontFamily: 'system-ui, sans-serif' }}>
      <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: 2 }}>{payload[0].name}</span>
      <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{formatCurrency(payload[0].value)}</span>
    </div>
  )
}

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth)
  const [summary, setSummary] = useState([])
  const [fixedCosts, setFixedCosts] = useState([])
  const [loadingExp, setLoadingExp] = useState(false)
  const [loadingFixed, setLoadingFixed] = useState(false)
  const [expError, setExpError] = useState('')

  const loadSummary = useCallback(async () => {
    setLoadingExp(true); setExpError('')
    try { const { data } = await getMonthlySummary(month); setSummary(data) }
    catch { setExpError('Erro ao carregar resumo de gastos.') }
    finally { setLoadingExp(false) }
  }, [month])

  useEffect(() => { loadSummary() }, [loadSummary])
  useEffect(() => {
    setLoadingFixed(true)
    getFixedCosts().then(({ data }) => setFixedCosts(data)).catch(() => {}).finally(() => setLoadingFixed(false))
  }, [])

  const totalExpenses = summary.reduce((sum, s) => sum + Number(s.total), 0)
  const activeFixed = fixedCosts.filter(c => c.active !== false)
  const totalFixed = activeFixed.reduce((sum, c) => sum + Number(c.amount), 0)
  const pieData = summary.map(s => ({ name: s.categoryName, value: Number(s.total), color: s.categoryColor ?? '#94a3b8' }))

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Dashboard</h1>
          <p style={s.pageSubtitle}>Visão geral das suas finanças</p>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={s.monthInput} />
      </div>

      <div style={s.kpiRow}>
        {[
          { label: 'Total gasto no mês', value: totalExpenses, color: '#6366f1', loading: loadingExp },
          { label: 'Total fixo mensal', value: totalFixed, color: '#0ea5e9', loading: loadingFixed },
          { label: 'Total comprometido', value: totalExpenses + totalFixed, color: '#f59e0b', loading: loadingExp || loadingFixed },
        ].map(({ label, value, color, loading }) => (
          <div key={label} style={s.kpiCard}>
            <span style={s.kpiLabel}>{label}</span>
            {loading ? <span style={s.kpiLoading}>Carregando...</span> : <span style={{ ...s.kpiValue, color }}>{formatCurrency(value)}</span>}
          </div>
        ))}
      </div>

      <div style={s.mainGrid}>
        {/* Gráfico */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Gastos por Categoria</h2>
          {loadingExp && <p style={s.stateMsg}>Carregando...</p>}
          {expError && <p style={s.errorMsg}>{expError}</p>}
          {!loadingExp && !expError && pieData.length === 0 && <p style={s.empty}>Sem gastos registrados neste mês.</p>}
          {!loadingExp && !expError && pieData.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={2}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={v => <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div style={s.categoryTable}>
                {summary.map(item => (
                  <div key={item.categoryName} style={s.categoryRow}>
                    <div style={s.categoryLabel}>
                      <span style={{ ...s.colorDot, background: item.categoryColor ?? '#94a3b8' }} />
                      <span style={s.categoryName}>{item.categoryName}</span>
                    </div>
                    <span style={s.categoryTotal}>{formatCurrency(item.total)}</span>
                    <span style={s.categoryPct}>{totalExpenses > 0 ? `${Math.round((Number(item.total) / totalExpenses) * 100)}%` : '0%'}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Custos fixos */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Custos Fixos Ativos</h2>
          {loadingFixed && <p style={s.stateMsg}>Carregando...</p>}
          {!loadingFixed && activeFixed.length === 0 && <p style={s.empty}>Nenhum custo fixo ativo.</p>}
          {!loadingFixed && activeFixed.length > 0 && (
            <>
              <div style={s.fixedList}>
                {activeFixed.map(cost => (
                  <div key={cost.id} style={s.fixedRow}>
                    <div style={s.fixedInfo}>
                      <span style={s.fixedName}>{cost.name}</span>
                      {cost.dueDay && <span style={s.fixedDue}>Vence dia {cost.dueDay}</span>}
                    </div>
                    <span style={s.fixedAmount}>{formatCurrency(cost.amount)}</span>
                  </div>
                ))}
              </div>
              <div style={s.fixedTotal}>
                <span style={s.fixedTotalLabel}>Total mensal fixo</span>
                <span style={s.fixedTotalValue}>{formatCurrency(totalFixed)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  pageTitle: { margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#1e293b' },
  pageSubtitle: { margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' },
  monthInput: { padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem', color: '#1e293b', background: '#fff' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  kpiCard: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  kpiLabel: { color: '#64748b', fontSize: '0.88rem', fontWeight: 500 },
  kpiValue: { fontSize: '1.6rem', fontWeight: 700 },
  kpiLoading: { color: '#94a3b8', fontSize: '1rem' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' },
  card: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '1.5rem' },
  cardTitle: { margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' },
  stateMsg: { color: '#64748b', textAlign: 'center', padding: '2rem 0' },
  errorMsg: { margin: 0, padding: '0.5rem 0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: '0.85rem' },
  empty: { padding: '2rem 0', textAlign: 'center', color: '#94a3b8', margin: 0 },
  categoryTable: { marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' },
  categoryRow: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem' },
  categoryLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 },
  colorDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  categoryName: { color: '#1e293b', fontWeight: 500 },
  categoryTotal: { fontWeight: 600, color: '#1e293b', minWidth: 90, textAlign: 'right' },
  categoryPct: { color: '#64748b', minWidth: 40, textAlign: 'right', fontSize: '0.82rem' },
  fixedList: { display: 'flex', flexDirection: 'column' },
  fixedRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9', gap: '1rem' },
  fixedInfo: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  fixedName: { fontWeight: 600, color: '#1e293b', fontSize: '0.92rem' },
  fixedDue: { color: '#94a3b8', fontSize: '0.78rem' },
  fixedAmount: { fontWeight: 600, color: '#1e293b', fontSize: '0.92rem', whiteSpace: 'nowrap' },
  fixedTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '2px solid #f1f5f9' },
  fixedTotalLabel: { fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' },
  fixedTotalValue: { fontWeight: 700, color: '#6366f1', fontSize: '1.1rem' },
}
