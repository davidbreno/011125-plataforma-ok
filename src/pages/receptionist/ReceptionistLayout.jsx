import { Outlet } from 'react-router-dom'
import Dashbar from '../../components/Dashbar'
import { FaChartLine, FaUsers, FaCalendar, FaFile, FaDollarSign, FaChartBar, FaBullhorn, FaBox, FaCalendarCheck, FaHashtag, FaPills } from 'react-icons/fa6'

export default function ReceptionistLayout() {
  const items = [
    { path: '/receptionist', label: 'Painel', icon: <FaChartLine /> },
    { path: '/receptionist/pacientes', label: 'Pacientes', icon: <FaUsers /> },
    { path: '/receptionist/agenda', label: 'Agenda', icon: <FaCalendar />, badge: true },
    { path: '/receptionist/documentos', label: 'Documentos', icon: <FaFile /> },
    { path: '/receptionist/billing', label: 'Financeiro', icon: <FaDollarSign /> },
    { path: '/receptionist/relatorios', label: 'Relatórios', icon: <FaChartBar /> },
    { path: '/receptionist/marketing', label: 'Marketing', icon: <FaBullhorn /> },
    { path: '/receptionist/estoque', label: 'Estoque', icon: <FaBox />, badge: true },
    { path: '/receptionist/appointments', label: 'Atendimentos', icon: <FaCalendarCheck /> },
    { path: '/receptionist/tokens', label: 'Tokens', icon: <FaHashtag /> },
    { path: '/receptionist/prescriptions', label: 'Prescrições', icon: <FaPills /> },
  ]

  return (
    <div className="min-h-screen bg-hero-palette">
      <Dashbar items={items} userRole="receptionist" />
      <div className="ml-0 md:ml-64">
        <div className="w-full px-4 md:px-6 lg:px-8 py-6 mx-auto" style={{ maxWidth: '1400px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
