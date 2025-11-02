import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Link, Outlet } from 'react-router-dom'
import LogoutButton from '../../components/LogoutButton'
import EmailVerificationStatus from '../../components/EmailVerificationStatus'
import Sidebar from '../../components/Sidebar'
import { FaUserDoctor, FaCalendar, FaUserInjured, FaPills, FaCalendarDay, FaFileLines, FaPlus, FaHashtag } from 'react-icons/fa6'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

export default function Doctor() {
  const { currentUser, userRole } = useAuth()
  const [stats, setStats] = useState({
    todayAppointments: 0,
    waitingPatients: 0,
    weeklyPrescriptions: 0,
    loading: true
  })
  const [doctorName, setDoctorName] = useState('')

  // Fetch doctor's name from staffData collection
  useEffect(() => {
    if (!currentUser) return

    const fetchDoctorName = async () => {
      try {
        const userDocRef = doc(db, 'staffData', currentUser.uid)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          const name = userData.fullName || currentUser.displayName || 'Médico desconhecido'
          setDoctorName(name)
        } else {
          setDoctorName(currentUser.displayName || 'Médico desconhecido')
        }
      } catch (error) {
        console.error('Error fetching doctor name:', error)
  setDoctorName(currentUser.displayName || 'Médico desconhecido')
      }
    }

    fetchDoctorName()
  }, [currentUser])

  // Fetch real-time stats
  useEffect(() => {
    if (!doctorName) return

    const today = new Date().toISOString().split('T')[0]
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)

    // Query for today's appointments
    const todayAppointmentsRef = collection(db, 'appointments')
    const todayQuery = query(
      todayAppointmentsRef,
      where('appointmentDate', '==', today),
      where('doctorName', '==', doctorName)
    )

    // Query for waiting patients (tokens generated but not completed)
    const waitingPatientsRef = collection(db, 'appointments')
    const waitingQuery = query(
      waitingPatientsRef,
      where('appointmentDate', '==', today),
      where('doctorName', '==', doctorName)
    )

    // Query for weekly prescriptions
    const weeklyPrescriptionsRef = collection(db, 'prescriptions')
    const weeklyQuery = query(
      weeklyPrescriptionsRef,
      where('doctorId', '==', currentUser.uid)
    )

    // Set up real-time listeners
    const unsubscribeToday = onSnapshot(todayQuery, (snapshot) => {
      const todayCount = snapshot.docs.length
      setStats(prev => ({ ...prev, todayAppointments: todayCount }))
    })

    const unsubscribeWaiting = onSnapshot(waitingQuery, (snapshot) => {
      const waitingCount = snapshot.docs.filter(doc => {
        const data = doc.data()
        return data.status === 'token_generated' || data.status === 'in_progress'
      }).length
      setStats(prev => ({ ...prev, waitingPatients: waitingCount }))
    })

    const unsubscribeWeekly = onSnapshot(weeklyQuery, (snapshot) => {
      const weeklyCount = snapshot.docs.filter(doc => {
        const data = doc.data()
        const createdAt = new Date(data.createdAt)
        return createdAt >= weekStart
      }).length
      setStats(prev => ({ ...prev, weeklyPrescriptions: weeklyCount, loading: false }))
    })

    return () => {
      unsubscribeToday()
      unsubscribeWaiting()
      unsubscribeWeekly()
    }
  }, [doctorName, currentUser])

  return (
    <div className="flex min-h-screen bg-hero-palette" style={{ color: 'var(--color-6)' }}>
      {/* Sidebar */}
      <Sidebar userRole="doctor" />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <Link to="/doctor/appointments" className="card-surface rounded-2xl p-6 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FaCalendar className="w-6 h-6 text-primary-400" />
                <h3 className="text-lg font-semibold">Atendimentos de hoje</h3>
              </div>
              <FaCalendarDay className="w-4 h-4 text-primary-400" />
            </div>
            {stats.loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2" style={{ borderColor: 'rgba(255,255,255,0.12)', borderTopColor: 'var(--accent-blue)' }}></div>
                <p className="text-lg text-muted">Carregando...</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-primary-400">{stats.todayAppointments}</p>
                <p className="text-sm text-muted mt-2">
                  {stats.todayAppointments === 0 ? 'Nenhum atendimento hoje' : 
                   stats.todayAppointments === 1 ? 'atendimento agendado' : 
                   'atendimentos agendados'}
                </p>
              </>
            )}
            <p className="text-xs text-primary-400 mt-2">Clique para ver todos os atendimentos →</p>
          </Link>

          <Link to="/doctor/tokens" className="card-surface rounded-2xl p-6 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FaHashtag className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold">Fila de Pacientes</h3>
              </div>
              <FaHashtag className="w-4 h-4 text-yellow-400" />
            </div>
            {stats.loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2" style={{ borderColor: 'rgba(255,255,255,0.12)', borderTopColor: 'rgba(250,204,21,0.9)' }}></div>
                <p className="text-lg text-muted">Carregando...</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-yellow-400">{stats.waitingPatients}</p>
                <p className="text-sm text-muted mt-2">
                  {stats.waitingPatients === 0 ? 'Nenhum paciente aguardando' :
                   stats.waitingPatients === 1 ? 'paciente aguardando' :
                   'pacientes aguardando'}
                </p>
              </>
            )}
            <p className="text-xs text-yellow-400 mt-2">Clique para ver a fila →</p>
          </Link>

          <Link to="/doctor/prescriptions" className="card-surface rounded-2xl p-6 transition-colors cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FaPills className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold">Prescrições</h3>
              </div>
              <FaFileLines className="w-4 h-4 text-purple-400" />
            </div>
            {stats.loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2" style={{ borderColor: 'rgba(255,255,255,0.12)', borderTopColor: 'rgba(168,85,247,0.9)' }}></div>
                <p className="text-lg text-muted">Carregando...</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-purple-400">{stats.weeklyPrescriptions}</p>
                <p className="text-sm text-slate-400 mt-2">
                  {stats.weeklyPrescriptions === 0 ? 'Nenhuma prescrição nesta semana' :
                   'prescrições nesta semana'}
                </p>
              </>
            )}
            <p className="text-xs text-purple-400 mt-2">Clique para gerenciar prescrições →</p>
          </Link>
        </div>

        {/* Quick Actions */}
          <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Ações rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/doctor/appointments" className="card-surface rounded-xl p-4 transition-colors">
              <div className="flex items-center space-x-3">
                  <FaCalendar className="w-5 h-5 text-primary-400" />
                <div>
                  <h3 className="font-semibold">Ver atendimentos</h3>
                  <p className="text-sm text-slate-400">Gerenciar agendamentos de pacientes</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/prescriptions/create" className="card-surface rounded-xl p-4 transition-colors">
              <div className="flex items-center space-x-3">
                <FaPlus className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="font-semibold">Nova prescrição</h3>
                  <p className="text-sm text-slate-400">Criar prescrição para o paciente</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/prescriptions" className="card-surface rounded-xl p-4 transition-colors">
              <div className="flex items-center space-x-3">
                <FaFileLines className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-semibold">Ver prescrições</h3>
                  <p className="text-sm text-slate-400">Gerenciar todas as prescrições</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/prescriptions/medicines" className="card-surface rounded-xl p-4 transition-colors">
              <div className="flex items-center space-x-3">
                <FaPills className="w-5 h-5 text-yellow-400" />
                <div>
                  <h3 className="font-semibold">Gerenciar medicamentos</h3>
                  <p className="text-sm text-slate-400">Adicionar/editar estoque de medicamentos</p>
                </div>
              </div>
            </Link>

            <Link to="/doctor/tokens" className="card-surface rounded-xl p-4 transition-colors">
              <div className="flex items-center space-x-3">
                <FaHashtag className="w-5 h-5 text-primary-400" />
                <div>
                  <h3 className="font-semibold">Fila de Pacientes</h3>
                  <p className="text-sm text-slate-400">Visualizar e gerenciar senhas de pacientes</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

  {/* User Info Card */}
  <div className="mt-8 card-surface rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Informações da conta</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">E‑mail</p>
              <p className="text-white font-medium">{currentUser?.email}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Função</p>
              <p className="text-primary-400 font-medium capitalize">{userRole === 'doctor' ? 'Médico' : userRole === 'receptionist' ? 'Recepcionista' : userRole}</p>
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


