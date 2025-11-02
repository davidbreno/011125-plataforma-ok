import { useState } from 'react'
import { FaBell, FaUser, FaLock, FaPalette, FaGlobe, FaCreditCard, FaShieldAlt, FaBars } from 'react-icons/fa'
import { useTheme } from '../contexts/ThemeContext'
import toast from 'react-hot-toast'

export default function Configuracoes() {
  const { currentTheme, currentFont, sidebarFixed, themes, fonts, changeTheme, changeFont, toggleSidebar } = useTheme()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [language, setLanguage] = useState('pt-BR')

  const sections = [
    {
      title: 'Perfil',
      icon: <FaUser />,
      items: [
        { label: 'Nome completo', value: 'Dr. David Breno', editable: true },
        { label: 'E-mail', value: 'david.breno@lifeclinic.com', editable: true },
        { label: 'Telefone', value: '(11) 98765-4321', editable: true },
        { label: 'CRM', value: '123456-SP', editable: false }
      ]
    },
    {
      title: 'Notificações',
      icon: <FaBell />,
      items: []
    },
    {
      title: 'Segurança',
      icon: <FaLock />,
      items: [
        { label: 'Alterar senha', action: true },
        { label: 'Autenticação de dois fatores', toggle: false },
        { label: 'Sessões ativas', value: '3 dispositivos', action: true }
      ]
    },
    {
      title: 'Aparência',
      icon: <FaPalette />,
      items: []
    },
    {
      title: 'Regional',
      icon: <FaGlobe />,
      items: [
        { label: 'Idioma', value: 'Português (Brasil)', editable: true },
        { label: 'Fuso horário', value: 'GMT-3 (Brasília)', editable: true },
        { label: 'Formato de data', value: 'DD/MM/AAAA', editable: true }
      ]
    },
    {
      title: 'Pagamentos',
      icon: <FaCreditCard />,
      items: [
        { label: 'Métodos de pagamento', value: 'Cartão, PIX, Dinheiro', action: true },
        { label: 'Histórico de transações', action: true }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Configurações</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-light)' }}>
          Ajuste preferências da clínica, notificações e integrações
        </p>
      </div>

      {/* Sections */}
      {sections.map((section, idx) => (
        <div key={idx} className="card-surface">
          <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}
            >
              {section.icon}
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{section.title}</h2>
          </div>

          {/* Notificações com toggles */}
          {section.title === 'Notificações' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium" style={{ color: 'var(--color-text)' }}>Notificações por e-mail</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                    Receber notificações sobre agendamentos e pagamentos
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style={{ 
                      backgroundColor: emailNotifications ? 'var(--color-primary)' : 'var(--color-border)' 
                    }}
                  ></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium" style={{ color: 'var(--color-text)' }}>Notificações por SMS</div>
                  <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                    Receber lembretes de consultas por SMS
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={smsNotifications}
                    onChange={() => setSmsNotifications(!smsNotifications)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                    style={{ 
                      backgroundColor: smsNotifications ? 'var(--color-primary)' : 'var(--color-border)' 
                    }}
                  ></div>
                </label>
              </div>
            </div>
          )}

          {/* Aparência com seleção de temas e fontes */}
          {section.title === 'Aparência' && (
            <div className="space-y-6">
              {/* Seleção de Tema - 4 Opções (Grid 2x2) */}
              <div>
                <label className="block font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                  Tema do Sistema
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(themes).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => {
                        changeTheme(key)
                        toast.success(`Tema ${theme.name} aplicado!`)
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${currentTheme === key ? 'ring-2 ring-offset-2' : ''}`}
                      style={{
                        backgroundColor: theme.colors.bg,
                        borderColor: currentTheme === key ? theme.colors.primary : theme.colors.border
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold" style={{ color: theme.colors.text }}>{theme.name}</span>
                        {currentTheme === key && <span style={{ color: theme.colors.primary }}>✓</span>}
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.colors.primary }}></div>
                        <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.colors.secondary }}></div>
                        <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.colors.accent }}></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Fonte - 2 Opções */}
              <div>
                <label className="block font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                  Tipo de Fonte
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(fonts).map(([key, font]) => (
                    <button
                      key={key}
                      onClick={() => {
                        changeFont(key)
                        toast.success(`Fonte ${font.name} aplicada!`)
                      }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${currentFont === key ? 'ring-2 ring-offset-2' : ''}`}
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: currentFont === key ? 'var(--color-primary)' : 'var(--color-border)',
                        color: 'var(--color-text)',
                        fontFamily: font.family
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{font.name}</span>
                        {currentFont === key && <span style={{ color: 'var(--color-primary)' }}>✓</span>}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                        {key === 'sans-serif' ? 'Fonte moderna e limpa' : 'Fonte clássica e elegante'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Barra Lateral Fixa */}
              <div>
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <div className="flex items-center gap-3">
                    <FaBars style={{ color: 'var(--color-primary)' }} />
                    <div>
                      <div className="font-medium" style={{ color: 'var(--color-text)' }}>Barra Lateral Fixa</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                        Mantém a barra lateral sempre visível
                      </div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={sidebarFixed}
                      onChange={() => {
                        toggleSidebar()
                        toast.success(!sidebarFixed ? 'Barra lateral fixa ativada' : 'Barra lateral flutuante ativada')
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                      style={{ 
                        backgroundColor: sidebarFixed ? 'var(--color-primary)' : 'var(--color-border)' 
                      }}
                    ></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Outros items */}
          {section.items.length > 0 && (
            <div className="space-y-3">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-center justify-between py-3" style={{ borderBottom: itemIdx < section.items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: 'var(--color-text)' }}>{item.label}</div>
                    {item.value && (
                      <div className="text-sm mt-1" style={{ color: 'var(--color-text-light)' }}>{item.value}</div>
                    )}
                  </div>
                  {item.editable && (
                    <button 
                      className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                      style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                    >
                      Editar
                    </button>
                  )}
                  {item.action && (
                    <button 
                      className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                      style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}
                    >
                      Ver
                    </button>
                  )}
                  {item.toggle !== undefined && (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                        style={{ backgroundColor: 'var(--color-border)' }}
                      ></div>
                    </label>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Danger Zone */}
      <div className="card-surface" style={{ borderColor: '#fca5a5' }}>
        <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid #fca5a5' }}>
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
          >
            <FaShieldAlt />
          </div>
          <h2 className="text-xl font-bold" style={{ color: '#dc2626' }}>Zona de Perigo</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: 'var(--color-text)' }}>Desativar conta</div>
              <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                Desative temporariamente sua conta
              </div>
            </div>
            <button 
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
              style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
            >
              Desativar
            </button>
          </div>
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #fca5a5' }}>
            <div>
              <div className="font-medium" style={{ color: 'var(--color-text)' }}>Excluir conta</div>
              <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                Exclua permanentemente sua conta e todos os dados
              </div>
            </div>
            <button 
              className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
              style={{ backgroundColor: '#dc2626', color: 'white' }}
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
