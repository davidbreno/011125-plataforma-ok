import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FaBoxes,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaPills
} from 'react-icons/fa'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../firebase/config'

// Página de Estoque com três abas (Implante, Cirurgia, Dentística)
export default function Stock() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('implante')

  // Implante state
  const [implants, setImplants] = useState([])
  const [implantForm, setImplantForm] = useState({
    tipo: 'CMI', // CMI, HE, HI, TAPA
    comprimentoMm: '',
    diametroMm: '',
    quantidade: '',
    marca: ''
  })
  const [editingImplant, setEditingImplant] = useState(null)

  // Cirurgia state
  const [surgeryItems, setSurgeryItems] = useState([])
  const [surgeryForm, setSurgeryForm] = useState({
    nome: '',
    quantidade: '',
    observacoes: ''
  })

  // Dentística state
  const [dentistryItems, setDentistryItems] = useState([])
  const [dentistryForm, setDentistryForm] = useState({
    nome: '',
    quantidade: '',
    corLote: '',
    observacoes: ''
  })

  // Listeners
  useEffect(() => {
    const unsubImplants = onSnapshot(collection(db, 'stock_implants'), (snap) => {
      setImplants(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsubSurgery = onSnapshot(collection(db, 'stock_surgery'), (snap) => {
      setSurgeryItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    const unsubDent = onSnapshot(collection(db, 'stock_dentistry'), (snap) => {
      setDentistryItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => {
      unsubImplants(); unsubSurgery(); unsubDent()
    }
  }, [])

  // Helpers
  const resetImplantForm = () => {
    setImplantForm({ tipo: 'CMI', comprimentoMm: '', diametroMm: '', quantidade: '', marca: '' })
    setEditingImplant(null)
  }

  const saveImplant = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...implantForm,
        quantidade: parseInt(implantForm.quantidade) || 0,
        createdAt: serverTimestamp()
      }
      if (currentUser?.uid) payload.createdBy = currentUser.uid
      if (editingImplant) {
        await updateDoc(doc(db, 'stock_implants', editingImplant.id), payload)
        toast.success('Implante atualizado')
      } else {
        await addDoc(collection(db, 'stock_implants'), payload)
        toast.success('Implante adicionado')
      }
      resetImplantForm()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar implante')
    }
  }

  const deleteImplant = async (id) => {
    if (!window.confirm('Excluir este item?')) return
    try {
      await deleteDoc(doc(db, 'stock_implants', id))
      toast.success('Implante excluído')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao excluir')
    }
  }

  const saveSurgery = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...surgeryForm,
        quantidade: parseInt(surgeryForm.quantidade) || 0,
        createdAt: serverTimestamp()
      }
      if (currentUser?.uid) payload.createdBy = currentUser.uid
      await addDoc(collection(db, 'stock_surgery'), payload)
      toast.success('Material cirúrgico adicionado')
      setSurgeryForm({ nome: '', quantidade: '', observacoes: '' })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar material')
    }
  }

  const saveDentistry = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...dentistryForm,
        quantidade: parseInt(dentistryForm.quantidade) || 0,
        createdAt: serverTimestamp()
      }
      if (currentUser?.uid) payload.createdBy = currentUser.uid
      await addDoc(collection(db, 'stock_dentistry'), payload)
      toast.success('Material de dentística adicionado')
      setDentistryForm({ nome: '', quantidade: '', corLote: '', observacoes: '' })
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar material')
    }
  }

  return (
    <div className="min-h-screen p-8 bg-hero-dark">
      <header className="p-6 card-surface mb-6" style={{ borderRadius: '1.5rem' }}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Link to="/doctor" className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-light)' }}>
              <FaArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar ao Dashboard</span>
            </Link>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
              <FaBoxes className="text-xl" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Controle de Estoque</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Organize materiais por especialidade, acompanhe quantidades e atualize o estoque em tempo real.</p>
            </div>
          </div>

          <div className="flex gap-3">
            {['implante','cirurgia','dentistica'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-full font-medium"
                style={{
                  backgroundColor: activeTab === tab ? 'var(--color-primary)' : 'transparent',
                  color: activeTab === tab ? '#0b111b' : 'var(--color-text)'
                }}
              >
                {tab === 'implante' ? 'Implante' : tab === 'cirurgia' ? 'Cirurgia' : 'Dentística'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Implante */}
      {activeTab === 'implante' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-surface p-6">
            <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-text)' }}>ESTOQUE DE IMPLANTE</h2>
            {editingImplant && (
              <div className="mb-3 text-xs font-medium px-2 py-1 inline-block rounded" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}>
                Editando item de implante
              </div>
            )}
            <form onSubmit={saveImplant} className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>Tipo</label>
                <select
                  value={implantForm.tipo}
                  onChange={(e) => setImplantForm({ ...implantForm, tipo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option value="CMI">CMI</option>
                  <option value="HE">HE</option>
                  <option value="HI">HI</option>
                  <option value="TAPA">Tapa implante</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>Comprimento (mm)</label>
                  <input type="text" value={implantForm.comprimentoMm} onChange={(e)=>setImplantForm({...implantForm, comprimentoMm: e.target.value})} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color: 'var(--color-text)' }} placeholder="Ex: 11" />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>diametro (mm)</label>
                  <input type="text" value={implantForm.diametroMm} onChange={(e)=>setImplantForm({...implantForm, diametroMm: e.target.value})} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color: 'var(--color-text)' }} placeholder="Ex: 3.75" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>Quantidade</label>
                  <input type="number" value={implantForm.quantidade} onChange={(e)=>setImplantForm({...implantForm, quantidade: e.target.value})} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color: 'var(--color-text)' }} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>Marca</label>
                  <input type="text" value={implantForm.marca} onChange={(e)=>setImplantForm({...implantForm, marca: e.target.value})} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color: 'var(--color-text)' }} placeholder="Ex: Neoden" />
                </div>
              </div>

              <button type="submit" className="w-full btn-primary">Adicionar ao estoque</button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {implants.length === 0 ? (
              <div className="card-surface p-8 text-center" style={{ color: 'var(--color-text-light)' }}>Nenhum item cadastrado ainda.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {implants.map(item => (
                  <div key={item.id} className="card-surface p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-extrabold" style={{ color: 'var(--color-text)', fontSize: '0.95rem' }}>{item.tipo}</div>
                      <div className="text-sm md:text-base font-semibold" style={{ color: 'var(--color-text)' }}>{item.comprimentoMm || 'mm'} mm x {item.diametroMm || 'mm'} mm</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>Quantidade: <span style={{ color: 'var(--color-text)' }}>{item.quantidade}</span></div>
                      <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>Marca: <span style={{ color: 'var(--color-text)' }}>{item.marca || '-'}</span></div>
                      <FaPills style={{ color: 'var(--color-primary)' }} />
                      <button onClick={() => { setEditingImplant(item); setImplantForm({ tipo: item.tipo, comprimentoMm: item.comprimentoMm || '', diametroMm: item.diametroMm || '', quantidade: String(item.quantidade || ''), marca: item.marca || '' }) }} className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#ffffff', color: '#0b111b', fontWeight: 700, border: '1px solid var(--color-border)' }}>Editar</button>
                      <button onClick={() => deleteImplant(item.id)} className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cirurgia */}
      {activeTab === 'cirurgia' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-surface p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
                <FaPills className="text-xl" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Materiais de cirurgia</h2>
                <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Cadastre materiais cirúrgicos, registre quantidades e anote observações importantes.</p>
              </div>
            </div>
            <form onSubmit={saveSurgery} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>Nome do material</label>
                <input type="text" value={surgeryForm.nome} onChange={(e)=>setSurgeryForm({...surgeryForm, nome:e.target.value})} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }} placeholder="Ex: Sutura nylon 4-0" />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>Quantidade</label>
                <input type="number" value={surgeryForm.quantidade} onChange={(e)=>setSurgeryForm({...surgeryForm, quantidade:e.target.value})} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>Observacoes</label>
                <textarea rows="3" value={surgeryForm.observacoes} onChange={(e)=>setSurgeryForm({...surgeryForm, observacoes:e.target.value})} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }} placeholder="Validade, fornecedor, caixa, etc. (opcional)" />
              </div>
              <button type="submit" className="w-full btn-primary">Adicionar ao estoque</button>
            </form>
          </div>
          <div className="card-surface p-6">
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Itens cadastrados</h3>
            {surgeryItems.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--color-text-light)' }}>Nenhum material cirúrgico registrado ainda.</div>
            ) : (
              <ul className="space-y-2">
                {surgeryItems.map(it => (
                  <li key={it.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)' }}>
                    <span style={{ color: '#0b111b', fontWeight: 600 }}>{it.nome} • {it.quantidade}</span>
                    <button onClick={() => deleteDoc(doc(db, 'stock_surgery', it.id))} className="px-3 py-1 rounded" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>Excluir</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Dentística */}
      {activeTab === 'dentistica' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-surface p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
                <FaPills className="text-xl" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Materiais de dentística</h2>
                <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Controle resinas, adesivos e outros materiais restauradores.</p>
              </div>
            </div>
            <form onSubmit={saveDentistry} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>Nome do material</label>
                <input type="text" value={dentistryForm.nome} onChange={(e)=>setDentistryForm({...dentistryForm, nome:e.target.value})} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }} placeholder="Ex: Resina A2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>Quantidade</label>
                  <input type="number" value={dentistryForm.quantidade} onChange={(e)=>setDentistryForm({...dentistryForm, quantidade:e.target.value})} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>Cor / Lote</label>
                  <input type="text" value={dentistryForm.corLote} onChange={(e)=>setDentistryForm({...dentistryForm, corLote:e.target.value})} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }} placeholder="Ex: A2, B1, 3M" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>Observacoes</label>
                <textarea rows="3" value={dentistryForm.observacoes} onChange={(e)=>setDentistryForm({...dentistryForm, observacoes:e.target.value})} className="w-full px-3 py-2 rounded-lg outline-none" style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }} placeholder="Validade, uso clinico, reposicao prevista, etc." />
              </div>
              <button type="submit" className="w-full btn-primary">Adicionar ao estoque</button>
            </form>
          </div>
          <div className="card-surface p-6">
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Itens cadastrados</h3>
            {dentistryItems.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--color-text-light)' }}>Nenhum material registrado no momento.</div>
            ) : (
              <ul className="space-y-2">
                {dentistryItems.map(it => (
                  <li key={it.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)' }}>
                    <span style={{ color: '#0b111b', fontWeight: 600 }}>{it.nome} • {it.quantidade} • {it.corLote}</span>
                    <button onClick={() => deleteDoc(doc(db, 'stock_dentistry', it.id))} className="px-3 py-1 rounded" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>Excluir</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
