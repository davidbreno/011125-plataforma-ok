import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LogoutButton from '../../components/LogoutButton'
import EmailVerificationStatus from '../../components/EmailVerificationStatus'
import { Bell, UserPlus, CalendarCheck, Users, Calendar, FileText, FileDown, Hash, DollarSign } from 'lucide-react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase/config'

export default function Receptionist() {
  const { currentUser, userRole } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [todayAppointments, setTodayAppointments] = useState(0)
  const [todayPrescriptions, setTodayPrescriptions] = useState(0)
  const [totalAppointments, setTotalAppointments] = useState(0)

  // Fetch real appointment data
  useEffect(() => {
    const appointmentsRef = collection(db, 'appointments')
    const q = query(appointmentsRef, orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setAppointments(appointmentsData)
      
      // Calculate today's appointments
      const today = new Date().toISOString().split('T')[0]
      const todayCount = appointmentsData.filter(apt => apt.appointmentDate === today).length
      setTodayAppointments(todayCount)
      setTotalAppointments(appointmentsData.length)
    }, (error) => {
      console.error('Error fetching appointments:', error)
    })

    return () => unsubscribe()
  }, [])

  // Fetch prescription data
  useEffect(() => {
    const prescriptionsRef = collection(db, 'prescriptions')
    const q = query(prescriptionsRef, orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prescriptionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Calculate today's prescriptions
      const today = new Date().toISOString().split('T')[0]
      const todayCount = prescriptionsData.filter(pres => pres.prescriptionDate === today).length
      setTodayPrescriptions(todayCount)
    }, (error) => {
      console.error('Error fetching prescriptions:', error)
    })

    return () => unsubscribe()
  }, [])

  return (
  <div className="min-h-screen text-white" style={{ background: 'linear-gradient(120deg, var(--color-1), var(--color-primary-600))' }}>
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Painel da Recepção</h1>
              <p className="text-sm text-slate-400">Bem-vindo, {currentUser?.displayName || 'Recepcionista'}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Quick Stats */}
          <Link to="/receptionist/billing" className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-semibold">Faturamento e Pagamentos</h3>
            </div>
            <p className="text-3xl font-bold text-cyan-400">{totalAppointments}</p>
            <p className="text-sm text-slate-400 mt-2">Total de faturas</p>
            <p className="text-xs text-cyan-400 mt-2">Clique para gerenciar faturamento →</p>
          </Link>

          <Link to="/receptionist/appointments" className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <CalendarCheck className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold">Atendimentos de hoje</h3>
              </div>
              <Calendar className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">{todayAppointments}</p>
            <p className="text-sm text-slate-400 mt-2">Agendados hoje</p>
            <p className="text-xs text-green-400 mt-2">Clique para gerenciar atendimentos →</p>
          </Link>

          <Link to="/receptionist/prescriptions" className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold">Prescrições de hoje</h3>
              </div>
              <FileDown className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">{todayPrescriptions}</p>
            <p className="text-sm text-slate-400 mt-2">Emitidas hoje</p>
            <p className="text-xs text-purple-400 mt-2">Clique para gerenciar prescrições →</p>
          </Link>

          <Link to="/receptionist/tokens" className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Hash className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold">Gerenciamento de senhas</h3>
              </div>
              <Hash className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">{appointments.filter(apt => apt.tokenNumber).length}</p>
            <p className="text-sm text-slate-400 mt-2">Senhas geradas hoje</p>
            <p className="text-xs text-blue-400 mt-2">Clique para gerenciar senhas →</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Ações rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/receptionist/appointments" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="font-semibold">Gerenciar atendimentos</h3>
                  <p className="text-sm text-slate-400">Visualizar e gerenciar atendimentos</p>
                </div>
              </div>
            </Link>

            <Link to="/receptionist/prescriptions" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-semibold">Ver prescrições</h3>
                  <p className="text-sm text-slate-400">Gerenciar prescrições de pacientes</p>
                </div>
              </div>
            </Link>

            <Link to="/receptionist/appointments" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-semibold">Criar atendimento</h3>
                  <p className="text-sm text-slate-400">Agendar novo atendimento</p>
                </div>
              </div>
            </Link>

            <Link to="/receptionist/tokens" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <Hash className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-semibold">Gerenciamento de senhas</h3>
                  <p className="text-sm text-slate-400">Gerenciar senhas de pacientes</p>
                </div>
              </div>
            </Link>

            <Link to="/receptionist/billing" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="font-semibold">Faturamento e Pagamentos</h3>
                  <p className="text-sm text-slate-400">Gerenciar faturas e pagamentos</p>
                </div>
              </div>
            </Link>

            <Link to="/receptionist/billing/reports" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <FileDown className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="font-semibold">Baixar relatórios</h3>
                  <p className="text-sm text-slate-400">Gerar e baixar relatórios</p>
                </div>
              </div>
            </Link>

            <Link to="/receptionist/billing/create" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="font-semibold">Criar fatura</h3>
                  <p className="text-sm text-slate-400">Gerar nova fatura</p>
                </div>
              </div>
            </Link>

            <Link to="/receptionist/billing/payments" className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-semibold">Processar pagamentos</h3>
                  <p className="text-sm text-slate-400">Processar pagamentos de pacientes</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* User Info Card */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-4">Informações da conta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">E‑mail</p>
              <p className="text-white font-medium">{currentUser?.email}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Função</p>
              <p className="text-cyan-400 font-medium capitalize">{userRole === 'doctor' ? 'Médico' : userRole === 'receptionist' ? 'Recepcionista' : userRole}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Nome completo</p>
              <p className="text-white font-medium">{currentUser?.displayName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">E‑mail verificado</p>
              <EmailVerificationStatus />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


