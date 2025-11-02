import { Link, useLocation } from 'react-router-dom'
import { FaGear } from 'react-icons/fa6'

export default function Dashbar({ items = [], userRole = 'doctor' }) {
  const { pathname } = useLocation()

  return (
    <aside 
      className="hidden md:block fixed left-0 top-0 h-full w-64 z-40" 
      style={{ 
        backgroundColor: 'var(--color-sidebar)',
        borderRight: '1px solid var(--color-border)',
        boxShadow: '4px 0 12px rgba(0,0,0,0.03)'
      }}
    >
      <div className="h-full flex flex-col p-5">
        {/* Profile */}
        <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div 
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm" 
            style={{ 
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
              boxShadow: '0 2px 8px rgba(200,134,84,0.25)'
            }}
          >
            DB
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate" style={{ color: 'var(--color-text)' }}>Dr. David Breno</div>
            <div className="text-xs truncate" style={{ color: 'var(--color-text-light)' }}>Workspace principal</div>
          </div>
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-opacity-80 transition-all" 
            style={{ color: 'var(--color-text-light)' }}
          >
            <FaGear className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-6 overflow-auto">
          {/* VISAO GERAL */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2.5 px-3" style={{ color: 'var(--color-text-light)', letterSpacing: '0.1em' }}>
              VISÃO GERAL
            </h3>
            <div className="space-y-0.5">
              {items.filter(it => ['Painel', 'Visão geral', 'Pacientes', 'Agenda', 'Documentos'].includes(it.label)).map((it) => (
                <Link
                  key={it.path}
                  to={it.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden"
                  style={{
                    backgroundColor: pathname === it.path ? 'var(--color-secondary)' : 'transparent',
                    color: pathname === it.path ? 'var(--color-primary)' : 'var(--color-text)',
                    fontWeight: pathname === it.path ? '600' : '500'
                  }}
                >
                  {pathname === it.path && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full" 
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  )}
                  <span className="w-5 h-5 flex items-center justify-center text-lg" style={{ marginLeft: pathname === it.path ? '4px' : '0' }}>{it.icon}</span>
                  <span className="text-[13px]">{it.label}</span>
                  {it.badge && <span className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }}></span>}
                </Link>
              ))}
            </div>
          </div>

          {/* GESTAO DA CLINICA */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2.5 px-3" style={{ color: 'var(--color-text-light)', letterSpacing: '0.1em' }}>
              GESTÃO DA CLÍNICA
            </h3>
            <div className="space-y-0.5">
              {items.filter(it => ['Financeiro', 'Faturamento', 'Relatórios', 'Marketing', 'Estoque'].includes(it.label)).map((it) => (
                <Link
                  key={it.path}
                  to={it.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden"
                  style={{
                    backgroundColor: pathname === it.path ? 'var(--color-secondary)' : 'transparent',
                    color: pathname === it.path ? 'var(--color-primary)' : 'var(--color-text)',
                    fontWeight: pathname === it.path ? '600' : '500'
                  }}
                >
                  {pathname === it.path && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full" 
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  )}
                  <span className="w-5 h-5 flex items-center justify-center text-lg" style={{ marginLeft: pathname === it.path ? '4px' : '0' }}>{it.icon}</span>
                  <span className="text-[13px]">{it.label}</span>
                  {it.badge && <span className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }}></span>}
                </Link>
              ))}
            </div>
          </div>

          {/* OUTROS (Atendimentos, Tokens, Prescrições, Configurações) */}
          <div>
            <div className="space-y-0.5">
              {items.filter(it => !['Painel', 'Visão geral', 'Pacientes', 'Agenda', 'Documentos', 'Financeiro', 'Faturamento', 'Relatórios', 'Marketing', 'Estoque'].includes(it.label)).map((it) => (
                <Link
                  key={it.path}
                  to={it.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative overflow-hidden"
                  style={{
                    backgroundColor: pathname === it.path ? 'var(--color-secondary)' : 'transparent',
                    color: pathname === it.path ? 'var(--color-primary)' : 'var(--color-text)',
                    fontWeight: pathname === it.path ? '600' : '500'
                  }}
                >
                  {pathname === it.path && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full" 
                      style={{ backgroundColor: 'var(--color-primary)' }}
                    />
                  )}
                  <span className="w-5 h-5 flex items-center justify-center text-lg" style={{ marginLeft: pathname === it.path ? '4px' : '0' }}>{it.icon}</span>
                  <span className="text-[13px]">{it.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer - Configurações fixas no bottom */}
        <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <Link
            to={`/${userRole}/configuracoes`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
            style={{ color: 'var(--color-text-light)' }}
          >
            <FaGear className="w-5 h-5" />
            <span className="text-sm font-medium">Configuracoes</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}
