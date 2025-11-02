import { useState } from 'react'
import { FaFileAlt, FaUpload, FaDownload, FaTrash, FaEye, FaFolder, FaPlus, FaSearch } from 'react-icons/fa'

export default function Documentos() {
  const [activeCategory, setActiveCategory] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'todos', label: 'Todos', count: 24 },
    { id: 'prontuarios', label: 'Prontuários', count: 12 },
    { id: 'modelos', label: 'Modelos', count: 6 },
    { id: 'receitas', label: 'Receitas', count: 4 },
    { id: 'exames', label: 'Exames', count: 2 }
  ]

  const documents = [
    {
      id: 1,
      name: 'Modelo de Anamnese',
      type: 'Modelo',
      category: 'modelos',
      size: '245 KB',
      date: '01/11/2025',
      icon: <FaFileAlt />
    },
    {
      id: 2,
      name: 'Prontuário - João Silva',
      type: 'Prontuário',
      category: 'prontuarios',
      size: '1.2 MB',
      date: '31/10/2025',
      icon: <FaFileAlt />
    },
    {
      id: 3,
      name: 'Termo de Consentimento',
      type: 'Modelo',
      category: 'modelos',
      size: '156 KB',
      date: '30/10/2025',
      icon: <FaFileAlt />
    },
    {
      id: 4,
      name: 'Receita - Maria Santos',
      type: 'Receita',
      category: 'receitas',
      size: '89 KB',
      date: '29/10/2025',
      icon: <FaFileAlt />
    },
    {
      id: 5,
      name: 'Raio-X Panorâmico',
      type: 'Exame',
      category: 'exames',
      size: '3.4 MB',
      date: '28/10/2025',
      icon: <FaFileAlt />
    },
    {
      id: 6,
      name: 'Prontuário - Ana Costa',
      type: 'Prontuário',
      category: 'prontuarios',
      size: '980 KB',
      date: '27/10/2025',
      icon: <FaFileAlt />
    }
  ]

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = activeCategory === 'todos' || doc.category === activeCategory
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Documentos</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-light)' }}>
            Gerencie modelos, prontuários e documentos clínicos
          </p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2"
        >
          <FaUpload />
          Upload Documento
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card-surface">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <FaSearch 
              className="absolute left-4 top-1/2 -translate-y-1/2" 
              style={{ color: 'var(--color-text-light)' }}
            />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>
          <button 
            className="px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-border)'
            }}
          >
            <FaPlus />
            Novo Modelo
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2"
            style={{
              backgroundColor: activeCategory === cat.id ? 'var(--color-primary)' : 'var(--color-card)',
              color: activeCategory === cat.id ? 'white' : 'var(--color-text)',
              border: `1px solid ${activeCategory === cat.id ? 'var(--color-primary)' : 'var(--color-border)'}`
            }}
          >
            <FaFolder />
            {cat.label}
            <span 
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{
                backgroundColor: activeCategory === cat.id ? 'rgba(255,255,255,0.2)' : 'var(--color-bg)'
              }}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => (
          <div 
            key={doc.id} 
            className="card-surface hover:shadow-lg transition-all group cursor-pointer"
          >
            {/* Document Icon */}
            <div 
              className="w-full h-32 rounded-lg mb-4 flex items-center justify-center text-5xl"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-primary)' }}
            >
              {doc.icon}
            </div>

            {/* Document Info */}
            <h3 className="font-semibold mb-1 truncate" style={{ color: 'var(--color-text)' }}>
              {doc.name}
            </h3>
            <div className="flex items-center justify-between mb-3">
              <span 
                className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}
              >
                {doc.type}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-light)' }}>
                {doc.size}
              </span>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-light)' }}>
              Atualizado em {doc.date}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <button 
                onClick={() => {
                  window.open(`/documents/${doc.id}/view`, '_blank')
                  alert(`Visualizando documento: ${doc.name}\n\nEm um sistema real, este documento seria aberto em uma nova aba.`)
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
              >
                <FaEye />
                Ver
              </button>
              <button 
                onClick={() => {
                  // Simular download
                  const link = document.createElement('a')
                  link.href = '#'
                  link.download = doc.name
                  alert(`Download iniciado: ${doc.name}\n\nEm um sistema real, o arquivo seria baixado automaticamente.`)
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
              >
                <FaDownload />
                Baixar
              </button>
              <button 
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir "${doc.name}"?`)) {
                    alert('Documento excluído com sucesso!')
                  }
                }}
                className="w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                style={{ backgroundColor: 'var(--color-bg)', color: '#dc2626' }}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="card-surface text-center py-12">
          <div 
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-light)' }}
          >
            <FaFileAlt />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Nenhum documento encontrado
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-light)' }}>
            Tente ajustar os filtros ou faça upload de novos documentos
          </p>
          <button className="btn-primary">
            <FaUpload className="inline mr-2" />
            Upload Documento
          </button>
        </div>
      )}
    </div>
  )
}
