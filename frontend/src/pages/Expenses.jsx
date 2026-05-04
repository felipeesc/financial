import { useState, useEffect, useCallback } from 'react'
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenses'
import { getCategories } from '../api/categories'

const PAYMENT_METHODS = ['Dinheiro', 'Pix', 'Débito', 'Crédito']
import { useIsMobile } from '../hooks/useIsMobile'

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function formatDate(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}

const EMPTY_FORM = { expenseDate: '', categoryId: '', paymentMethod: '', description: '', amount: '' }

export default function Expenses() {
  const [month, setMonth] = useState(currentMonth)
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const loadExpenses = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data } = await getExpenses(month)
      setExpenses([...data].sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate)))
    } catch { setError('Erro ao carregar gastos.') }
    finally { setLoading(false) }
  }, [month])

  useEffect(() => { loadExpenses() }, [loadExpenses])
  useEffect(() => {
    getCategories().then(({ data }) => setCategories(data))
  }, [])

  const isMobile = useIsMobile()
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  function openNewForm() { setEditingId(null); setForm(EMPTY_FORM); setFormError(''); setShowForm(true) }
  function openEditForm(exp) {
    setEditingId(exp.id)
    setForm({
      expenseDate: exp.expenseDate?.split('T')[0] ?? '',
      categoryId: String(exp.categoryId ?? ''),
      paymentMethod: exp.paymentMethodName ?? '',
      description: exp.description,
      amount: String(exp.amount),
    })
    setFormError(''); setShowForm(true)
  }
  function cancelForm() { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setFormError('') }
  function handleFormChange(e) { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })) }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setSaving(true)
    const payload = {
      expenseDate: form.expenseDate,
      categoryId: form.categoryId || null,
      paymentMethod: form.paymentMethod || null,
      description: form.description.trim(),
      amount: parseFloat(form.amount),
    }
    try {
      if (editingId) await updateExpense(editingId, payload)
      else await createExpense(payload)
      cancelForm(); await loadExpenses()
    } catch { setFormError('Erro ao salvar gasto. Verifique os dados.') }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Excluir este gasto?')) return
    try { await deleteExpense(id); await loadExpenses() }
    catch { alert('Erro ao excluir gasto.') }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Gastos</h1>
          <p style={s.pageSubtitle}>Gerencie seus gastos mensais</p>
        </div>
        <div style={s.headerActions}>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} style={s.monthInput} />
          <button style={s.btnPrimary} onClick={openNewForm}>+ Novo Gasto</button>
        </div>
      </div>

      <div style={s.summaryCard}>
        <span style={s.summaryLabel}>Total do mês</span>
        <span style={s.summaryValue}>{formatCurrency(total)}</span>
      </div>

      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>{editingId ? 'Editar Gasto' : 'Novo Gasto'}</h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formRow}>
              <div style={s.field}>
                <label style={s.label}>Data</label>
                <input type="date" name="expenseDate" value={form.expenseDate} onChange={handleFormChange} style={s.input} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Categoria</label>
                <select name="categoryId" value={form.categoryId} onChange={handleFormChange} style={s.input}>
                  <option value="">Sem categoria</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Forma de Pagamento</label>
                <select name="paymentMethod" value={form.paymentMethod} onChange={handleFormChange} style={s.input}>
                  <option value="">Selecione...</option>
                  {PAYMENT_METHODS.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                </select>
              </div>
            </div>
            <div style={s.formRow}>
              <div style={{ ...s.field, flex: 2 }}>
                <label style={s.label}>Descrição</label>
                <input type="text" name="description" value={form.description} onChange={handleFormChange} style={s.input} placeholder="Ex: Supermercado" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Valor (R$)</label>
                <input type="number" name="amount" value={form.amount} onChange={handleFormChange} style={s.input} placeholder="0,00" min="0.01" step="0.01" required />
              </div>
            </div>
            {formError && <p style={s.errorMsg}>{formError}</p>}
            <div style={s.formActions}>
              <button type="button" style={s.btnSecondary} onClick={cancelForm} disabled={saving}>Cancelar</button>
              <button type="submit" style={{ ...s.btnPrimary, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p style={s.stateMsg}>Carregando gastos...</p>}
      {error && <p style={s.errorMsg}>{error}</p>}

      {!loading && !error && (
        <div style={s.tableCard}>
          {expenses.length === 0
            ? <p style={s.empty}>Nenhum gasto registrado para este mês.</p>
            : isMobile
              ? expenses.map(exp => (
                <div key={exp.id} style={s.mobileCard}>
                  <div style={s.mobileCardTop}>
                    <div style={s.categoryCell}>
                      <span style={{ ...s.colorDot, background: exp.categoryColor ?? '#94a3b8' }} />
                      <span style={s.mobileDesc}>{exp.description}</span>
                    </div>
                    <span style={s.mobileAmount}>{formatCurrency(exp.amount)}</span>
                  </div>
                  <div style={s.mobileCardBottom}>
                    <span style={s.mobileMeta}>
                      {formatDate(exp.expenseDate)}
                      {exp.categoryName ? ` · ${exp.categoryName}` : ''}
                      {exp.paymentMethodName ? ` · ${exp.paymentMethodName}` : ''}
                    </span>
                    <div style={s.actionsCell}>
                      <button style={s.btnEdit} onClick={() => openEditForm(exp)}>Editar</button>
                      <button style={s.btnDelete} onClick={() => handleDelete(exp.id)}>Excluir</button>
                    </div>
                  </div>
                </div>
              ))
              : (
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Data', 'Descrição', 'Categoria', 'Pagamento', 'Valor', ''].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(exp => (
                    <tr key={exp.id} style={s.tr}>
                      <td style={s.td}>{formatDate(exp.expenseDate)}</td>
                      <td style={s.td}>{exp.description}</td>
                      <td style={s.td}>
                        <div style={s.categoryCell}>
                          <span style={{ ...s.colorDot, background: exp.categoryColor ?? '#94a3b8' }} />
                          {exp.categoryName ?? '—'}
                        </div>
                      </td>
                      <td style={s.td}>{exp.paymentMethodName ?? '—'}</td>
                      <td style={{ ...s.td, ...s.amountCell }}>{formatCurrency(exp.amount)}</td>
                      <td style={{ ...s.td, ...s.actionsCell }}>
                        <button style={s.btnEdit} onClick={() => openEditForm(exp)}>Editar</button>
                        <button style={s.btnDelete} onClick={() => handleDelete(exp.id)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      )}
    </div>
  )
}

const s = {
  page: { maxWidth: 960, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  pageTitle: { margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#1e293b' },
  pageSubtitle: { margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' },
  headerActions: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  monthInput: { padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.9rem', color: '#1e293b', background: '#fff' },
  btnPrimary: { padding: '0.55rem 1.2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  btnSecondary: { padding: '0.55rem 1.2rem', background: '#fff', color: '#64748b', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  summaryCard: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  summaryLabel: { color: '#64748b', fontSize: '0.95rem', fontWeight: 500 },
  summaryValue: { color: '#6366f1', fontSize: '1.5rem', fontWeight: 700 },
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
  tableCard: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' },
  empty: { padding: '2.5rem', textAlign: 'center', color: '#94a3b8', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '0.85rem 1rem', fontSize: '0.9rem', color: '#1e293b', verticalAlign: 'middle' },
  categoryCell: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  colorDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  amountCell: { fontWeight: 600 },
  actionsCell: { whiteSpace: 'nowrap' },
  btnEdit: { background: 'transparent', border: '1px solid #6366f1', color: '#6366f1', borderRadius: 6, padding: '0.3rem 0.65rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginRight: '0.4rem' },
  btnDelete: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '0.3rem 0.65rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  mobileCard: { padding: '0.9rem 1.25rem', borderBottom: '1px solid #f1f5f9' },
  mobileCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', gap: '0.5rem' },
  mobileDesc: { fontWeight: 600, color: '#1e293b', fontSize: '0.92rem' },
  mobileAmount: { fontWeight: 700, color: '#1e293b', fontSize: '1rem', whiteSpace: 'nowrap' },
  mobileCardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' },
  mobileMeta: { color: '#64748b', fontSize: '0.78rem', flex: 1 },
}
