import React, { useState } from 'react'

export default function Estoque() {
  const [activeTab, setActiveTab] = useState('implante')

  const stockItems = {
    implante: [
      { id: 1, name: 'H1', specs: '11 mm x 3 mm', quantity: 25, brand: 'asdasd' },
      { id: 2, name: 'HE', specs: 'mm x mm', quantity: 41, brand: 'sdfsd' },
    ],
    cirurgia: [],
    dentistica: [],
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Controle de Estoque</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
          Organize materiais por especialidade, acompanhe quantidades e atualize o estoque em tempo real.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('implante')}
          className="px-6 py-2 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: activeTab === 'implante' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'implante' ? 'white' : 'var(--color-text)',
            border: activeTab === 'implante' ? 'none' : '1px solid var(--color-border)',
          }}
        >
          Implante
        </button>
        <button
          onClick={() => setActiveTab('cirurgia')}
          className="px-6 py-2 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: activeTab === 'cirurgia' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'cirurgia' ? 'white' : 'var(--color-text)',
            border: activeTab === 'cirurgia' ? 'none' : '1px solid var(--color-border)',
          }}
        >
          Cirurgia
        </button>
        <button
          onClick={() => setActiveTab('dentistica')}
          className="px-6 py-2 rounded-lg font-medium transition-all"
          style={{
            backgroundColor: activeTab === 'dentistica' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'dentistica' ? 'white' : 'var(--color-text)',
            border: activeTab === 'dentistica' ? 'none' : '1px solid var(--color-border)',
          }}
        >
          Dentística
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de adicionar (esquerda) */}
        <div className="lg:col-span-1">
          <div className="card-surface">
            <h3 className="text-sm font-semibold uppercase mb-2" style={{ color: 'var(--color-text-light)' }}>
              ESTOQUE DE {activeTab.toUpperCase()}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-light)' }}>
              Organize materiais por especialidade e atualize o estoque.
            </p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Tipo</label>
                <select
                  className="w-full p-2.5 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  <option>CMI</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Comprimento (mm)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 11"
                    className="w-full p-2.5 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    diâmetro (mm)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 3,75"
                    className="w-full p-2.5 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Quantidade
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full p-2.5 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Marca
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Neoden"
                    className="w-full p-2.5 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary w-full">
                Adicionar ao estoque
              </button>
            </form>
          </div>
        </div>

        {/* Lista de itens (direita - 2 colunas) */}
        <div className="lg:col-span-2 space-y-4">
          {stockItems[activeTab].length === 0 ? (
            <div className="card-surface text-center py-12">
              <p style={{ color: 'var(--color-text-light)' }}>Nenhum item cadastrado nesta categoria.</p>
            </div>
          ) : (
            stockItems[activeTab].map((item) => (
              <div
                key={item.id}
                className="card-surface flex items-center justify-between"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
                    <span className="text-white font-bold">
                      {item.name.substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {item.name} — {item.specs}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                      Quantidade: {item.quantity} • Marca: {item.brand}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-light)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
