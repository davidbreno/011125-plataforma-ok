import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import { FaMoneyBillWave, FaArrowLeft } from 'react-icons/fa'

export default function Billing() {
  const { currentUser } = useAuth()

  return (
    <div className="p-8">
      <div className="card-surface p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Link 
            to="/doctor"
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-light)' }}
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar ao Dashboard</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
            <FaMoneyBillWave className="text-2xl" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Registrar Pagamento</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Gerencie pagamentos e faturas</p>
          </div>
        </div>
      </div>

      <div className="card-surface p-8 text-center">
        <FaMoneyBillWave className="text-6xl mx-auto mb-4" style={{ color: 'var(--color-text-light)', opacity: 0.3 }} />
        <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>
          Página de Pagamentos em desenvolvimento...
        </p>
        <p className="text-sm mt-2" style={{ color: 'var(--color-text-light)' }}>
          Em breve você poderá registrar e gerenciar todos os pagamentos aqui.
        </p>
      </div>
    </div>
  )
}
