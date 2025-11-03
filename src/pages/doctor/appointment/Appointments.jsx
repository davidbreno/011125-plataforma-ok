import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Check,
  X,
  AlertTriangle,
  Search,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  ArrowLeft
} from 'lucide-react'
import { supabase } from '../../../supabase/config'

export default function DoctorAppointments() {
  const { currentUser } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [filteredAppointments, setFilteredAppointments] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState('today') // today, week, month
  const [searchTerm, setSearchTerm] = useState('')
      const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showPatientDetails, setShowPatientDetails] = useState(false)

  const [doctorName, setDoctorName] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientAge: '',
    patientGender: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '',
    appointmentType: 'consultation',
    notes: ''
  })

  // Buscar o nome do dentista no Supabase (tabela public.users)
  useEffect(() => {
    if (!currentUser) return

    const fetchDoctorName = async () => {
      try {
        // Busca no perfil público (public.users) se existir; senão usa displayName/email
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', currentUser.id)
          .maybeSingle()

        if (error) throw error

        const name = data?.full_name || currentUser.user_metadata?.full_name || 'Dr. David'
        setDoctorName(name)
      } catch (error) {
        console.error('Error fetching doctor name:', error)
        setDoctorName(currentUser?.user_metadata?.full_name || 'Dr. David')
      }
    }

    fetchDoctorName()
  }, [currentUser])

  // Carregar atendimentos do dentista logado (Supabase)
  useEffect(() => {
    if (!currentUser || !doctorName) return

  toast.success('Carregando seus atendimentos...')
    
    let channel

    const load = async () => {
      const doctorId = currentUser.id
      // Primeiro, por id do médico
      let { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar atendimentos:', error)
        toast.error('Erro ao carregar atendimentos')
        return
      }

      // Se não houver por id, tentar por nome (dados antigos)
      if (!data || data.length === 0) {
        try {
          const byName = await supabase
            .from('appointments')
            .select('*')
            .eq('doctor_name', doctorName)
            .order('created_at', { ascending: false })
          if (!byName.error) {
            data = byName.data
          } else {
            // Ignora erro quando a coluna ainda não existe no schema (42703)
            if (byName.error.code !== '42703') {
              console.error('Erro ao buscar por nome:', byName.error)
            }
          }
        } catch {
          // Falha silenciosa quando coluna não existe
        }
      }

      const mapped = (data || []).map(row => ({
        id: row.id,
        patientName: row.patient_name,
        patientPhone: row.patient_phone,
        patientEmail: row.patient_email,
        patientAge: row.patient_age || '',
        patientGender: row.patient_gender || '',
        appointmentDate: row.appointment_date,
        appointmentTime: row.appointment_time,
        appointmentType: row.appointment_type || 'consultation',
        status: row.status || 'scheduled',
        notes: row.notes || '',
        symptoms: row.symptoms || row.extra?.symptoms || '',
        medicalHistory: row.medical_history || row.extra?.medical_history || '',
        medications: row.medications || row.extra?.medications || '',
        vitalSigns: row.vital_signs || row.extra?.vital_signs || {},
        doctorId: row.doctor_id,
        doctorName: row.doctor_name || doctorName
      }))
      setAppointments(mapped)
      toast.success(`Carregados ${mapped.length} atendimentos`)
    }

    load()

    channel = supabase
      .channel('doctor-appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, load)
      .subscribe()

    return () => { channel && supabase.removeChannel(channel) }
  }, [currentUser, doctorName])

  useEffect(() => {
    let filtered = appointments

    // Filter by date based on view mode
    if (viewMode === 'today') {
      filtered = filtered.filter(apt => apt.appointmentDate === selectedDate)
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(selectedDate)
      const endOfWeek = new Date(selectedDate)
      endOfWeek.setDate(endOfWeek.getDate() + 7)
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= startOfWeek && aptDate < endOfWeek
      })
    } else if (viewMode === 'month') {
      const startOfMonth = new Date(selectedDate)
      const endOfMonth = new Date(selectedDate)
      endOfMonth.setMonth(endOfMonth.getMonth() + 1)
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= startOfMonth && aptDate < endOfMonth
      })
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointmentType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredAppointments(filtered)
  }, [appointments, selectedDate, viewMode, searchTerm])

  // Helpers for scheduling within Doctor portal
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`
      const display = hour < 12 ? `${hour}:00 AM` : `${hour === 12 ? 12 : hour - 12}:00 PM`
      slots.push({ value: time, label: display })
    }
    return slots
  }

  const getMinDate = () => new Date().toISOString().split('T')[0]
  const getMaxDate = () => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return d.toISOString().split('T')[0]
  }

  const validateForm = () => {
    if (!formData.patientName.trim()) { toast.error('Informe o nome do paciente'); return false }
    if (!formData.patientPhone.trim()) { toast.error('Informe o telefone'); return false }
    if (!formData.patientEmail.trim()) { toast.error('Informe o e-mail'); return false }
    if (!formData.appointmentDate) { toast.error('Selecione a data'); return false }
    if (!formData.appointmentTime) { toast.error('Selecione o horário'); return false }
    return true
  }

  const openCreate = () => {
    setFormData({
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      patientAge: '',
      patientGender: '',
      appointmentDate: getMinDate(),
      appointmentTime: '',
      appointmentType: 'consultation',
      notes: ''
    })
    setShowCreateModal(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)
    try {
      const fullPayload = {
        patient_name: formData.patientName,
        patient_phone: formData.patientPhone,
        patient_email: formData.patientEmail,
        patient_age: formData.patientAge ? Number(formData.patientAge) : null,
        patient_gender: formData.patientGender || null,
        appointment_date: formData.appointmentDate,
        appointment_time: formData.appointmentTime,
        appointment_type: formData.appointmentType || 'consultation',
        notes: formData.notes || null,
        status: 'scheduled',
        doctor_id: currentUser?.id || null,
        doctor_name: doctorName,
        created_by: currentUser?.id || null
      }

      // Tenta inserir com o payload completo (schema moderno)
      let { error } = await supabase.from('appointments').insert(fullPayload)
      if (error) {
        // Quando colunas não existem no schema atual (ex.: "appointment_type" / "doctor_name" / "created_by"),
        // fazemos fallback para um payload mínimo compatível com o schema simples.
        const isMissingColumn =
          error.code === 'PGRST204' ||
          /column .* does not exist/i.test(error.message || '') ||
          /Could not find the .* column/i.test(error.message || '')

        if (isMissingColumn) {
          const minimalPayload = {
            patient_name: formData.patientName,
            patient_phone: formData.patientPhone,
            patient_email: formData.patientEmail,
            appointment_date: formData.appointmentDate,
            appointment_time: formData.appointmentTime,
            status: 'scheduled',
            notes: formData.notes || null,
            doctor_id: currentUser?.id || null
          }
          const retry = await supabase.from('appointments').insert(minimalPayload)
          if (retry.error) throw retry.error
        } else {
          throw error
        }
      }
      toast.success('Atendimento agendado com sucesso')
      setShowCreateModal(false)
    } catch (err) {
      console.error('Erro ao agendar:', err)
      toast.error('Erro ao agendar atendimento')
    } finally {
      setSaving(false)
    }
  }

  const handleViewPatientDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setShowPatientDetails(true)
    toast.success('Patient details opened!')
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.trim()) {
      toast.success(`Searching for: "${value}"`)
    }
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    toast.success(`Viewing appointments: ${mode}`)
  }

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', appointmentId)
      if (error) throw error
      toast.success('Appointment marked as completed!')
    } catch (error) {
      console.error('Error completing appointment:', error)
      toast.error(`Error completing appointment: ${error.message}`)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', appointmentId)
      if (error) throw error
      toast.success('Appointment cancelled successfully!')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast.error(`Error cancelling appointment: ${error.message}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400 bg-blue-400/10'
      case 'completed': return 'text-green-400 bg-green-400/10'
      case 'cancelled': return 'text-red-400 bg-red-400/10'
      case 'rescheduled': return 'text-yellow-400 bg-yellow-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

     const getStatusIcon = (status) => {
     switch (status) {
       case 'scheduled': return <Clock className="w-4 h-4" />
       case 'completed': return <Check className="w-4 h-4" />
       case 'cancelled': return <X className="w-4 h-4" />
       case 'rescheduled': return <Calendar className="w-4 h-4" />
       default: return <AlertTriangle className="w-4 h-4" />
     }
   }

  const getAppointmentTypeColor = (type) => {
    switch (type) {
      case 'consultation': return 'text-purple-400 bg-purple-400/10'
      case 'checkup': return 'text-green-400 bg-green-400/10'
      case 'emergency': return 'text-red-400 bg-red-400/10'
      case 'followup': return 'text-blue-400 bg-blue-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const todayAppointments = filteredAppointments.filter(apt => apt.appointmentDate === selectedDate)
  const upcomingAppointments = filteredAppointments.filter(apt => 
    apt.appointmentDate > selectedDate && apt.status === 'scheduled'
  )

  return (
    <div className="min-h-screen p-8 bg-hero-dark">
      {/* Header */}
      <header className="card-surface p-6 mb-6" style={{ borderRadius: '1.5rem' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link 
              to="/doctor"
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-light)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar ao Dashboard</span>
            </Link>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
              <User className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Atendimentos de Pacientes</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Bem-vindo, {doctorName || 'Dr. David'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={openCreate}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              Registrar
            </button>
            <button 
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="space-y-6">
        {/* Controls */}
        <div className="card-surface">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-light)' }} />
                <input
                  type="text"
                  placeholder="Buscar pacientes..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2.5 rounded-lg w-full outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-bg)', 
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewModeChange('today')}
                  className="px-3 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                  style={{
                    backgroundColor: viewMode === 'today' ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: viewMode === 'today' ? 'white' : 'var(--color-text)'
                  }}
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Hoje</span>
                </button>
                <button
                  onClick={() => handleViewModeChange('week')}
                  className="px-3 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                  style={{
                    backgroundColor: viewMode === 'week' ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: viewMode === 'week' ? 'white' : 'var(--color-text)'
                  }}
                >
                  <CalendarRange className="w-4 h-4" />
                  <span>Semana</span>
                </button>
                <button
                  onClick={() => handleViewModeChange('month')}
                  className="px-3 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
                  style={{
                    backgroundColor: viewMode === 'month' ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: viewMode === 'month' ? 'white' : 'var(--color-text)'
                  }}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Mês</span>
                </button>
              </div>
            </div>
            
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 rounded-lg outline-none"
              style={{ 
                backgroundColor: 'var(--color-bg)', 
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="card-surface">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Calendar className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            <span>Atendimentos de Hoje ({todayAppointments.length})</span>
          </h2>
          
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
              <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-light)' }} />
              <p style={{ color: 'var(--color-text-light)' }}>Nenhum atendimento agendado para hoje</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="card-surface">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{appointment.patientName}</h3>
                      <p style={{ color: 'var(--color-text-light)' }}>{appointment.patientAge || 'N/A'} anos, {appointment.patientGender || 'N/A'}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="capitalize">{appointment.status}</span>
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentTypeColor(appointment.appointmentType)}`}>
                        {appointment.appointmentType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                                         <div className="flex items-center space-x-2">
                       <Clock className="w-4 h-4 text-slate-400" />
                       <span className="text-slate-300">{appointment.appointmentTime}</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <Phone className="w-4 h-4 text-slate-400" />
                       <span className="text-slate-300">{appointment.patientPhone}</span>
                     </div>
                     <div className="flex items-center space-x-2">
                       <Mail className="w-4 h-4 text-slate-400" />
                       <span className="text-slate-300">{appointment.patientEmail}</span>
                     </div>
                  </div>
                  
                  {appointment.symptoms && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-1">Symptoms:</h4>
                      <p className="text-sm text-slate-400">{appointment.symptoms}</p>
                    </div>
                  )}
                  
                  {appointment.notes && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-300 mb-1">Notes:</h4>
                      <p className="text-sm text-slate-400">{appointment.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewPatientDetails(appointment)}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                    >
                      View Details
                    </button>
                    {appointment.status === 'scheduled' && (
                      <>
                                                 <button
                           onClick={() => handleCompleteAppointment(appointment.id)}
                           className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                         >
                           <Check className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => handleCancelAppointment(appointment.id)}
                           className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                         >
                           <X className="w-4 h-4" />
                         </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                             <Calendar className="w-5 h-5 text-green-400" />
              <span>Upcoming Appointments ({upcomingAppointments.length})</span>
            </h2>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                    <div>
                      <h3 className="font-semibold">{appointment.patientName}</h3>
                      <p className="text-sm text-slate-400">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAppointmentTypeColor(appointment.appointmentType)}`}>
                        {appointment.appointmentType}
                      </span>
                      <button
                        onClick={() => handleViewPatientDetails(appointment)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Appointment Modal (Doctor) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Novo Atendimento</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Paciente</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">E-mail</label>
                  <input
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data</label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Horário</label>
                  <select
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg [&>option]:text-black [&>option]:bg-white"
                    required
                  >
                    <option value="">Selecione</option>
                    {generateTimeSlots().map((slot) => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                  <select
                    value={formData.appointmentType}
                    onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                    className="w-full px-3 py-2 border border-white/10 rounded-lg [&>option]:text-black [&>option]:bg-white"
                  >
                    <option value="consultation">Consulta</option>
                    <option value="checkup">Checkup</option>
                    <option value="followup">Retorno</option>
                    <option value="emergency">Emergência</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg"
                  placeholder="Detalhes adicionais"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold">Patient Details</h2>
              <button
                onClick={() => setShowPatientDetails(false)}
                className="text-slate-400 hover:text-white"
              >
     <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Information */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Patient Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span className="font-medium">{selectedAppointment.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Age:</span>
                      <span>{selectedAppointment.patientAge || 'N/A'} years old</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gender:</span>
                      <span>{selectedAppointment.patientGender || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span>{selectedAppointment.patientPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span>{selectedAppointment.patientEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Vital Signs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 text-sm">Blood Pressure</span>
                      <p className="font-medium">{selectedAppointment.vitalSigns?.bloodPressure || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Heart Rate</span>
                      <p className="font-medium">{selectedAppointment.vitalSigns?.heartRate || 'N/A'} bpm</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Temperature</span>
                      <p className="font-medium">{selectedAppointment.vitalSigns?.temperature || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Weight</span>
                      <p className="font-medium">{selectedAppointment.vitalSigns?.weight || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Medical History</h3>
                  <p className="text-slate-300">{selectedAppointment.medicalHistory || 'No medical history available'}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Current Medications</h3>
                  <p className="text-slate-300">{selectedAppointment.medications || 'No medications listed'}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Current Symptoms</h3>
                  <p className="text-slate-300">{selectedAppointment.symptoms || 'No symptoms reported'}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">Appointment Notes</h3>
                  <p className="text-slate-300">{selectedAppointment.notes || 'No notes available'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowPatientDetails(false)}
                className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              {selectedAppointment.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => {
                      handleCompleteAppointment(selectedAppointment.id)
                      setShowPatientDetails(false)
                    }}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => {
                      handleCancelAppointment(selectedAppointment.id)
                      setShowPatientDetails(false)
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Cancel Appointment
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
