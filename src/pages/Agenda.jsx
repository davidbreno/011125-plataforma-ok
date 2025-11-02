import { useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaPlus, FaClock, FaUser, FaPhone } from 'react-icons/fa'

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)) // November 2025
  const [selectedDate, setSelectedDate] = useState(null)

  // Mock appointments
  const appointments = {
    '2025-11-05': [
      { id: 1, time: '09:00', patient: 'João Silva', phone: '(11) 98765-4321', type: 'Consulta' },
      { id: 2, time: '10:30', patient: 'Maria Santos', phone: '(11) 97654-3210', type: 'Retorno' }
    ],
    '2025-11-06': [
      { id: 3, time: '14:00', patient: 'Pedro Costa', phone: '(11) 96543-2109', type: 'Implante' }
    ],
    '2025-11-07': [
      { id: 4, time: '09:30', patient: 'Ana Oliveira', phone: '(11) 95432-1098', type: 'Limpeza' },
      { id: 5, time: '11:00', patient: 'Carlos Souza', phone: '(11) 94321-0987', type: 'Canal' },
      { id: 6, time: '15:00', patient: 'Julia Lima', phone: '(11) 93210-9876', type: 'Consulta' }
    ]
  }

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
    return dateKey && appointments[dateKey] && appointments[dateKey].length > 0
  }

  const isToday = (day) => {
    const today = new Date()
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear()
  }

  const days = getDaysInMonth(currentDate)

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
        <button className="btn-primary flex items-center gap-2">
          <FaPlus />
          Novo Agendamento
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

        {/* Appointments List */}
        <div className="card-surface">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            {selectedDate ? `Agendamentos - ${selectedDate}` : 'Selecione uma data'}
          </h3>

          {selectedDate && appointments[selectedDate] ? (
            <div className="space-y-3">
              {appointments[selectedDate].map(appt => (
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
              <button className="mt-4 btn-primary">
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
          <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>0</div>
        </div>
        <div className="card-surface">
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-light)' }}>
            Esta Semana
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>8</div>
        </div>
        <div className="card-surface">
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-light)' }}>
            Este Mês
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>32</div>
        </div>
        <div className="card-surface">
          <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-light)' }}>
            Taxa de Ocupação
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>78%</div>
        </div>
      </div>
    </div>
  )
}
