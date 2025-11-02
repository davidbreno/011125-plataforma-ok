import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import { 
  FaChartBar, 
  FaArrowLeft,
  FaUsers,
  FaCalendar,
  FaMoneyBillWave,
  FaPills,
  FaFileAlt
} from 'react-icons/fa'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function Reports() {
  const { currentUser } = useAuth()
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    monthlyRevenue: 0,
    loading: true
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get patients count
        const patientsSnap = await getDocs(collection(db, 'patients'))
        const totalPatients = patientsSnap.size

        // Get appointments count
        const appointmentsSnap = await getDocs(collection(db, 'appointments'))
        const totalAppointments = appointmentsSnap.size

        // Get prescriptions count
        const prescriptionsSnap = await getDocs(collection(db, 'prescriptions'))
        const totalPrescriptions = prescriptionsSnap.size

        setStats({
          totalPatients,
          totalAppointments,
          totalPrescriptions,
          monthlyRevenue: 15000, // Valor exemplo
          loading: false
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [])

  const reportCards = [
    {
      title: 'Total de Pacientes',
      value: stats.totalPatients,
      icon: FaUsers,
      color: '#3b82f6',
      bgColor: '#3b82f620'
    },
    {
      title: 'Consultas Realizadas',
      value: stats.totalAppointments,
      icon: FaCalendar,
      color: '#8b5cf6',
      bgColor: '#8b5cf620'
    },
    {
      title: 'Prescrições Emitidas',
      value: stats.totalPrescriptions,
      icon: FaPills,
      color: '#ec4899',
      bgColor: '#ec489920'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`,
      icon: FaMoneyBillWave,
      color: '#10b981',
      bgColor: '#10b98120'
    }
  ]

  return (
    <div className="min-h-screen p-8 bg-hero-dark">
      {/* Header */}
      <header className="p-6 card-surface mb-6" style={{ borderRadius: '1.5rem' }}>
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
            <FaChartBar className="text-xl" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Relatórios</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Visualize estatísticas e relatórios da clínica</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {reportCards.map((card, index) => (
            <div key={index} className="card-surface p-6">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <card.icon className="text-2xl" style={{ color: card.color }} />
                </div>
              </div>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-light)' }}>
                {card.title}
              </h3>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                {stats.loading ? '...' : card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Consultas por Mês
            </h3>
            <div className="h-64 flex items-end justify-around gap-2">
              {[45, 52, 48, 61, 55, 68].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full rounded-t-lg transition-all hover:opacity-80"
                    style={{ 
                      height: `${height}%`,
                      backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'][i]
                    }}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-text-light)' }}>
                    {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Receita Mensal
            </h3>
            <div className="h-64 flex items-end justify-around gap-2">
              {[12000, 15000, 13500, 18000, 16500, 21000].map((value, i) => {
                const maxValue = 25000
                const height = (value / maxValue) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full rounded-t-lg transition-all hover:opacity-80"
                      style={{ 
                        height: `${height}%`,
                        backgroundColor: '#10b981'
                      }}
                    />
                    <span className="text-xs" style={{ color: 'var(--color-text-light)' }}>
                      {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 card-surface p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/doctor/appointments" className="p-4 rounded-lg border transition-colors hover:border-primary-400" style={{ borderColor: 'var(--color-border)' }}>
              <FaCalendar className="text-2xl mb-2" style={{ color: 'var(--color-primary)' }} />
              <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Ver Agendamentos</h4>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Visualizar todas as consultas</p>
            </Link>
            <Link to="/doctor/prescriptions" className="p-4 rounded-lg border transition-colors hover:border-primary-400" style={{ borderColor: 'var(--color-border)' }}>
              <FaPills className="text-2xl mb-2" style={{ color: 'var(--color-primary)' }} />
              <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Ver Prescrições</h4>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Gerenciar receitas médicas</p>
            </Link>
            <Link to="/doctor/patients" className="p-4 rounded-lg border transition-colors hover:border-primary-400" style={{ borderColor: 'var(--color-border)' }}>
              <FaUsers className="text-2xl mb-2" style={{ color: 'var(--color-primary)' }} />
              <h4 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Ver Pacientes</h4>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Gerenciar cadastros</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
