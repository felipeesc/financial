import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLoan, registerPayment, deletePayment } from '../api/loans'

function formatCurrency(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(d) {
  if (!d) return '—'
  const [y, m, day] = String(d).split('T')[0].split('-')
  return `${day}/${m}/${y}`
}
function formatCpf(cpf) {
  const d = cpf.replace(/\D/g, '')
  return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf
}

export default function LoanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loan, setLoan] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ paymentDate: '', totalAmount: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getLoan(id)
      setLoan(data)
      setPayments(data.payments ?? [])
    } catch { navigate('/loans') }
    finally { setLoading(false) }
  }, [id, navigate])

  useEffect(() => { load() }, [load])

  function cancelForm() { setShowForm(false); setForm({ paymentDate: '', totalAmount: '', notes: '' }); setFormError('') }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setSaving(true)
    try {
      await registerPayment(id, {
        paymentDate: form.paymentDate,
        totalAmount: parseFloat(form.totalAmount),
        notes: form.notes.trim() || null,
      })
      cancelForm(); await load()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erro ao registrar pagamento.')
    } finally { setSaving(false) }
  }

  async function handleDeletePayment(paymentId) {
    if (!window.confirm('Remover este pagamento?')) return
    try { await deletePayment(id, paymentId); await load() }
    catch { alert('Erro ao remover pagamento.') }
  }

  if (loading) return <div style={{ padding: '2rem', color: '#64748b' }}>Carregando...</div>
  if (!loan) return null

  const expectedMonthly = Number(loan.monthlyTotal)

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => navigate('/loans')}>← Voltar</button>

      {/* Header do empréstimo */}
      <div style={s.card}>
        <div style={s.loanHeader}>
          <div>
            <h1 style={s.name}>{loan.borrowerName}</h1>
            <span style={s.cpf}>{formatCpf(loan.borrowerCpf)}</span>
          </div>
          <span style={{ ...s.statusBadge, background: loan.status === 'PAID' ? '#dcfce7' : '#ede9fe', color: loan.status === 'PAID' ? '#16a34a' : '#6366f1' }}>
            {loan.status === 'PAID' ? 'Quitado' : 'Ativo'}
          </span>
        </div>

        <div style={s.statsGrid}>
          <div style={s.stat}>
            <span style={s.statLabel}>Principal</span>
            <span style={s.statValue}>{formatCurrency(loan.principalAmount)}</span>
          </div>
          <div style={s.stat}>
            <span style={s.statLabel}>Taxa total</span>
            <span style={s.statValue}>{loan.interestRate}%</span>
          </div>
          <div style={s.stat}>
            <span style={s.statLabel}>Juros esperado/mês</span>
            <span style={s.statValue}>{formatCurrency(expectedMonthly)}</span>
          </div>
          <div style={s.stat}>
            <span style={s.statLabel}>Data empréstimo</span>
            <span style={s.statValue}>{formatDate(loan.loanDate)}</span>
          </div>
          {loan.dueDate && (
            <div style={s.stat}>
              <span style={s.statLabel}>Vencimento</span>
              <span style={s.statValue}>{formatDate(loan.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Split de taxas */}
        <div style={s.splitRow}>
          <div style={s.splitCard}>
            <span style={s.splitLabel}>Minha parte ({loan.userRate}%)</span>
            <span style={{ ...s.splitValue, color: '#10b981' }}>{formatCurrency(loan.monthlyUser)}/mês</span>
            <span style={s.splitTotal}>Total recebido: {formatCurrency(loan.totalUserReceived)}</span>
          </div>
          {Number(loan.referrerRate) > 0 && (
            <div style={s.splitCard}>
              <span style={s.splitLabel}>Indicação — {loan.referrerName ?? 'sem nome'} ({loan.referrerRate}%)</span>
              <span style={{ ...s.splitValue, color: '#f59e0b' }}>{formatCurrency(loan.monthlyReferrer)}/mês</span>
              <span style={s.splitTotal}>Total repassado: {formatCurrency(loan.totalReferrerReceived)}</span>
            </div>
          )}
        </div>

        {/* Totais */}
        <div style={s.totalRow}>
          <div>
            <span style={s.totalLabel}>Total recebido (juros)</span>
            <span style={s.totalValue}>{formatCurrency(loan.totalReceived)}</span>
          </div>
          <div>
            <span style={s.totalLabel}>{loan.paymentCount} pagamentos registrados</span>
          </div>
        </div>
      </div>

      {/* Registrar pagamento */}
      <div style={s.sectionHeader}>
        <h2 style={s.sectionTitle}>Pagamentos de juros</h2>
        {loan.status === 'ACTIVE' && !showForm && (
          <button style={s.btnPrimary} onClick={() => setShowForm(true)}>+ Registrar pagamento</button>
        )}
      </div>

      {showForm && (
        <div style={s.formCard}>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formRow}>
              <div style={s.field}>
                <label style={s.label}>Data do recebimento</label>
                <input type="date" value={form.paymentDate} onChange={e => setForm(p => ({ ...p, paymentDate: e.target.value }))} style={s.input} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Valor recebido (R$)</label>
                <input type="number" value={form.totalAmount} onChange={e => setForm(p => ({ ...p, totalAmount: e.target.value }))} style={s.input}
                  placeholder={formatCurrency(expectedMonthly)} min="0.01" step="0.01" required />
              </div>
              <div style={{ ...s.field, flex: 2 }}>
                <label style={s.label}>Observação</label>
                <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={s.input} placeholder="Opcional..." />
              </div>
            </div>
            {formError && <p style={s.errorMsg}>{formError}</p>}
            <div style={{ ...s.formRow, justifyContent: 'flex-end' }}>
              <button type="button" style={s.btnSecondary} onClick={cancelForm} disabled={saving}>Cancelar</button>
              <button type="submit" style={{ ...s.btnPrimary, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                {saving ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de pagamentos */}
      {payments.length === 0
        ? <p style={s.empty}>Nenhum pagamento registrado ainda.</p>
        : (
          <div style={s.card}>
            {payments.map((p, i) => (
              <div key={p.id} style={{ ...s.paymentRow, borderTop: i === 0 ? 'none' : '1px solid #f1f5f9' }}>
                <div style={s.paymentLeft}>
                  <span style={s.paymentDate}>{formatDate(p.paymentDate)}</span>
                  {p.notes && <span style={s.paymentNotes}>{p.notes}</span>}
                </div>
                <div style={s.paymentAmounts}>
                  <div style={s.paymentAmountRow}>
                    <span style={s.amtLabel}>Total</span>
                    <span style={s.amtValue}>{formatCurrency(p.totalAmount)}</span>
                  </div>
                  <div style={s.paymentAmountRow}>
                    <span style={{ ...s.amtLabel, color: '#10b981' }}>Meu</span>
                    <span style={{ ...s.amtValue, color: '#10b981' }}>{formatCurrency(p.userAmount)}</span>
                  </div>
                  {Number(p.referrerAmount) > 0 && (
                    <div style={s.paymentAmountRow}>
                      <span style={{ ...s.amtLabel, color: '#f59e0b' }}>Indicação</span>
                      <span style={{ ...s.amtValue, color: '#f59e0b' }}>{formatCurrency(p.referrerAmount)}</span>
                    </div>
                  )}
                </div>
                <button style={s.btnRemove} onClick={() => handleDeletePayment(p.id)}>✕</button>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

const s = {
  page: { maxWidth: 800, margin: '0 auto' },
  backBtn: { background: 'transparent', border: 'none', color: '#6366f1', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', padding: '0 0 1.25rem', display: 'block' },
  card: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '1.5rem', marginBottom: '1.5rem' },
  loanHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' },
  name: { margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' },
  cpf: { color: '#64748b', fontSize: '0.85rem' },
  statusBadge: { borderRadius: 20, padding: '0.25rem 0.85rem', fontSize: '0.8rem', fontWeight: 700 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.25rem' },
  stat: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  statLabel: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500 },
  statValue: { fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' },
  splitRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' },
  splitCard: { flex: 1, minWidth: 200, background: '#f8fafc', borderRadius: 8, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  splitLabel: { fontSize: '0.78rem', color: '#64748b', fontWeight: 600 },
  splitValue: { fontSize: '1.1rem', fontWeight: 700 },
  splitTotal: { fontSize: '0.78rem', color: '#94a3b8' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '2px solid #f1f5f9' },
  totalLabel: { display: 'block', fontSize: '0.82rem', color: '#64748b' },
  totalValue: { fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' },
  btnPrimary: { padding: '0.5rem 1.1rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' },
  btnSecondary: { padding: '0.5rem 1.1rem', background: '#fff', color: '#64748b', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' },
  formCard: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '1.25rem', marginBottom: '1.5rem', borderLeft: '4px solid #6366f1' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: 140 },
  label: { fontSize: '0.82rem', fontWeight: 600, color: '#374151' },
  input: { padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.92rem', color: '#1e293b', background: '#fff', outline: 'none' },
  errorMsg: { margin: 0, padding: '0.5rem 0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: '0.85rem' },
  empty: { textAlign: 'center', color: '#94a3b8', padding: '2rem 0' },
  paymentRow: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 0' },
  paymentLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' },
  paymentDate: { fontWeight: 600, color: '#1e293b', fontSize: '0.92rem' },
  paymentNotes: { color: '#64748b', fontSize: '0.78rem' },
  paymentAmounts: { display: 'flex', gap: '1.25rem', flexWrap: 'wrap' },
  paymentAmountRow: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem' },
  amtLabel: { fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 },
  amtValue: { fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' },
  btnRemove: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem' },
}
