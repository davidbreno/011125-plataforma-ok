import { useEffect, useMemo, useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaPlus, FaClock, FaUser, FaPhone } from 'react-icons/fa'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../supabase/config'
import { useNavigate } from 'react-router-dom'

export default function Agenda() {
  const navigate = useNavigate()
  const { currentUser, userRole } = useAuth()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10))
  const [viewMode, setViewMode] = useState('month') // 'month' | 'week'
  const [doctorName, setDoctorName] = useState('')
  const [loading, setLoading] = useState(false)
  const [appointmentsByDate, setAppointmentsByDate] = useState({})

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getDateKey = (day) => {
    if (!day) return null
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const hasAppointments = (day) => {
    const dateKey = getDateKey(day)
    const list = dateKey && appointmentsByDate[dateKey]
    return list && list.length > 0
  }

  const isToday = (day) => {
    const today = new Date()
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear()
  }

  const days = getDaysInMonth(currentDate)

  // Helpers para intervalo do mês atual
  const monthRange = useMemo(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    const start = new Date(y, m, 1)
    const end = new Date(y, m + 1, 1)
    const startStr = start.toISOString().slice(0,10)
    const endStr = end.toISOString().slice(0,10)
    return { startStr, endStr }
  }, [currentDate])

  // Helpers para intervalo da semana selecionada (domingo a domingo)
  const weekRange = useMemo(() => {
    const base = selectedDate ? new Date(selectedDate) : new Date()
    const start = new Date(base)
    start.setDate(base.getDate() - base.getDay())
    start.setHours(0,0,0,0)
    const end = new Date(start)
    end.setDate(start.getDate() + 7)
    const startStr = start.toISOString().slice(0,10)
    const endStr = end.toISOString().slice(0,10)
    return { startStr, endStr }
  }, [selectedDate])

  // Buscar nome do médico (quando role = doctor)
  useEffect(() => {
    if (!currentUser || userRole !== 'doctor') return
    let isMounted = true
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', currentUser.id)
          .maybeSingle()
        if (error) throw error
        const name = data?.full_name || currentUser.user_metadata?.full_name || 'Dr. David'
        if (isMounted) setDoctorName(name || 'Dr. David')
      } catch {
        if (isMounted) setDoctorName(currentUser.user_metadata?.full_name || 'Dr. David')
      }
    })()
    return () => { isMounted = false }
  }, [currentUser, userRole])

  // Carregar compromissos (mês ou semana), filtrando por role
  useEffect(() => {
    if (!currentUser) return
    let channel
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const range = viewMode === 'week' ? weekRange : monthRange
        let query = supabase
          .from('appointments')
          .select('*')
          .gte('appointment_date', range.startStr)
          .lt('appointment_date', range.endStr)

        if (userRole === 'doctor') {
          query = query.eq('doctor_id', currentUser.id)
        }

        let { data, error } = await query.order('appointment_date', { ascending: true })
        if (error) throw error

        // Caso seja médico e não encontre por id (dados antigos), tenta por nome
        if ((userRole === 'doctor') && (!data || data.length === 0) && doctorName) {
          const byName = await supabase
            .from('appointments')
            .select('*')
            .gte('appointment_date', range.startStr)
            .lt('appointment_date', range.endStr)
            .eq('doctor_name', doctorName)
            .order('appointment_date', { ascending: true })
          if (!byName.error) data = byName.data
        }

        if (cancelled) return
        const grouped = {}
        for (const row of (data || [])) {
          const key = row.appointment_date
          const item = {
            id: row.id,
            time: row.appointment_time,
            patient: row.patient_name,
            phone: row.patient_phone,
            type: row.appointment_type || 'Consulta',
            status: row.status || 'scheduled',
            doctorName: row.doctor_name || ''
          }
          if (!grouped[key]) grouped[key] = []
          grouped[key].push(item)
        }
        setAppointmentsByDate(grouped)
      } catch (e) {
        console.error('Erro ao carregar agenda:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()

    channel = supabase
      .channel('agenda-appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, load)
      .subscribe()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [currentUser, userRole, monthRange, weekRange, viewMode, doctorName])

  const selectedList = selectedDate ? (appointmentsByDate[selectedDate] || []) : []

  const counts = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0,10)
    const startOfWeek = new Date()
    startOfWeek.setHours(0,0,0,0)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)
    const startWeekStr = startOfWeek.toISOString().slice(0,10)
    const endWeekStr = endOfWeek.toISOString().slice(0,10)

    let today = 0, week = 0, month = 0
    for (const [date, list] of Object.entries(appointmentsByDate)) {
      const len = list.length
      if (date === todayStr) today += len
      if (date >= startWeekStr && date < endWeekStr) week += len
      // mês atual já está filtrado pela query, então basta somar tudo
      month += len
    }
    return { today, week, month }
  }, [appointmentsByDate])

  // Agrupamento por dentista na visão semanal (apenas recepção)
  // Visão semanal por dentista removida (sem recepção)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Agenda</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-light)' }}>
            Gerencie seus agendamentos e compromissos
          </p>
        </div>
        <button
          onClick={() => navigate('/doctor/appointments')}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          Novo Agendamento
        </button>
      </div>

      {/* Controles de visualização */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('month')}
          className="px-3 py-2 rounded-lg font-medium"
          style={{ backgroundColor: viewMode === 'month' ? 'var(--color-primary)' : 'var(--color-bg)', color: viewMode === 'month' ? 'white' : 'var(--color-text)' }}
        >
          Mês
        </button>
        <button
          onClick={() => setViewMode('week')}
          className="px-3 py-2 rounded-lg font-medium"
          style={{ backgroundColor: viewMode === 'week' ? 'var(--color-primary)' : 'var(--color-bg)', color: viewMode === 'week' ? 'white' : 'var(--color-text)' }}
        >
          Semana
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card-surface">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={goToNextMonth}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
                style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div
                key={day}
                className="text-center text-xs font-bold py-2"
                style={{ color: 'var(--color-text-light)' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const dateKey = getDateKey(day)
              const hasAppts = hasAppointments(day)
              const isTodayDate = isToday(day)
              
              return (
                <button
                  key={index}
                  disabled={!day}
                  onClick={() => day && setSelectedDate(dateKey)}
                  className="aspect-square rounded-lg transition-all relative"
                  style={{
                    backgroundColor: 
                      selectedDate === dateKey ? 'var(--color-primary)' :
                      isTodayDate ? 'var(--color-secondary)' :
                      day ? 'var(--color-bg)' : 'transparent',
                    color: 
                      selectedDate === dateKey ? 'white' :
                      isTodayDate ? 'var(--color-primary)' :
                      'var(--color-text)',
                    fontWeight: isTodayDate || selectedDate === dateKey ? '700' : '500',
                    cursor: day ? 'pointer' : 'default'
                  }}
                >
                  {day && (
                    <>
                      <span className="text-sm">{day}</span>
                      {hasAppts && (
                        <div
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{
                            backgroundColor: selectedDate === dateKey ? 'white' : 'var(--color-primary)'
                          }}
                        />
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-light)' }}>Hoje</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-light)' }}>Com agendamentos</span>
            </div>
          </div>
        </div>

        {/* Appointments List (ou visão semanal por dentista) */}
        <div className="card-surface">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            {viewMode === 'week' ? 'Semana - por dentista' : (selectedDate ? `Agendamentos - ${selectedDate}` : 'Selecione uma data')}
          </h3>

          {selectedDate && selectedList.length > 0 ? (
            <div className="space-y-3">
              {selectedList.map(appt => (
                <div
                  key={appt.id}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-secondary)' }}
                      >
                        <FaUser className="text-sm" style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                          {appt.patient}
                        </div>
                        <div className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-light)' }}>
                          <FaPhone className="text-[10px]" />
                          {appt.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-light)' }}>
                      <FaClock />
                      {appt.time}
                    </div>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}
                    >
                      {appt.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedDate ? (
            <div className="text-center py-8">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
                style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-light)' }}
              >
                <FaClock />
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                Nenhum agendamento para esta data
              </p>
              <button
                onClick={() => navigate('/doctor/appointments')}
                className="mt-4 btn-primary"
              >
                <FaPlus className="inline mr-2" />
                Agendar
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                Clique em uma data no calendário para ver os agendamentos
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-surface">
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-light)' }}>
            Agendamentos Hoje
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{loading ? '…' : counts.today}</div>
        </div>
        <div className="card-surface">
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-light)' }}>
            Esta Semana
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{loading ? '…' : counts.week}</div>
        </div>
        <div className="card-surface">
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-light)' }}>
            Este Mês
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{loading ? '…' : counts.month}</div>
        </div>
        <div className="card-surface">
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-light)' }}>
            Taxa de Ocupação
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {loading ? '…' : `${Math.min(100, Math.round((counts.month / 120) * 100))}%`}
          </div>
        </div>
      </div>
    </div>
  )
}
