import { useState, useEffect, useCallback } from 'react'
import { getFixedCosts, createFixedCost, updateFixedCost, deleteFixedCost } from '../api/fixedCosts'

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const EMPTY_FORM = { name: '', amount: '', dueDay: '' }

export default function FixedCosts() {
  const [fixedCosts, setFixedCosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const { data } = await getFixedCosts(); setFixedCosts(data) }
    catch { setError('Erro ao carregar custos fixos.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const active = fixedCosts.filter(c => c.active !== false)
  const totalFixed = active.reduce((sum, c) => sum + Number(c.amount), 0)

  function handleFormChange(e) { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })) }

  function openNew() { setEditingId(null); setForm(EMPTY_FORM); setFormError(''); setShowForm(true) }

  function openEdit(cost) {
    setEditingId(cost.id)
    setForm({ name: cost.name, amount: String(cost.amount), dueDay: String(cost.dueDay ?? '') })
    setFormError(''); setShowForm(true)
  }

  function cancelForm() { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setFormError('') }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setSaving(true)
    const payload = {
      name: form.name.trim(),
      amount: parseFloat(form.amount),
      dueDay: form.dueDay ? parseInt(form.dueDay, 10) : null,
      active: true,
    }
    try {
      if (editingId) await updateFixedCost(editingId, payload)
      else await createFixedCost(payload)
      cancelForm(); await load()
    } catch { setFormError('Erro ao salvar custo fixo.') }
    finally { setSaving(false) }
  }

  async function handleToggle(cost) {
    try {
      await updateFixedCost(cost.id, { name: cost.name, amount: cost.amount, dueDay: cost.dueDay, active: !cost.active })
      await load()
    } catch { alert('Erro ao atualizar.') }
  }

  async function handleDelete(id) {
    if (!window.confirm('Excluir este custo fixo?')) return
    try { await deleteFixedCost(id); await load() }
    catch { alert('Erro ao excluir.') }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Custos Fixos</h1>
          <p style={s.pageSubtitle}>Despesas recorrentes todo mês</p>
        </div>
        <button style={s.btnPrimary} onClick={openNew}>+ Novo Custo Fixo</button>
      </div>

      <div style={s.summaryCard}>
        <span style={s.summaryLabel}>Total fixo mensal (ativos)</span>
        <span style={s.summaryValue}>{formatCurrency(totalFixed)}</span>
      </div>

      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>{editingId ? 'Editar Custo Fixo' : 'Novo Custo Fixo'}</h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formRow}>
              <div style={{ ...s.field, flex: 2 }}>
                <label style={s.label}>Nome</label>
                <input type="text" name="name" value={form.name} onChange={handleFormChange} style={s.input} placeholder="Ex: Aluguel" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Valor (R$)</label>
                <input type="number" name="amount" value={form.amount} onChange={handleFormChange} style={s.input} placeholder="0,00" min="0.01" step="0.01" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Dia de Vencimento</label>
                <input type="number" name="dueDay" value={form.dueDay} onChange={handleFormChange} style={s.input} placeholder="1–31" min="1" max="31" />
              </div>
            </div>
            {formError && <p style={s.errorMsg}>{formError}</p>}
            <div style={s.formActions}>
              <button type="button" style={s.btnSecondary} onClick={cancelForm} disabled={saving}>Cancelar</button>
              <button type="submit" style={{ ...s.btnPrimary, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p style={s.stateMsg}>Carregando...</p>}
      {error && <p style={s.errorMsg}>{error}</p>}

      {!loading && !error && (
        <div style={s.listCard}>
          {fixedCosts.length === 0
            ? <p style={s.empty}>Nenhum custo fixo cadastrado.</p>
            : fixedCosts.map(cost => (
              <div key={cost.id} style={{ ...s.costRow, opacity: cost.active === false ? 0.5 : 1 }}>
                <div style={s.costInfo}>
                  <span style={s.costName}>{cost.name}</span>
                  <span style={s.costDue}>Vence dia {cost.dueDay ?? '—'}</span>
                </div>
                <span style={s.costAmount}>{formatCurrency(cost.amount)}</span>
                <div style={s.costActions}>
                  <button
                    style={{ ...s.toggleBtn, background: cost.active !== false ? '#dcfce7' : '#f1f5f9', color: cost.active !== false ? '#16a34a' : '#64748b' }}
                    onClick={() => handleToggle(cost)}
                  >
                    {cost.active !== false ? 'Ativo' : 'Inativo'}
                  </button>
                  <button style={s.btnEdit} onClick={() => openEdit(cost)}>Editar</button>
                  <button style={s.btnDelete} onClick={() => handleDelete(cost.id)}>Excluir</button>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}

const s = {
  page: { maxWidth: 760, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  pageTitle: { margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#1e293b' },
  pageSubtitle: { margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' },
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
  listCard: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' },
  empty: { padding: '2.5rem', textAlign: 'center', color: '#94a3b8', margin: 0 },
  costRow: { display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', gap: '1rem' },
  costInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  costName: { fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' },
  costDue: { color: '#64748b', fontSize: '0.82rem' },
  costAmount: { fontWeight: 700, fontSize: '1rem', color: '#1e293b', minWidth: 100, textAlign: 'right' },
  costActions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  toggleBtn: { border: 'none', borderRadius: 20, padding: '0.3rem 0.8rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' },
  btnEdit: { background: 'transparent', border: '1px solid #6366f1', color: '#6366f1', borderRadius: 6, padding: '0.3rem 0.65rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  btnDelete: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '0.3rem 0.65rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
}
