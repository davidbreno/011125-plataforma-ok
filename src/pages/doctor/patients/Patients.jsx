import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaCalendar, 
  FaSearch, 
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaArrowLeft
} from 'react-icons/fa'
import { supabase } from '../../../supabase/config'

export default function Patients() {
  const { currentUser } = useAuth()
  const userId = currentUser?.uid || currentUser?.id || null
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    address: '',
    medicalHistory: '',
    allergies: ''
  })

  // Fetch patients (Supabase)
  useEffect(() => {
    let mounted = true
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
      if (!mounted) return
      if (error) {
        console.error('Erro ao carregar pacientes:', error)
        toast.error('Erro ao carregar pacientes')
        return
      }
      const mapped = (data || []).map(p => ({
        id: p.id,
        name: p.full_name || '',
        email: p.email || '',
        phone: p.phone || '',
        cpf: p.cpf || '',
        birthDate: p.birth_date || '',
        address: p.address || '',
        medicalHistory: p.medical_history || '',
        allergies: p.allergies || '',
        createdAt: p.created_at,
      }))
      setPatients(mapped)
      setFilteredPatients(mapped)
    }
    fetchPatients()
    const channel = supabase
      .channel('patients_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, fetchPatients)
      .subscribe()
    return () => { mounted = false; supabase.removeChannel(channel) }
  }, [])

  // Search filter
  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.cpf.includes(searchTerm)
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [searchTerm, patients])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf || null,
        birth_date: formData.birthDate || null,
        address: formData.address || null,
        medical_history: formData.medicalHistory || null,
        allergies: formData.allergies || null,
        updated_by: userId || null,
      }
      if (editingPatient) {
        let { error } = await supabase
          .from('patients')
          .update(payload)
          .eq('id', editingPatient.id)
        // Fallback se alguma coluna não existir ainda (ex.: cpf)
        if (error && (error.code === 'PGRST204' || error.code === '42703')) {
          const minimal = { ...payload }
          delete minimal.cpf
          delete minimal.medical_history
          delete minimal.allergies
          const retry = await supabase
            .from('patients')
            .update(minimal)
            .eq('id', editingPatient.id)
          error = retry.error
        }
        if (error) throw error
        toast.success('Paciente atualizado com sucesso!')
      } else {
        let { error } = await supabase
          .from('patients')
          .insert([{ ...payload, created_by: userId || null }])
        // Fallback se alguma coluna não existir ainda (ex.: cpf)
        if (error && (error.code === 'PGRST204' || error.code === '42703')) {
          const minimal = { ...payload }
          delete minimal.cpf
          delete minimal.medical_history
          delete minimal.allergies
          const retry = await supabase
            .from('patients')
            .insert([{ ...minimal, created_by: userId || null }])
          error = retry.error
        }
        if (error) throw error
        toast.success('Paciente cadastrado com sucesso!')
      }
      setShowModal(false)
      setEditingPatient(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        birthDate: '',
        address: '',
        medicalHistory: '',
        allergies: ''
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Erro ao salvar paciente')
    }
  }

  const handleEdit = (patient) => {
    setEditingPatient(patient)
    setFormData({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone || '',
      cpf: patient.cpf || '',
      birthDate: patient.birthDate || '',
      address: patient.address || '',
      medicalHistory: patient.medicalHistory || '',
      allergies: patient.allergies || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (patientId) => {
    if (window.confirm('Tem certeza que deseja excluir este paciente?')) {
      try {
        const { error } = await supabase.from('patients').delete().eq('id', patientId)
        if (error) throw error
        toast.success('Paciente excluído com sucesso!')
      } catch (error) {
        console.error('Error:', error)
        toast.error('Erro ao excluir paciente')
      }
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
              <FaUser className="text-xl" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Pacientes</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>Gerencie os pacientes da clínica</p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Novo Paciente
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Search Bar */}
        <div className="card-surface p-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-light)' }} />
            <input
              type="text"
              placeholder="Buscar por nome, email, telefone ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-lg w-full outline-none"
              style={{ 
                backgroundColor: 'var(--input-bg)', 
                border: '1px solid var(--input-border)',
                color: 'var(--input-text)'
              }}
            />
          </div>
        </div>

        {/* Patients List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="card-surface p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
                    <FaUser className="text-xl" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>{patient.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>{patient.cpf}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <FaEnvelope style={{ color: 'var(--color-text-light)' }} />
                  <span style={{ color: 'var(--color-text-light)' }}>{patient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaPhone style={{ color: 'var(--color-text-light)' }} />
                  <span style={{ color: 'var(--color-text-light)' }}>{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaCalendar style={{ color: 'var(--color-text-light)' }} />
                  <span style={{ color: 'var(--color-text-light)' }}>
                    {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(patient)}
                  className="flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#0b111b' }}
                >
                  <FaEdit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                  className="flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' }}
                >
                  <FaEye className="w-4 h-4" />
                  Ver
                </button>
                <button
                  onClick={() => handleDelete(patient.id)}
                  className="py-2 px-3 rounded-lg transition-colors"
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="card-surface p-12 text-center">
            <FaUser className="text-6xl mx-auto mb-4" style={{ color: 'var(--color-text-light)', opacity: 0.3 }} />
            <p className="text-lg" style={{ color: 'var(--color-text-light)' }}>
              {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </p>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card-surface p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
              {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    CPF *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Histórico Médico
                </label>
                <textarea
                  rows="3"
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg outline-none resize-none"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  Alergias
                </label>
                <textarea
                  rows="2"
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg outline-none resize-none"
                  style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>

              <div className="flex gap-3 pt-4 items-center">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  
                >
                  {editingPatient ? 'Atualizar' : 'Cadastrar'}
                </button>
                {!userId && (
                  <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                    Carregando sessão...
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingPatient(null)
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      cpf: '',
                      birthDate: '',
                      address: '',
                      medicalHistory: '',
                      allergies: ''
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
