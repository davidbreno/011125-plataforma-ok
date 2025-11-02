import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  FaFile, 
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileAlt,
  FaSearch, 
  FaPlus,
  FaDownload,
  FaTrash,
  FaArrowLeft,
  FaFolder
} from 'react-icons/fa'
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function Documents() {
  const { currentUser } = useAuth()
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'anamnese',
    fileUrl: '',
    fileName: ''
  })

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'anamnese', label: 'Anamnese' },
    { value: 'atestado', label: 'Atestados' },
    { value: 'receita', label: 'Receitas' },
    { value: 'exame', label: 'Exames' },
    { value: 'relatorio', label: 'Relatórios' },
    { value: 'outros', label: 'Outros' }
  ]

  // Fetch documents
  useEffect(() => {
    const documentsRef = collection(db, 'documents')
    const unsubscribe = onSnapshot(documentsRef, (snapshot) => {
      const documentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setDocuments(documentsData)
      setFilteredDocuments(documentsData)
    })
    return () => unsubscribe()
  }, [])

  // Filter documents
  useEffect(() => {
    let filtered = documents

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredDocuments(filtered)
  }, [searchTerm, selectedCategory, documents])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!currentUser || !currentUser.uid) {
        toast.error('Sessão do usuário ainda não carregou. Tente novamente em alguns segundos.')
        return
      }
      const payload = {
        ...formData,
        createdAt: serverTimestamp(),
        doctorName: currentUser?.displayName || currentUser?.email || 'Desconhecido'
      }
      if (currentUser?.uid) payload.createdBy = currentUser.uid
      await addDoc(collection(db, 'documents'), payload)
      toast.success('Documento cadastrado com sucesso!')
      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        category: 'anamnese',
        fileUrl: '',
        fileName: ''
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erro ao cadastrar documento')
    }
  }

  const handleDelete = async (documentId) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await deleteDoc(doc(db, 'documents', documentId))
        toast.success('Documento excluído com sucesso!')
      } catch (error) {
        console.error('Error:', error)
        toast.error('Erro ao excluir documento')
      }
    }
  }

  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt />
    const ext = fileName.split('.').pop().toLowerCase()
    switch (ext) {
      case 'pdf':
        return <FaFilePdf style={{ color: '#dc2626' }} />
      case 'doc':
      case 'docx':
        return <FaFileWord style={{ color: '#2563eb' }} />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage style={{ color: '#16a34a' }} />
      default:
        return <FaFileAlt style={{ color: 'var(--color-text-light)' }} />
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      anamnese: '#3b82f6',
      atestado: '#8b5cf6',
      receita: '#ec4899',
      exame: '#10b981',
      relatorio: '#f59e0b',
      outros: '#6b7280'
    }
    return colors[category] || colors.outros
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
              <FaFile className="text-xl" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Documentos</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Gerencie modelos e documentos da clínica</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Novo Documento
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Filters */}
        <div className="card-surface p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-light)' }} />
              <input
                type="text"
                placeholder="Buscar documentos..."
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
            
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className="px-4 py-2 rounded-lg transition-colors font-medium"
                  style={{
                    backgroundColor: selectedCategory === cat.value ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: selectedCategory === cat.value ? '#0b111b' : 'var(--color-text)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <div key={document.id} className="card-surface p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-3xl">
                    {getFileIcon(document.fileName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate" style={{ color: 'var(--color-text)' }}>
                      {document.title}
                    </h3>
                    <span 
                      className="text-xs px-2 py-1 rounded inline-block"
                      style={{ 
                        backgroundColor: getCategoryColor(document.category) + '20',
                        color: getCategoryColor(document.category)
                      }}
                    >
                      {categories.find(c => c.value === document.category)?.label}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-light)' }}>
                {document.description}
              </p>

              {document.fileName && (
                <p className="text-xs mb-4 truncate" style={{ color: 'var(--color-text-light)' }}>
                  📎 {document.fileName}
                </p>
              )}

              <div className="flex gap-2">
                {document.fileUrl && (
                  <a
                    href={document.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#0b111b' }}
                  >
                    <FaDownload className="w-4 h-4" />
                    Download
                  </a>
                )}
                <button
                  onClick={() => handleDelete(document.id)}
                  className="py-2 px-3 rounded-lg transition-colors"
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="card-surface p-12 text-center">
            <FaFolder className="text-6xl mx-auto mb-4" style={{ color: 'var(--color-text-light)', opacity: 0.3 }} />
            <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>
              {searchTerm ? 'Nenhum documento encontrado' : 'Nenhum documento cadastrado'}
            </p>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card-surface p-6 max-w-xl w-full">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              Novo Documento
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                  {categories.filter(c => c.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Descrição
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg outline-none resize-none"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  URL do Arquivo
                </label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Nome do Arquivo
                </label>
                <input
                  type="text"
                  value={formData.fileName}
                  onChange={(e) => setFormData({...formData, fileName: e.target.value})}
                  placeholder="documento.pdf"
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Cadastrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setFormData({
                      title: '',
                      description: '',
                      category: 'anamnese',
                      fileUrl: '',
                      fileName: ''
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
