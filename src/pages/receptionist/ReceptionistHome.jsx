import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useState, useEffect } from 'react'
import { FaSearch, FaPlus, FaCalendar, FaDollarSign, FaClock, FaClipboard, FaUserPlus, FaMoneyBillWave, FaFileAlt } from 'react-icons/fa'

export default function ReceptionistHome() {
  const { currentUser } = useAuth()

  return (
    <div>
      {/* Header com busca e ações */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase" style={{ color: 'var(--color-text-light)' }}>SEJA BEM VINDO</p>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Dr. David Breno</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-light)' }} />
            <input
              type="text"
              placeholder="Buscar pacientes, agendamentos ou arquivos..."
              className="pl-10 pr-4 py-2.5 rounded-lg border w-96"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>
          <button className="btn-primary flex items-center gap-2">
            <FaSearch />
            Buscar
          </button>
          <button className="btn-primary flex items-center gap-2">
            <FaPlus />
            Nova sessão
          </button>
        </div>
      </div>

      {/* Cards de receita/despesas/balanço */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card-surface">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium uppercase" style={{ color: 'var(--color-text-light)' }}>RECEITA DO MÊS</p>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>R$ 0,00</p>
          <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>+12% vs mês anterior</p>
        </div>

        <div className="card-surface" style={{ backgroundColor: 'var(--color-secondary)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium uppercase" style={{ color: 'var(--color-text-light)' }}>DESPESAS DO MÊS</p>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>R$ 0,00</p>
          <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>-4% vs mês anterior</p>
        </div>

        <div className="card-surface">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium uppercase" style={{ color: 'var(--color-text-light)' }}>BALANÇO</p>
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>R$ 0,00</p>
          <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>Última atualização 01/11 21:41</p>
        </div>
      </div>

      {/* Grid com 3 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna esquerda - 2 cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Próximas sessões */}
          <div className="card-surface">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Próximas sessões</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Seus próximos pacientes confirmados</p>
              </div>
              <Link to="/receptionist/appointments">
                <button className="btn-primary">Ver agenda</button>
              </Link>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Nenhuma sessão futura cadastrada.</p>
          </div>

          {/* Fluxo financeiro e Perfil dos pacientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-surface">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Fluxo financeiro</h3>
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' }}>NOV</span>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-light)' }}>Receitas vs Despesas neste mês</p>
              <div className="h-32 flex items-end justify-center" style={{ color: 'var(--color-text-light)' }}>
                {/* Placeholder para gráfico */}
                <p className="text-xs">Sem dados</p>
              </div>
            </div>

            <div className="card-surface">
              <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Perfil dos pacientes</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-light)' }}>Distribuição por gênero</p>
              <div className="h-32 flex items-center justify-center" style={{ color: 'var(--color-text-light)' }}>
                {/* Placeholder para gráfico de rosca */}
                <p className="text-xs">Sem dados</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>0-12</p>
                </div>
                <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>13-20</p>
                </div>
                <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>21-40</p>
                </div>
                <div className="text-center p-2 rounded" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>41-60</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna direita - Agenda do dia e Atalhos rápidos */}
        <div className="space-y-6">
          {/* Agenda do dia */}
          <div className="card-surface">
            <div className="flex items-center gap-2 mb-3">
              <FaCalendar style={{ color: 'var(--color-primary)' }} />
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Agenda do dia</h3>
            </div>
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-light)' }}>Resumo rápido das próximas consultas</p>
            <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Sem consultas programadas para hoje.</p>
          </div>

          {/* Atalhos rápidos */}
          <div className="card-surface">
            <div className="flex items-center gap-2 mb-3">
              <FaClock style={{ color: 'var(--color-primary)' }} />
              <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Atalhos rápidos</h3>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-light)' }}>Acelere suas rotinas diárias</p>
            <div className="space-y-2">
              <button className="btn-primary w-full flex items-center gap-2 justify-start">
                <FaUserPlus />
                Cadastrar novo paciente
              </button>
              <button className="btn-primary w-full flex items-center gap-2 justify-start">
                <FaMoneyBillWave />
                Registrar pagamento
              </button>
              <button className="btn-primary w-full flex items-center gap-2 justify-start">
                <FaFileAlt />
                Criar modelo de anamnese
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
