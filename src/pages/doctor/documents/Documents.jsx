import { useAuth } from '../../../hooks/useAuth'

export default function Documents() {
  const { currentUser } = useAuth()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Documentos</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Gerencie documentos e arquivos da clínica</p>
      </div>

      <div className="card-surface rounded-2xl p-8 text-center">
        <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>
          Página de Documentos em desenvolvimento...
        </p>
      </div>
    </div>
  )
}
