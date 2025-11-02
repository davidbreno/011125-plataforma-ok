import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  FaStethoscope, 
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUser,
  FaClock,
  FaCalendar,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle
} from 'react-icons/fa'
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function Attendance() {
  const { currentUser } = useAuth()
  const isUserReady = !!(currentUser && currentUser.uid)
  const [attendances, setAttendances] = useState([])
  const [filteredAttendances, setFilteredAttendances] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState(null)
  const [formData, setFormData] = useState({
    patientName: '',
    date: '',
    time: '',
    type: 'consulta',
    status: 'agendado',
    symptoms: '',
    diagnosis: '',
    treatment: '',
    notes: ''
  })

  // Fetch attendances
  useEffect(() => {
    const attendancesRef = collection(db, 'attendances')
    const q = query(attendancesRef, orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const attendancesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setAttendances(attendancesData)
      setFilteredAttendances(attendancesData)
    })
    return () => unsubscribe()
  }, [])

  // Filter by search and status
  useEffect(() => {
    let filtered = attendances

    // Status filter
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(att => att.status === statusFilter)
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(att => 
        att.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.symptoms?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredAttendances(filtered)
  }, [searchTerm, statusFilter, attendances])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!currentUser || !currentUser.uid) {
        toast.error('Sessão do usuário ainda não carregou. Tente novamente em alguns segundos.')
        return
      }
      if (editingAttendance) {
        const updatePayload = {
          ...formData,
          updatedAt: serverTimestamp(),
        }
        if (currentUser?.uid) updatePayload.updatedBy = currentUser.uid
        await updateDoc(doc(db, 'attendances', editingAttendance.id), updatePayload)
        toast.success('Atendimento atualizado com sucesso!')
      } else {
        const createPayload = {
          ...formData,
          doctorName: currentUser?.displayName || currentUser?.email || 'Desconhecido',
          createdAt: serverTimestamp(),
        }
        if (currentUser?.uid) createPayload.createdBy = currentUser.uid
        await addDoc(collection(db, 'attendances'), createPayload)
        toast.success('Atendimento registrado com sucesso!')
      }
      setShowModal(false)
      setEditingAttendance(null)
      setFormData({
        patientName: '',
        date: '',
        time: '',
        type: 'consulta',
        status: 'agendado',
        symptoms: '',
        diagnosis: '',
        treatment: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erro ao salvar atendimento')
    }
  }

  const handleEdit = (attendance) => {
    setEditingAttendance(attendance)
    setFormData({
      patientName: attendance.patientName || '',
      date: attendance.date || '',
      time: attendance.time || '',
      type: attendance.type || 'consulta',
      status: attendance.status || 'agendado',
      symptoms: attendance.symptoms || '',
      diagnosis: attendance.diagnosis || '',
      treatment: attendance.treatment || '',
      notes: attendance.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (attendanceId) => {
    if (window.confirm('Tem certeza que deseja excluir este atendimento?')) {
      try {
        await deleteDoc(doc(db, 'attendances', attendanceId))
        toast.success('Atendimento excluído com sucesso!')
      } catch (error) {
        console.error('Error:', error)
        toast.error('Erro ao excluir atendimento')
      }
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'concluido':
        return <FaCheckCircle style={{ color: '#10b981' }} />
      case 'em_andamento':
        return <FaHourglassHalf style={{ color: '#f59e0b' }} />
      case 'cancelado':
        return <FaTimesCircle style={{ color: '#dc2626' }} />
      default:
        return <FaClock style={{ color: '#3b82f6' }} />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'concluido':
        return '#10b981'
      case 'em_andamento':
        return '#f59e0b'
      case 'cancelado':
        return '#dc2626'
      default:
        return '#3b82f6'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'concluido':
        return 'Concluído'
      case 'em_andamento':
        return 'Em Andamento'
      case 'cancelado':
        return 'Cancelado'
      default:
        return 'Agendado'
    }
  }

  return (
    <div className="min-h-screen p-8 bg-hero-dark">
      {/* Header */}
      <header className="p-6 card-surface mb-6" style={{ borderRadius: '1.5rem' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Link 
              to="/doctor"
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-light)' }}
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar ao Dashboard</span>
            </Link>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
              <FaStethoscope className="text-xl" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Atendimentos</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Registre e acompanhe atendimentos</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Novo Atendimento
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Search and Filter Bar */}
        <div className="card-surface p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-light)' }} />
              <input
                type="text"
                placeholder="Buscar por paciente, diagnóstico ou sintomas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-lg w-full outline-none"
                style={{ 
                  backgroundColor: 'var(--color-bg)', 
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)'
                }}
              />
            </div>
            
            <div className="flex gap-2">
              {['todos', 'agendado', 'em_andamento', 'concluido', 'cancelado'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: statusFilter === status ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: statusFilter === status ? '#0b111b' : 'var(--color-text-light)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {status === 'todos' ? 'Todos' : getStatusText(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance List */}
        <div className="space-y-4">
          {filteredAttendances.map((attendance) => (
            <div key={attendance.id} className="card-surface p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
                      <FaUser style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>
                          {attendance.patientName}
                        </h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(attendance.status)}
                          <span className="text-sm font-medium" style={{ color: getStatusColor(attendance.status) }}>
                            {getStatusText(attendance.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm mb-3" style={{ color: 'var(--color-text-light)' }}>
                        <div className="flex items-center gap-2">
                          <FaCalendar className="w-4 h-4" />
                          {attendance.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <FaClock className="w-4 h-4" />
                          {attendance.time}
                        </div>
                        <div className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg)' }}>
                          {attendance.type}
                        </div>
                      </div>

                      {attendance.symptoms && (
                        <div className="mb-2">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Sintomas: </span>
                          <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>{attendance.symptoms}</span>
                        </div>
                      )}
                      
                      {attendance.diagnosis && (
                        <div className="mb-2">
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Diagnóstico: </span>
                          <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>{attendance.diagnosis}</span>
                        </div>
                      )}

                      {attendance.treatment && (
                        <div>
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Tratamento: </span>
                          <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>{attendance.treatment}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <button
                    onClick={() => handleEdit(attendance)}
                    className="px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'var(--color-primary)', color: '#0b111b' }}
                  >
                    <FaEdit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(attendance.id)}
                    className="px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                  >
                    <FaTrash className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAttendances.length === 0 && (
          <div className="card-surface p-12 text-center">
            <FaStethoscope className="text-6xl mx-auto mb-4" style={{ color: 'var(--color-text-light)', opacity: 0.3 }} />
            <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>
              {searchTerm || statusFilter !== 'todos' ? 'Nenhum atendimento encontrado' : 'Nenhum atendimento registrado'}
            </p>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card-surface p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              {editingAttendance ? 'Editar Atendimento' : 'Novo Atendimento'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Nome do Paciente *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.patientName}
                    onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Horário *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <option value="consulta">Consulta</option>
                    <option value="retorno">Retorno</option>
                    <option value="emergencia">Emergência</option>
                    <option value="exame">Exame</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <option value="agendado">Agendado</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Sintomas
                  </label>
                  <textarea
                    rows="2"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none resize-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    placeholder="Descreva os sintomas do paciente..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Diagnóstico
                  </label>
                  <textarea
                    rows="2"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none resize-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    placeholder="Diagnóstico médico..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Tratamento
                  </label>
                  <textarea
                    rows="2"
                    value={formData.treatment}
                    onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none resize-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    placeholder="Tratamento prescrito..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Observações
                  </label>
                  <textarea
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none resize-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                    placeholder="Observações adicionais..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 items-center">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={!isUserReady}
                  style={!isUserReady ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                  {editingAttendance ? 'Atualizar' : 'Registrar'}
                </button>
                {!isUserReady && (
                  <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                    Carregando sessão...
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingAttendance(null)
                    setFormData({
                      patientName: '',
                      date: '',
                      time: '',
                      type: 'consulta',
                      status: 'agendado',
                      symptoms: '',
                      diagnosis: '',
                      treatment: '',
                      notes: ''
                    })
                  }}
                  className="px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
