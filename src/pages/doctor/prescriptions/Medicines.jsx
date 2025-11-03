import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import LogoutButton from '../../../components/LogoutButton'
import { 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Plus,
  Search,
  Filter,
  FileText,
  Pill,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Package,
  Activity
} from 'lucide-react'
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function Medicines() {
  const { currentUser } = useAuth()
  const [medicines, setMedicines] = useState([])
  const [filteredMedicines, setFilteredMedicines] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    strength: '',
    form: '',
    manufacturer: '',
    description: '',
    sideEffects: '',
    contraindications: '',
    dosageInstructions: '',
    storageInstructions: '',
    price: '',
    stockQuantity: '',
    reorderLevel: '',
    isActive: true
  })

  // Fetch medicines
  useEffect(() => {
    if (!currentUser) return

    setLoading(true)
    
    const medicinesRef = collection(db, 'medicines')
    const q = query(medicinesRef, orderBy('name', 'asc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const medicinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMedicines(medicinesData)
      setFilteredMedicines(medicinesData)
      setLoading(false)
      
      if (medicinesData.length > 0) {
        toast.success(`Loaded ${medicinesData.length} medicines`)
      } else {
        toast.success('No medicines found')
      }
    }, (error) => {
      console.error('Error fetching medicines:', error)
      toast.error('Error loading medicines')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  useEffect(() => {
    let filtered = medicines

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(medicine => medicine.category === filterCategory)
    }

    setFilteredMedicines(filtered)
  }, [medicines, searchTerm, filterCategory])

  const handleCreateMedicine = () => {
    setFormData({
      name: '',
      category: '',
      strength: '',
      form: '',
      manufacturer: '',
      description: '',
      sideEffects: '',
      contraindications: '',
      dosageInstructions: '',
      storageInstructions: '',
      price: '',
      stockQuantity: '',
      reorderLevel: '',
      isActive: true
    })
    setShowCreateModal(true)
  }

  const handleEditMedicine = (medicine) => {
    setSelectedMedicine(medicine)
    setFormData({
      name: medicine.name || '',
      category: medicine.category || '',
      strength: medicine.strength || '',
      form: medicine.form || '',
      manufacturer: medicine.manufacturer || '',
      description: medicine.description || '',
      sideEffects: medicine.sideEffects || '',
      contraindications: medicine.contraindications || '',
      dosageInstructions: medicine.dosageInstructions || '',
      storageInstructions: medicine.storageInstructions || '',
      price: medicine.price || '',
      stockQuantity: medicine.stockQuantity || '',
      reorderLevel: medicine.reorderLevel || '',
      isActive: medicine.isActive !== false
    })
    setShowEditModal(true)
  }

  const handleDeleteMedicine = async (medicineId) => {
    if (window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'medicines', medicineId))
        toast.success('Medicine deleted successfully!')
      } catch (error) {
        console.error('Error deleting medicine:', error)
        toast.error(`Error deleting medicine: ${error.message}`)
      }
    }
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter medicine name')
      return false
    }
    if (!formData.category.trim()) {
      toast.error('Please select category')
      return false
    }
    if (!formData.strength.trim()) {
      toast.error('Please enter strength')
      return false
    }
    if (!formData.form.trim()) {
      toast.error('Please select form')
      return false
    }
    if (!formData.manufacturer.trim()) {
      toast.error('Please enter manufacturer')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const medicineData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        reorderLevel: parseInt(formData.reorderLevel) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      if (currentUser?.uid) medicineData.createdBy = currentUser.uid
      
      if (showEditModal) {
        // Update existing medicine
        await updateDoc(doc(db, 'medicines', selectedMedicine.id), {
          ...medicineData,
          updatedAt: new Date().toISOString()
        })
        toast.success('Medicine updated successfully!')
        setShowEditModal(false)
      } else {
        // Create new medicine
        await addDoc(collection(db, 'medicines'), medicineData)
        toast.success('Medicine created successfully!')
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error saving medicine:', error)
      toast.error(`Error saving medicine: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'antibiotics': return 'text-red-400 bg-red-400/10'
      case 'painkillers': return 'text-orange-400 bg-orange-400/10'
      case 'vitamins': return 'text-yellow-400 bg-yellow-400/10'
      case 'diabetes': return 'text-blue-400 bg-blue-400/10'
      case 'cardiology': return 'text-purple-400 bg-purple-400/10'
      case 'dermatology': return 'text-green-400 bg-green-400/10'
      case 'psychiatry': return 'text-pink-400 bg-pink-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStockStatus = (quantity, reorderLevel) => {
    if (quantity <= 0) return { status: 'out_of_stock', color: 'text-red-400 bg-red-400/10', text: 'Out of Stock' }
    if (quantity <= reorderLevel) return { status: 'low_stock', color: 'text-yellow-400 bg-yellow-400/10', text: 'Low Stock' }
    return { status: 'in_stock', color: 'text-green-400 bg-green-400/10', text: 'In Stock' }
  }

  const categories = [
    'antibiotics', 'painkillers', 'vitamins', 'diabetes', 'cardiology', 
    'dermatology', 'psychiatry', 'respiratory', 'gastroenterology', 'neurology'
  ]

  const forms = [
    'tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 
    'drops', 'inhaler', 'suppository', 'powder'
  ]

  return (
    <div className="min-h-screen p-8 bg-hero-dark">
      {/* Header */}
      <header className="card-surface border-b p-4 mb-6" style={{ borderColor: 'var(--color-border)', borderRadius: '1.5rem' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link 
              to="/doctor/prescriptions"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--color-secondary)', 
                color: 'var(--color-primary)' 
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar às Prescrições</span>
            </Link>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
              <Pill className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Gerenciar Medicamentos</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Adicionar, editar e gerenciar inventário de medicamentos</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateMedicine}
              className="btn-primary rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Medicamento</span>
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-light)' }} />
              <input
                type="text"
                placeholder="Buscar medicamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--color-card)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none"
              style={{ 
                backgroundColor: 'var(--color-card)', 
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>
            {filteredMedicines.length} de {medicines.length} medicamentos
          </div>
        </div>

        {/* Medicines Grid */}
        {loading ? (
          <div className="card-surface border rounded-2xl p-8 text-center" style={{ borderColor: 'var(--color-border)' }}>
            <div className="animate-spin rounded-full h-12 w-12 mx-auto" style={{ borderTop: '2px solid var(--color-primary)', borderRight: '2px solid transparent' }}></div>
            <p className="mt-4" style={{ color: 'var(--color-text-light)' }}>Carregando medicamentos...</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="card-surface border rounded-2xl p-8 text-center" style={{ borderColor: 'var(--color-border)' }}>
            <Pill className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-light)' }} />
            <p style={{ color: 'var(--color-text-light)' }}>Nenhum medicamento encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((medicine) => {
              const stockStatus = getStockStatus(medicine.stockQuantity, medicine.reorderLevel)
              return (
                <div key={medicine.id} className="card-surface border rounded-2xl p-6" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{medicine.name}</h3>
                      <p style={{ color: 'var(--color-text-light)' }}>{medicine.strength} • {medicine.form}</p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ 
                        backgroundColor: 'var(--color-secondary)', 
                        color: 'var(--color-primary)' 
                      }}>
                        {medicine.category}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ 
                        backgroundColor: stockStatus.status === 'in_stock' ? '#d4edda' : stockStatus.status === 'low_stock' ? '#fff3cd' : '#f8d7da',
                        color: stockStatus.status === 'in_stock' ? '#155724' : stockStatus.status === 'low_stock' ? '#856404' : '#721c24'
                      }}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4" style={{ color: 'var(--color-text-light)' }} />
                      <span style={{ color: 'var(--color-text)' }}>{medicine.manufacturer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4" style={{ color: 'var(--color-text-light)' }} />
                      <span style={{ color: 'var(--color-text)' }}>Estoque: {medicine.stockQuantity || 0}</span>
                    </div>
                    {medicine.price && (
                      <div className="flex items-center space-x-2">
                        <span style={{ color: 'var(--color-text-light)' }}>R$</span>
                        <span style={{ color: 'var(--color-text)' }}>{medicine.price}</span>
                      </div>
                    )}
                  </div>
                  
                  {medicine.description && (
                    <div className="mb-4">
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--color-text-light)' }}>{medicine.description}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditMedicine(medicine)}
                      className="flex-1 px-3 py-2 text-white rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                      style={{ 
                        backgroundColor: 'var(--color-primary)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                    >
                      <Edit className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMedicine(medicine.id)}
                      className="px-3 py-2 text-white rounded-lg text-sm transition-colors bg-red-500 hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="card-surface border rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {showEditModal ? 'Editar Medicamento' : 'Adicionar Novo Medicamento'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                }}
                className="transition-colors"
                style={{ color: 'var(--color-text-light)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Nome do Medicamento *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="Digite o nome do medicamento"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  >
                    <option value="">Selecionar Categoria</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Dosagem *</label>
                  <input
                    type="text"
                    value={formData.strength}
                    onChange={(e) => setFormData(prev => ({ ...prev, strength: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="ex: 500mg, 10ml"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Forma *</label>
                  <select
                    value={formData.form}
                    onChange={(e) => setFormData(prev => ({ ...prev, form: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  >
                    <option value="">Selecionar Forma</option>
                    {forms.map(form => (
                      <option key={form} value={form}>
                        {form.charAt(0).toUpperCase() + form.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Fabricante *</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="Nome do fabricante"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Quantidade em Estoque</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Nível de Reposição</label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, reorderLevel: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-bg)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  rows="3"
                  placeholder="Digite a descrição do medicamento..."
                />
              </div>

              {/* Medical Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Efeitos Colaterais</label>
                  <textarea
                    value={formData.sideEffects}
                    onChange={(e) => setFormData(prev => ({ ...prev, sideEffects: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    rows="3"
                    placeholder="Efeitos colaterais comuns..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Contraindicações</label>
                  <textarea
                    value={formData.contraindications}
                    onChange={(e) => setFormData(prev => ({ ...prev, contraindications: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    rows="3"
                    placeholder="Contraindicações..."
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Instruções de Dosagem</label>
                  <textarea
                    value={formData.dosageInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, dosageInstructions: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    rows="3"
                    placeholder="Instruções de dosagem..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Instruções de Armazenamento</label>
                  <textarea
                    value={formData.storageInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, storageInstructions: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    rows="3"
                    placeholder="Instruções de armazenamento..."
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Medicamento Ativo</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setShowEditModal(false)
                  }}
                  className="px-6 py-3 border rounded-lg transition-colors"
                  style={{ 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4" style={{ borderTop: '2px solid white', borderRight: '2px solid transparent' }}></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Salvando...' : (showEditModal ? 'Atualizar Medicamento' : 'Adicionar Medicamento')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
