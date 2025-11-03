import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaCalendar, 
  FaFile, 
  FaChartBar,
  FaBoxes,
  FaStethoscope,
  FaClipboardList,
  FaPrescription,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Forçar a navegação para o contexto de dentista (sem recepção)
  const baseRole = 'doctor';

  const menuItems = {
    dashboard: { 
      path: `/${baseRole}`, 
      label: 'Dashboard', 
      icon: FaHome 
    },
    
    clinicManagement: [
      { path: `/${baseRole}/patients`, label: 'Pacientes', icon: FaUsers },
      { path: `/${baseRole}/appointments`, label: 'Agenda', icon: FaCalendar },
      { path: `/${baseRole}/documents`, label: 'Documentos', icon: FaFile },
    ],
    
    operations: [
      { path: `/${baseRole}/reports`, label: 'Relatórios', icon: FaChartBar },
      { path: `/${baseRole}/stock`, label: 'Estoque', icon: FaBoxes },
      { path: `/${baseRole}/attendance`, label: 'Atendimentos', icon: FaStethoscope },
      { path: `/${baseRole}/token`, label: 'Fila de Pacientes', icon: FaClipboardList },
      { path: `/${baseRole}/prescriptions`, label: 'Prescrições', icon: FaPrescription },
    ]
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-56 h-[calc(100vh-2rem)] flex flex-col m-4 rounded-2xl relative" style={{ 
      backgroundColor: '#101a29',
      border: '1px solid #1a2332'
    }}>
      {/* Textura sutil */}
      <div className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`
      }}></div>
      
      {/* Logo */}
      <div className="p-6 flex justify-center relative z-10">
        <img src="/logo-db.png" alt="Logo" className="w-20 h-20" />
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-4 space-y-1 overflow-y-auto relative z-10">
        {/* Dashboard */}
        <Link 
          to={menuItems.dashboard.path}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            isActive(menuItems.dashboard.path) 
              ? 'text-white' 
              : 'text-gray-400 hover:text-white hover:bg-[#0d1520]'
          }`}
          style={isActive(menuItems.dashboard.path) ? { backgroundColor: '#4fd8d5' } : {}}
        >
          <menuItems.dashboard.icon className="text-lg" />
          <span className="text-sm font-medium">{menuItems.dashboard.label}</span>
        </Link>

        {/* Gestão da Clínica - Parte 1 */}
        <div className="pt-6">
          <p className="px-4 text-xs font-semibold text-gray-500 mb-2 tracking-wider">GESTÃO DA CLÍNICA</p>
          {menuItems.clinicManagement.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#0d1520]'
              }`}
              style={isActive(item.path) ? { backgroundColor: '#4fd8d5' } : {}}
            >
              <item.icon className="text-lg" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Gestão da Clínica - Parte 2 */}
        <div className="pt-6">
          <p className="px-4 text-xs font-semibold text-gray-500 mb-2 tracking-wider">GESTÃO DA CLÍNICA</p>
          {menuItems.operations.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#0d1520]'
              }`}
              style={isActive(item.path) ? { backgroundColor: '#4fd8d5' } : {}}
            >
              <item.icon className="text-lg" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="p-4 relative z-10">
        <button 
          className="w-full py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{ backgroundColor: '#4fd8d5' }}
          onClick={handleLogout}
        >
          <FaSignOutAlt className="text-sm" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
