import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLoans, createLoan, markLoanAsPaid, deleteLoan } from '../api/loans'

function formatCurrency(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('T')[0].split('-')
  return `${day}/${m}/${y}`
}
function formatCpf(cpf) {
  const d = cpf.replace(/\D/g, '')
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf
}
function maskCpf(v) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

const EMPTY_FORM = {
  borrowerName: '', borrowerCpf: '', principalAmount: '',
  interestRate: '', userRate: '', referrerRate: '0',
  referrerName: '', loanDate: '', dueDate: '', notes: ''
}

export default function Loans() {
  const navigate = useNavigate()
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const { data } = await getLoans(); setLoans(data) }
    catch { setError('Erro ao carregar empréstimos.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const active = loans.filter(l => l.status === 'ACTIVE')
  const totalLoaned = active.reduce((s, l) => s + Number(l.principalAmount), 0)
  const totalMonthlyUser = active.reduce((s, l) => s + Number(l.monthlyUser), 0)
  const totalMonthlyReferrer = active.reduce((s, l) => s + Number(l.monthlyReferrer), 0)

  function handleChange(e) {
    const { name, value } = e.target
    if (name === 'borrowerCpf') { setForm(p => ({ ...p, borrowerCpf: maskCpf(value) })); return }
    setForm(p => ({ ...p, [name]: value }))
  }

  function cancel() { setShowForm(false); setForm(EMPTY_FORM); setFormError('') }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setSaving(true)
    const uRate = parseFloat(form.userRate)
    const rRate = parseFloat(form.referrerRate || '0')
    const iRate = parseFloat(form.interestRate)
    if (Math.abs(uRate + rRate - iRate) > 0.001) {
      setFormError('Taxa minha + Taxa indicação deve ser igual à Taxa total.'); setSaving(false); return
    }
    try {
      await createLoan({
        borrowerName: form.borrowerName.trim(),
        borrowerCpf: form.borrowerCpf.replace(/\D/g, ''),
        principalAmount: parseFloat(form.principalAmount),
        interestRate: iRate,
        userRate: uRate,
        referrerRate: rRate,
        referrerName: form.referrerName.trim() || null,
        loanDate: form.loanDate,
        dueDate: form.dueDate || null,
        notes: form.notes.trim() || null,
      })
      cancel(); await load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erro ao salvar empréstimo.')
    } finally { setSaving(false) }
  }

  async function handleMarkPaid(id) {
    if (!window.confirm('Marcar como quitado? O devedor devolveu o principal.')) return
    try { await markLoanAsPaid(id); await load() }
    catch { alert('Erro ao atualizar.') }
  }

  async function handleDelete(id) {
    if (!window.confirm('Excluir este empréstimo e todos os pagamentos?')) return
    try { await deleteLoan(id); await load() }
    catch { alert('Erro ao excluir.') }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Empréstimos</h1>
          <p style={s.pageSubtitle}>Controle de empréstimos e juros</p>
        </div>
        <button style={s.btnPrimary} onClick={() => setShowForm(true)}>+ Novo Empréstimo</button>
      </div>

      <div style={s.kpiRow}>
        {[
          { label: 'Total emprestado (ativos)', value: totalLoaned, color: '#6366f1' },
          { label: 'Juros meu / mês', value: totalMonthlyUser, color: '#10b981' },
          { label: 'Juros indicação / mês', value: totalMonthlyReferrer, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} style={s.kpiCard}>
            <span style={s.kpiLabel}>{label}</span>
            <span style={{ ...s.kpiValue, color }}>{formatCurrency(value)}</span>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>Novo Empréstimo</h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formRow}>
              <div style={{ ...s.field, flex: 2 }}>
                <label style={s.label}>Nome do devedor</label>
                <input name="borrowerName" value={form.borrowerName} onChange={handleChange} style={s.input} placeholder="Nome completo" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>CPF</label>
                <input name="borrowerCpf" value={form.borrowerCpf} onChange={handleChange} style={s.input} placeholder="000.000.000-00" required />
              </div>
            </div>

            <div style={s.formRow}>
              <div style={s.field}>
                <label style={s.label}>Valor emprestado (R$)</label>
                <input type="number" name="principalAmount" value={form.principalAmount} onChange={handleChange} style={s.input} placeholder="10000" min="0.01" step="0.01" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Taxa total (%)</label>
                <input type="number" name="interestRate" value={form.interestRate} onChange={handleChange} style={s.input} placeholder="15" min="0.01" step="0.01" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Taxa minha (%)</label>
                <input type="number" name="userRate" value={form.userRate} onChange={handleChange} style={s.input} placeholder="10" min="0.01" step="0.01" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Taxa indicação (%)</label>
                <input type="number" name="referrerRate" value={form.referrerRate} onChange={handleChange} style={s.input} placeholder="5" min="0" step="0.01" />
              </div>
            </div>

            <div style={s.formRow}>
              <div style={{ ...s.field, flex: 2 }}>
                <label style={s.label}>Indicado por (opcional)</label>
                <input name="referrerName" value={form.referrerName} onChange={handleChange} style={s.input} placeholder="Nome de quem indicou" />
              </div>
            </div>

            <div style={s.formRow}>
              <div style={s.field}>
                <label style={s.label}>Data do empréstimo</label>
                <input type="date" name="loanDate" value={form.loanDate} onChange={handleChange} style={s.input} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Data de vencimento (opcional)</label>
                <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} style={s.input} />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>Observações</label>
              <input name="notes" value={form.notes} onChange={handleChange} style={s.input} placeholder="Observações..." />
            </div>

            {formError && <p style={s.errorMsg}>{formError}</p>}
            <div style={s.formActions}>
              <button type="button" style={s.btnSecondary} onClick={cancel} disabled={saving}>Cancelar</button>
              <button type="submit" style={{ ...s.btnPrimary, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                {saving ? 'Salvando...' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p style={s.stateMsg}>Carregando...</p>}
      {error && <p style={s.errorMsg}>{error}</p>}

      {!loading && !error && loans.length === 0 && (
        <p style={s.empty}>Nenhum empréstimo cadastrado.</p>
      )}

      {!loading && !error && loans.map(loan => (
        <div key={loan.id} style={{ ...s.loanCard, opacity: loan.status === 'PAID' ? 0.7 : 1 }}>
          <div style={s.loanHeader}>
            <div style={s.loanHeaderLeft}>
              <span style={s.loanName}>{loan.borrowerName}</span>
              <span style={s.loanCpf}>{formatCpf(loan.borrowerCpf)}</span>
            </div>
            <span style={{ ...s.statusBadge, background: loan.status === 'PAID' ? '#dcfce7' : '#ede9fe', color: loan.status === 'PAID' ? '#16a34a' : '#6366f1' }}>
              {loan.status === 'PAID' ? 'Quitado' : 'Ativo'}
            </span>
          </div>

          <div style={s.loanGrid}>
            <div style={s.loanStat}>
              <span style={s.statLabel}>Principal</span>
              <span style={s.statValue}>{formatCurrency(loan.principalAmount)}</span>
            </div>
            <div style={s.loanStat}>
              <span style={s.statLabel}>Taxa total</span>
              <span style={s.statValue}>{loan.interestRate}%</span>
            </div>
            <div style={s.loanStat}>
              <span style={s.statLabel}>Juros/mês (meu)</span>
              <span style={{ ...s.statValue, color: '#10b981' }}>{formatCurrency(loan.monthlyUser)}</span>
            </div>
            {Number(loan.referrerRate) > 0 && (
              <div style={s.loanStat}>
                <span style={s.statLabel}>Juros/mês (indicação)</span>
                <span style={{ ...s.statValue, color: '#f59e0b' }}>{formatCurrency(loan.monthlyReferrer)}</span>
              </div>
            )}
            <div style={s.loanStat}>
              <span style={s.statLabel}>Total recebido (meu)</span>
              <span style={s.statValue}>{formatCurrency(loan.totalUserReceived)}</span>
            </div>
            <div style={s.loanStat}>
              <span style={s.statLabel}>Pagamentos</span>
              <span style={s.statValue}>{loan.paymentCount}x</span>
            </div>
          </div>

          {loan.referrerName && (
            <p style={s.referrerInfo}>Indicado por: <strong>{loan.referrerName}</strong> ({loan.referrerRate}%)</p>
          )}

          <div style={s.loanDates}>
            <span>Empréstimo: {formatDate(loan.loanDate)}</span>
            {loan.dueDate && <span>Vencimento: {formatDate(loan.dueDate)}</span>}
          </div>

          <div style={s.loanActions}>
            <button style={s.btnView} onClick={() => navigate(`/loans/${loan.id}`)}>
              Ver pagamentos ({loan.paymentCount})
            </button>
            {loan.status === 'ACTIVE' && (
              <button style={s.btnPaid} onClick={() => handleMarkPaid(loan.id)}>Marcar quitado</button>
            )}
            <button style={s.btnDelete} onClick={() => handleDelete(loan.id)}>Excluir</button>
          </div>
        </div>
      ))}
    </div>
  )
}

const s = {
  page: { maxWidth: 900, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  pageTitle: { margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#1e293b' },
  pageSubtitle: { margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' },
  btnPrimary: { padding: '0.55rem 1.2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  btnSecondary: { padding: '0.55rem 1.2rem', background: '#fff', color: '#64748b', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  kpiCard: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  kpiLabel: { color: '#64748b', fontSize: '0.82rem', fontWeight: 500 },
  kpiValue: { fontSize: '1.5rem', fontWeight: 700 },
  formCard: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #6366f1' },
  formTitle: { margin: '0 0 1.25rem', color: '#1e293b', fontSize: '1rem', fontWeight: 700 },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: 160 },
  label: { fontSize: '0.82rem', fontWeight: 600, color: '#374151' },
  input: { padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.92rem', color: '#1e293b', background: '#fff', outline: 'none' },
  formActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' },
  errorMsg: { margin: 0, padding: '0.5rem 0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: '0.85rem' },
  stateMsg: { color: '#64748b', textAlign: 'center', padding: '2rem 0' },
  empty: { textAlign: 'center', color: '#94a3b8', padding: '3rem 0' },
  loanCard: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '1.5rem', marginBottom: '1rem' },
  loanHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  loanHeaderLeft: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  loanName: { fontWeight: 700, fontSize: '1.05rem', color: '#1e293b' },
  loanCpf: { color: '#64748b', fontSize: '0.82rem' },
  statusBadge: { borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.78rem', fontWeight: 700 },
  loanGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' },
  loanStat: { display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  statLabel: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500 },
  statValue: { fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' },
  referrerInfo: { margin: '0.5rem 0', fontSize: '0.82rem', color: '#64748b' },
  loanDates: { display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' },
  loanActions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  btnView: { background: '#f1f5f9', border: 'none', color: '#1e293b', borderRadius: 8, padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
  btnPaid: { background: '#dcfce7', border: 'none', color: '#16a34a', borderRadius: 8, padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
  btnDelete: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' },
}
