import { Outlet } from 'react-router-dom'
import Dashbar from '../../components/Dashbar'
import { FaChartLine, FaUsers, FaCalendar, FaFile, FaChartBar, FaBullhorn, FaBox, FaCalendarCheck, FaHashtag, FaPills } from 'react-icons/fa6'

export default function DoctorLayout() {
  const items = [
    { path: '/doctor', label: 'Painel', icon: <FaChartLine /> },
    { path: '/doctor/pacientes', label: 'Pacientes', icon: <FaUsers /> },
    { path: '/doctor/agenda', label: 'Agenda', icon: <FaCalendar />, badge: true },
    { path: '/doctor/documentos', label: 'Documentos', icon: <FaFile /> },
    { path: '/doctor/appointments', label: 'Atendimentos', icon: <FaCalendarCheck /> },
    { path: '/doctor/tokens', label: 'Fila de Pacientes', icon: <FaHashtag /> },
    { path: '/doctor/prescriptions', label: 'Prescrições', icon: <FaPills /> },
    { path: '/doctor/relatorios', label: 'Relatórios', icon: <FaChartBar /> },
    { path: '/doctor/estoque', label: 'Estoque', icon: <FaBox />, badge: true },
  ]

  return (
    <div className="min-h-screen bg-hero-palette">
      <Dashbar items={items} userRole="doctor" />
      <div className="ml-0 md:ml-64">
        <div className="w-full px-4 md:px-6 lg:px-8 py-6 mx-auto" style={{ maxWidth: '1400px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
