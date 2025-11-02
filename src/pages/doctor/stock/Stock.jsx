import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  FaBoxes, 
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaPills,
  FaExclamationTriangle
} from 'react-icons/fa'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function Stock() {
  const { currentUser } = useAuth()
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'medicamento',
    quantity: '',
    unit: 'un',
    minQuantity: '',
    supplier: '',
    notes: ''
  })

  // Fetch stock items
  useEffect(() => {
    const itemsRef = collection(db, 'stock')
    const unsubscribe = onSnapshot(itemsRef, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setItems(itemsData)
      setFilteredItems(itemsData)
    })
    return () => unsubscribe()
  }, [])

  // Search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredItems(filtered)
    } else {
      setFilteredItems(items)
    }
  }, [searchTerm, items])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        const updatePayload = {
          ...formData,
          quantity: parseInt(formData.quantity),
          minQuantity: parseInt(formData.minQuantity),
          updatedAt: serverTimestamp()
        }
        await updateDoc(doc(db, 'stock', editingItem.id), updatePayload)
        toast.success('Item atualizado com sucesso!')
      } else {
        const createPayload = {
          ...formData,
          quantity: parseInt(formData.quantity),
          minQuantity: parseInt(formData.minQuantity),
          createdAt: serverTimestamp(),
        }
        if (currentUser?.uid) createPayload.createdBy = currentUser.uid
        await addDoc(collection(db, 'stock'), createPayload)
        toast.success('Item adicionado com sucesso!')
      }
      setShowModal(false)
      setEditingItem(null)
      setFormData({
        name: '',
        category: 'medicamento',
        quantity: '',
        unit: 'un',
        minQuantity: '',
        supplier: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erro ao salvar item')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      category: item.category || 'medicamento',
      quantity: item.quantity?.toString() || '',
      unit: item.unit || 'un',
      minQuantity: item.minQuantity?.toString() || '',
      supplier: item.supplier || '',
      notes: item.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (itemId) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await deleteDoc(doc(db, 'stock', itemId))
        toast.success('Item excluído com sucesso!')
      } catch (error) {
        console.error('Error:', error)
        toast.error('Erro ao excluir item')
      }
    }
  }

  const isLowStock = (item) => {
    return item.quantity <= item.minQuantity
  }

  return (
    <div className="min-h-screen p-8 bg-hero-dark">
      {/* Header */}
      <header className="p-6 card-surface mb-6" style={{ borderRadius: '1.5rem' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link 
              to="/doctor"
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-light)' }}
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar ao Dashboard</span>
            </Link>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
              <FaBoxes className="text-xl" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Estoque</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Gerencie medicamentos e materiais</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Novo Item
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Search Bar */}
        <div className="card-surface p-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-light)' }} />
            <input
              type="text"
              placeholder="Buscar por nome ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg w-full outline-none"
              style={{ 
                backgroundColor: 'var(--color-bg)', 
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>
        </div>

        {/* Stock Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className={`card-surface p-6 ${isLowStock(item) ? 'border-2 border-red-500' : ''}`}>
              {isLowStock(item) && (
                <div className="flex items-center gap-2 mb-3 p-2 rounded" style={{ backgroundColor: '#fee2e2' }}>
                  <FaExclamationTriangle style={{ color: '#dc2626' }} />
                  <span className="text-sm font-medium" style={{ color: '#dc2626' }}>Estoque baixo!</span>
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
                    <FaPills className="text-xl" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>{item.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>{item.category}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-light)' }}>Quantidade:</span>
                  <span className="font-semibold" style={{ color: isLowStock(item) ? '#dc2626' : 'var(--color-text)' }}>
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-light)' }}>Mínimo:</span>
                  <span style={{ color: 'var(--color-text)' }}>{item.minQuantity} {item.unit}</span>
                </div>
                {item.supplier && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--color-text-light)' }}>Fornecedor:</span>
                    <span style={{ color: 'var(--color-text)' }}>{item.supplier}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#0b111b' }}
                >
                  <FaEdit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="py-2 px-3 rounded-lg transition-colors"
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="card-surface p-12 text-center">
            <FaBoxes className="text-6xl mx-auto mb-4" style={{ color: 'var(--color-text-light)', opacity: 0.3 }} />
            <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>
              {searchTerm ? 'Nenhum item encontrado' : 'Nenhum item no estoque'}
            </p>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card-surface p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              {editingItem ? 'Editar Item' : 'Novo Item'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Nome do Item *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Categoria *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <option value="medicamento">Medicamento</option>
                    <option value="material">Material</option>
                    <option value="equipamento">Equipamento</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Unidade *
                  </label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <option value="un">Unidade</option>
                    <option value="cx">Caixa</option>
                    <option value="fr">Frasco</option>
                    <option value="kg">Kg</option>
                    <option value="l">Litro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Quantidade Mínima *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({...formData, minQuantity: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Observações
                  </label>
                  <textarea
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none resize-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingItem ? 'Atualizar' : 'Cadastrar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingItem(null)
                    setFormData({
                      name: '',
                      category: 'medicamento',
                      quantity: '',
                      unit: 'un',
                      minQuantity: '',
                      supplier: '',
                      notes: ''
                    })
                  }}
                  className="px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
