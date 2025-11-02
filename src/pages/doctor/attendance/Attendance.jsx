import { useAuth } from '../../../hooks/useAuth'

export default function Attendance() {
  const { currentUser } = useAuth()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Atendimentos</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Gerencie os atendimentos realizados</p>
      </div>

      <div className="card-surface rounded-2xl p-8 text-center">
        <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>
          Página de Atendimentos em desenvolvimento...
        </p>
      </div>
    </div>
  )
}
