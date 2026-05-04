import { useState, useEffect, useCallback } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'

const EMPTY_FORM = { name: '', color: '#6366f1' }

const PRESET_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#64748b',
]

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { const { data } = await getCategories(); setCategories(data) }
    catch { setError('Erro ao carregar categorias.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() { setEditingId(null); setForm(EMPTY_FORM); setFormError(''); setShowForm(true) }
  function openEdit(cat) { setEditingId(cat.id); setForm({ name: cat.name, color: cat.color }); setFormError(''); setShowForm(true) }
  function cancel() { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setFormError('') }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(''); setSaving(true)
    try {
      if (editingId) await updateCategory(editingId, form)
      else await createCategory(form)
      cancel(); await load()
    } catch { setFormError('Erro ao salvar categoria.') }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!window.confirm('Excluir esta categoria?')) return
    try { await deleteCategory(id); await load() }
    catch { alert('Erro ao excluir categoria.') }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Categorias</h1>
          <p style={s.pageSubtitle}>Organize seus gastos por categoria</p>
        </div>
        <button style={s.btnPrimary} onClick={openNew}>+ Nova Categoria</button>
      </div>

      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formRow}>
              <div style={{ ...s.field, flex: 2 }}>
                <label style={s.label}>Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  style={s.input}
                  placeholder="Ex: Alimentação"
                  required
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Cor</label>
                <div style={s.colorRow}>
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, color: c }))}
                      style={{
                        ...s.colorSwatch,
                        background: c,
                        outline: form.color === c ? `3px solid ${c}` : 'none',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                    style={s.colorPicker}
                    title="Cor personalizada"
                  />
                </div>
              </div>
            </div>
            {formError && <p style={s.errorMsg}>{formError}</p>}
            <div style={s.formActions}>
              <button type="button" style={s.btnSecondary} onClick={cancel} disabled={saving}>Cancelar</button>
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
          {categories.length === 0
            ? <p style={s.empty}>Nenhuma categoria cadastrada.</p>
            : categories.map(cat => (
              <div key={cat.id} style={s.row}>
                <div style={s.rowLeft}>
                  <span style={{ ...s.colorDot, background: cat.color }} />
                  <span style={s.name}>{cat.name}</span>
                </div>
                <div style={s.actions}>
                  <button style={s.btnEdit} onClick={() => openEdit(cat)}>Editar</button>
                  <button style={s.btnDelete} onClick={() => handleDelete(cat.id)}>Excluir</button>
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
  page: { maxWidth: 600, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  pageTitle: { margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#1e293b' },
  pageSubtitle: { margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' },
  btnPrimary: { padding: '0.55rem 1.2rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  btnSecondary: { padding: '0.55rem 1.2rem', background: '#fff', color: '#64748b', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' },
  formCard: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid #6366f1' },
  formTitle: { margin: '0 0 1.25rem', color: '#1e293b', fontSize: '1rem', fontWeight: 700 },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: 160 },
  label: { fontSize: '0.82rem', fontWeight: 600, color: '#374151' },
  input: { padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.92rem', color: '#1e293b', background: '#fff', outline: 'none' },
  colorRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' },
  colorSwatch: { width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 },
  colorPicker: { width: 28, height: 28, borderRadius: '50%', border: '1px solid #d1d5db', cursor: 'pointer', padding: 0 },
  formActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' },
  errorMsg: { margin: 0, padding: '0.5rem 0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: '0.85rem' },
  stateMsg: { color: '#64748b', textAlign: 'center', padding: '2rem 0' },
  listCard: { background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' },
  empty: { padding: '2.5rem', textAlign: 'center', color: '#94a3b8', margin: 0 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.5rem', borderBottom: '1px solid #f1f5f9' },
  rowLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  colorDot: { width: 14, height: 14, borderRadius: '50%', flexShrink: 0 },
  name: { fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  btnEdit: { background: 'transparent', border: '1px solid #6366f1', color: '#6366f1', borderRadius: 6, padding: '0.3rem 0.65rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  btnDelete: { background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, padding: '0.3rem 0.65rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
}
