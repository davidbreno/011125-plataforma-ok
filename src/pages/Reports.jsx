import { useState } from 'react'
import { FaArrowLeft, FaCalendarAlt, FaChartLine, FaDollarSign, FaUsers, FaFileExport, FaFilter } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export default function Reports() {
  const [dateRange, setDateRange] = useState('month')
  const [reportType, setReportType] = useState('financial')

  // Mock data
  const financialData = {
    revenue: 'R$ 45.280,00',
    expenses: 'R$ 12.450,00',
    profit: 'R$ 32.830,00',
    growth: '+12.5%'
  }

  const patientData = {
    total: 156,
    new: 23,
    returning: 133,
    avgAge: 35
  }

  const appointmentData = [
    { month: 'Jan', count: 45 },
    { month: 'Fev', count: 52 },
    { month: 'Mar', count: 48 },
    { month: 'Abr', count: 61 },
    { month: 'Mai', count: 58 },
    { month: 'Jun', count: 65 }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/doctor" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
              style={{ color: 'var(--color-text-light)', backgroundColor: 'var(--color-bg)' }}
            >
              <FaArrowLeft />
              <span className="text-sm font-medium">Voltar ao Dashboard</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Relatórios</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Análise detalhada de desempenho</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all"
              style={{ 
                backgroundColor: 'var(--color-card)', 
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)'
              }}
            >
              <FaFilter />
              Filtros
            </button>
            <button 
              className="btn-primary flex items-center gap-2"
            >
              <FaFileExport />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="card-surface">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Período
              </label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg outline-none"
                style={{ 
                  backgroundColor: 'var(--color-bg)', 
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último ano</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                Tipo de Relatório
              </label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg outline-none"
                style={{ 
                  backgroundColor: 'var(--color-bg)', 
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                <option value="financial">Financeiro</option>
                <option value="patients">Pacientes</option>
                <option value="appointments">Agendamentos</option>
                <option value="inventory">Estoque</option>
                <option value="performance">Desempenho</option>
              </select>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-surface">
            <div className="flex items-start justify-between mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <FaDollarSign className="text-xl" style={{ color: 'var(--color-primary)' }} />
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: '#dcfce7', color: '#059669' }}>
                {financialData.growth}
              </span>
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-light)' }}>Receita Total</h3>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{financialData.revenue}</p>
          </div>

          <div className="card-surface">
            <div className="flex items-start justify-between mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <FaDollarSign className="text-xl" style={{ color: 'var(--color-primary)' }} />
              </div>
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-light)' }}>Despesas</h3>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{financialData.expenses}</p>
          </div>

          <div className="card-surface">
            <div className="flex items-start justify-between mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <FaChartLine className="text-xl" style={{ color: 'var(--color-primary)' }} />
              </div>
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-light)' }}>Lucro Líquido</h3>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{financialData.profit}</p>
          </div>

          <div className="card-surface">
            <div className="flex items-start justify-between mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-secondary)' }}
              >
                <FaUsers className="text-xl" style={{ color: 'var(--color-primary)' }} />
              </div>
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-light)' }}>Total de Pacientes</h3>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{patientData.total}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="card-surface">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Receita por Mês</h3>
              <FaChartLine style={{ color: 'var(--color-text-light)' }} />
            </div>
            <div className="space-y-3">
              {appointmentData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-12 text-sm font-medium" style={{ color: 'var(--color-text-light)' }}>{item.month}</span>
                  <div className="flex-1 h-8 rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
                    <div 
                      className="h-full rounded-lg flex items-center justify-end px-3 text-white text-sm font-semibold transition-all"
                      style={{ 
                        backgroundColor: 'var(--color-primary)', 
                        width: `${(item.count / 65) * 100}%` 
                      }}
                    >
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Demographics */}
          <div className="card-surface">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Perfil dos Pacientes</h3>
              <FaUsers style={{ color: 'var(--color-text-light)' }} />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Novos Pacientes</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{patientData.new}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: 'var(--color-primary)', 
                      width: `${(patientData.new / patientData.total) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Pacientes Recorrentes</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>{patientData.returning}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: 'var(--color-accent)', 
                      width: `${(patientData.returning / patientData.total) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-light)' }}>Idade Média</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{patientData.avgAge} anos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="card-surface">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>Detalhamento de Receitas</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Data</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Paciente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Procedimento</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Valor</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: '01/11/2025', patient: 'João Silva', procedure: 'Implante Dentário', value: 'R$ 3.500,00', status: 'Pago' },
                  { date: '02/11/2025', patient: 'Maria Santos', procedure: 'Limpeza', value: 'R$ 280,00', status: 'Pago' },
                  { date: '03/11/2025', patient: 'Pedro Costa', procedure: 'Canal', value: 'R$ 1.200,00', status: 'Pendente' },
                  { date: '04/11/2025', patient: 'Ana Oliveira', procedure: 'Clareamento', value: 'R$ 800,00', status: 'Pago' }
                ].map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-text-light)' }}>{item.date}</td>
                    <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--color-text)' }}>{item.patient}</td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-text)' }}>{item.procedure}</td>
                    <td className="py-3 px-4 text-sm font-bold text-right" style={{ color: 'var(--color-text)' }}>{item.value}</td>
                    <td className="py-3 px-4 text-center">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: item.status === 'Pago' ? '#dcfce7' : '#fef3c7',
                          color: item.status === 'Pago' ? '#059669' : '#d97706'
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
