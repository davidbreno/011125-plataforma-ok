import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'

export default function DoctorLayout() {
  return (
    <div className="flex min-h-screen bg-hero-palette">
      <Sidebar userRole="doctor" />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}