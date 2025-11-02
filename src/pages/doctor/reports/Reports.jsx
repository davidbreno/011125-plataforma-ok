import { useAuth } from '../../../hooks/useAuth'

export default function Reports() {
  const { currentUser } = useAuth()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Relatórios</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Visualize relatórios e estatísticas</p>
      </div>

      <div className="card-surface rounded-2xl p-8 text-center">
        <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>
          Página de Relatórios em desenvolvimento...
        </p>
      </div>
    </div>
  )
}
