import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { FaSearch, FaPlus, FaCalendar, FaClock, FaUserPlus, FaMoneyBillWave, FaFileAlt } from 'react-icons/fa'
import { useState, useEffect } from 'react'

export default function DoctorHome() {
  const { currentUser } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDate = (date) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      {/* Header com métricas */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase" style={{ color: 'var(--color-text-light)' }}>SEJA BEM VINDO</p>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Dr. David Breno</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#101a29', border: '1px solid #1a2332' }}>
              <FaCalendar style={{ color: '#4fd8d5' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>5 Consultas</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#101a29', border: '1px solid #1a2332' }}>
              <FaClock style={{ color: '#4fd8d5' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>3 Pendentes</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#101a29', border: '1px solid #1a2332' }}>
              <FaMoneyBillWave style={{ color: '#4fd8d5' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>R$ 1.200</span>
            </div>
          </div>
        </div>

        {/* Atalhos Rápidos */}
        <div className="flex items-center gap-8 mx-8">
          <Link to="/doctor/appointments" className="flex flex-col items-center justify-center p-3 rounded-lg hover:scale-105 transition-transform" style={{ backgroundColor: '#101a29', border: '1px solid #1a2332', minWidth: '80px' }}>
            <FaCalendar className="text-2xl mb-1" style={{ color: '#4fd8d5' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Agenda</span>
          </Link>
          <Link to="/doctor/token" className="flex flex-col items-center justify-center p-3 rounded-lg hover:scale-105 transition-transform" style={{ backgroundColor: '#101a29', border: '1px solid #1a2332', minWidth: '80px' }}>
            <FaClock className="text-2xl mb-1" style={{ color: '#4fd8d5' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Filas</span>
          </Link>
          <Link to="/doctor/prescriptions" className="flex flex-col items-center justify-center p-3 rounded-lg hover:scale-105 transition-transform" style={{ backgroundColor: '#101a29', border: '1px solid #1a2332', minWidth: '80px' }}>
            <FaFileAlt className="text-2xl mb-1" style={{ color: '#4fd8d5' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Receitas</span>
          </Link>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-light)' }}>{formatDate(currentTime)}</p>
          <p className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>{formatTime(currentTime)}</p>
          <div className="flex items-center justify-end gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4fd8d5' }}></div>
            <span className="text-sm" style={{ color: '#4fd8d5' }}>Disponível</span>
          </div>
        </div>
      </div>

      {/* Cards de receita/despesas/balanço */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card-surface">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-sm font-medium uppercase" style={{ color: 'var(--color-text-light)' }}>RECEITA DO MÊS</p>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>R$ 0,00</p>
              <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>+12% vs mês anterior</p>
            </div>
            <svg viewBox="0 0 60 40" className="w-24 h-16 ml-4">
              <rect x="2" y="25" width="3" height="15" fill="#4fd8d5" opacity="0.8"/>
              <rect x="7" y="20" width="3" height="20" fill="#4fd8d5" opacity="0.8"/>
              <rect x="12" y="18" width="3" height="22" fill="#4fd8d5" opacity="0.8"/>
              <rect x="17" y="15" width="3" height="25" fill="#4fd8d5" opacity="0.8"/>
              <rect x="22" y="22" width="3" height="18" fill="#4fd8d5" opacity="0.8"/>
              <rect x="27" y="10" width="3" height="30" fill="#4fd8d5" opacity="0.8"/>
              <rect x="32" y="12" width="3" height="28" fill="#4fd8d5" opacity="0.8"/>
              <rect x="37" y="8" width="3" height="32" fill="#4fd8d5" opacity="0.8"/>
              <rect x="42" y="16" width="3" height="24" fill="#4fd8d5" opacity="0.8"/>
              <rect x="47" y="5" width="3" height="35" fill="#4fd8d5" opacity="0.8"/>
              <rect x="52" y="14" width="3" height="26" fill="#4fd8d5" opacity="0.8"/>
            </svg>
          </div>
        </div>

        <div className="card-surface">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-sm font-medium uppercase" style={{ color: 'var(--color-text-light)' }}>DESPESAS DO MÊS</p>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>R$ 0,00</p>
              <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>-4% vs mês anterior</p>
            </div>
            <svg viewBox="0 0 60 40" className="w-24 h-16 ml-4">
              <rect x="2" y="15" width="3" height="25" fill="#4fd8d5" opacity="0.8"/>
              <rect x="7" y="12" width="3" height="28" fill="#4fd8d5" opacity="0.8"/>
              <rect x="12" y="18" width="3" height="22" fill="#4fd8d5" opacity="0.8"/>
              <rect x="17" y="20" width="3" height="20" fill="#4fd8d5" opacity="0.8"/>
              <rect x="22" y="10" width="3" height="30" fill="#4fd8d5" opacity="0.8"/>
              <rect x="27" y="22" width="3" height="18" fill="#4fd8d5" opacity="0.8"/>
              <rect x="32" y="16" width="3" height="24" fill="#4fd8d5" opacity="0.8"/>
              <rect x="37" y="8" width="3" height="32" fill="#4fd8d5" opacity="0.8"/>
              <rect x="42" y="14" width="3" height="26" fill="#4fd8d5" opacity="0.8"/>
              <rect x="47" y="6" width="3" height="34" fill="#4fd8d5" opacity="0.8"/>
              <rect x="52" y="18" width="3" height="22" fill="#4fd8d5" opacity="0.8"/>
            </svg>
          </div>
        </div>

        <div className="card-surface">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-sm font-medium uppercase" style={{ color: 'var(--color-text-light)' }}>BALANÇO</p>
              <p className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>R$ 0,00</p>
              <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>Última atualização 01/11 21:41</p>
            </div>
            <svg viewBox="0 0 60 40" className="w-24 h-16 ml-4">
              <rect x="2" y="20" width="3" height="20" fill="#4fd8d5" opacity="0.8"/>
              <rect x="7" y="18" width="3" height="22" fill="#4fd8d5" opacity="0.8"/>
              <rect x="12" y="12" width="3" height="28" fill="#4fd8d5" opacity="0.8"/>
              <rect x="17" y="24" width="3" height="16" fill="#4fd8d5" opacity="0.8"/>
              <rect x="22" y="16" width="3" height="24" fill="#4fd8d5" opacity="0.8"/>
              <rect x="27" y="10" width="3" height="30" fill="#4fd8d5" opacity="0.8"/>
              <rect x="32" y="14" width="3" height="26" fill="#4fd8d5" opacity="0.8"/>
              <rect x="37" y="22" width="3" height="18" fill="#4fd8d5" opacity="0.8"/>
              <rect x="42" y="8" width="3" height="32" fill="#4fd8d5" opacity="0.8"/>
              <rect x="47" y="12" width="3" height="28" fill="#4fd8d5" opacity="0.8"/>
              <rect x="52" y="6" width="3" height="34" fill="#4fd8d5" opacity="0.8"/>
            </svg>
          </div>
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
              <Link to="/doctor/appointments">
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
                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-secondary)', color: '#0b111b' }}>NOV</span>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-light)' }}>Receitas vs Despesas neste mês</p>
              <svg viewBox="0 0 500 200" className="w-full h-32">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4fd8d5" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="#4fd8d5" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                {/* Linhas de grade */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="80" x2="500" y2="80" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="120" x2="500" y2="120" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
                <line x1="0" y1="160" x2="500" y2="160" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
                
                {/* Área preenchida */}
                <path
                  d="M 0 160 L 30 130 L 100 140 L 150 90 L 200 110 L 250 70 L 300 40 L 350 50 L 420 80 L 500 130 L 500 200 L 0 200 Z"
                  fill="url(#areaGradient)"
                />
                
                {/* Linha do gráfico */}
                <path
                  d="M 0 160 L 30 130 L 100 140 L 150 90 L 200 110 L 250 70 L 300 40 L 350 50 L 420 80 L 500 130"
                  fill="none"
                  stroke="#4fd8d5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Pontos no gráfico */}
                <circle cx="30" cy="130" r="4" fill="#4fd8d5" stroke="#ffffff" strokeWidth="2"/>
                <circle cx="100" cy="140" r="4" fill="#4fd8d5" stroke="#ffffff" strokeWidth="2"/>
                <circle cx="150" cy="90" r="4" fill="#4fd8d5" stroke="#ffffff" strokeWidth="2"/>
                <circle cx="250" cy="70" r="4" fill="#4fd8d5" stroke="#ffffff" strokeWidth="2"/>
                <circle cx="350" cy="50" r="4" fill="#4fd8d5" stroke="#ffffff" strokeWidth="2"/>
                <circle cx="500" cy="130" r="4" fill="#4fd8d5" stroke="#ffffff" strokeWidth="2"/>
                
                {/* Labels dos meses */}
                <text x="30" y="195" textAnchor="middle" fill="var(--color-text-light)" fontSize="10">JAN</text>
                <text x="150" y="195" textAnchor="middle" fill="var(--color-text-light)" fontSize="10">FEB</text>
                <text x="250" y="195" textAnchor="middle" fill="var(--color-text-light)" fontSize="10">MAR</text>
                <text x="350" y="195" textAnchor="middle" fill="var(--color-text-light)" fontSize="10">APR</text>
                <text x="470" y="195" textAnchor="middle" fill="var(--color-text-light)" fontSize="10">MAY</text>
              </svg>
            </div>

            <div className="card-surface">
              <h3 className="text-base font-semibold mb-6" style={{ color: 'var(--color-text)' }}>Fluxo de atendimento</h3>
              <div className="flex items-center justify-center relative">
                <svg viewBox="0 0 120 120" className="w-48 h-48 relative z-10">
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  {/* Gráfico de rosca (donut chart) */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#grad1)" strokeWidth="20" 
                    strokeDasharray="94 314" strokeDashoffset="0" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#grad2)" strokeWidth="20" 
                    strokeDasharray="78 314" strokeDashoffset="-94" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#grad3)" strokeWidth="20" 
                    strokeDasharray="142 314" strokeDashoffset="-172" />
                  {/* Centro do donut */}
                  <circle cx="60" cy="60" r="30" fill="var(--color-card)" />
                </svg>
                {/* Brilho sutil abaixo */}
                <div className="absolute bottom-0 w-32 h-4 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent blur-lg"></div>
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
