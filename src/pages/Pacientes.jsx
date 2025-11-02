import { useState, useEffect } from 'react'
import { supabase } from '../supabase/config'
import { FaSearch, FaUser, FaPhone, FaEnvelope, FaCalendar, FaEdit, FaEye, FaPlus } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function Pacientes() {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [filterGender, setFilterGender] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: '',
    address: '',
    blood_type: '',
    allergies: '',
    emergency_contact: '',
    emergency_phone: ''
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    filterPatientsList()
  }, [searchTerm, filterGender, patients])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setPatients(data || [])
      setFilteredPatients(data || [])
      if (data && data.length > 0) {
        toast.success(`${data.length} pacientes encontrados`)
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Erro ao carregar pacientes')
    } finally {
      setLoading(false)
    }
  }

  const filterPatientsList = () => {
    let filtered = patients

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.phone && patient.phone.includes(searchTerm)) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by gender
    if (filterGender !== 'all') {
      filtered = filtered.filter(patient => patient.gender === filterGender)
    }

    setFilteredPatients(filtered)
  }

  const handleAddPatient = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('patients')
        .insert([formData])
      
      if (error) throw error
      
      toast.success('Paciente adicionado com sucesso!')
      setShowAddModal(false)
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        birth_date: '',
        gender: '',
        address: '',
        blood_type: '',
        allergies: '',
        emergency_contact: '',
        emergency_phone: ''
      })
      fetchPatients()
    } catch (error) {
      console.error('Error adding patient:', error)
      toast.error('Erro ao adicionar paciente')
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Pacientes
        </h1>
        <p style={{ color: 'var(--color-text-light)' }}>
          Gerenciar informações de pacientes
        </p>
      </div>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Pacientes
          </h1>
          <p style={{ color: 'var(--color-text-light)' }}>
            Gerenciar informações de pacientes
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition"
          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
        >
          <FaPlus />
          Adicionar Paciente
        </button>
      </div>

      {/* Filters */}
      <div className="card-surface rounded-xl p-4 mb-6 border" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-light)' }} />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none"
              style={{
                backgroundColor: 'var(--color-bg)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)'
              }}
            />
          </div>
          
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none"
            style={{
              backgroundColor: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)'
            }}
          >
            <option value="all">Todos os Gêneros</option>
            <option value="Male">Masculino</option>
            <option value="Female">Feminino</option>
            <option value="Other">Outro</option>
          </select>
        </div>

        <div className="mt-3 text-sm" style={{ color: 'var(--color-text-light)' }}>
          {filteredPatients.length} de {patients.length} pacientes
        </div>
      </div>

      {/* Patients List */}
      {loading ? (
        <div className="card-surface rounded-xl p-8 text-center border" style={{ borderColor: 'var(--color-border)' }}>
          <div className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" style={{ borderTop: '2px solid var(--color-primary)', borderRight: '2px solid transparent' }}></div>
          <p style={{ color: 'var(--color-text-light)' }}>Carregando pacientes...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="card-surface rounded-xl p-8 text-center border" style={{ borderColor: 'var(--color-border)' }}>
          <FaUser className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-light)' }} />
          <p style={{ color: 'var(--color-text-light)' }}>
            {searchTerm || filterGender !== 'all' ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="card-surface rounded-xl p-6 border transition-shadow hover:shadow-lg"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--color-secondary)' }}
                  >
                    <FaUser style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {patient.full_name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                      {patient.gender ? `${patient.gender} • ` : ''}{patient.blood_type || 'Tipo sanguíneo não informado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <FaPhone className="w-4 h-4" style={{ color: 'var(--color-text-light)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                    {patient.phone || 'Telefone não informado'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaEnvelope className="w-4 h-4" style={{ color: 'var(--color-text-light)' }} />
                  <span className="text-sm truncate" style={{ color: 'var(--color-text)' }}>
                    {patient.email || 'Email não informado'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCalendar className="w-4 h-4" style={{ color: 'var(--color-text-light)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                    Cadastrado em: {patient.created_at ? new Date(patient.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                  onClick={() => toast.success('Visualizando histórico do paciente')}
                >
                  <FaEye className="w-3 h-3" />
                  <span>Ver Histórico</span>
                </button>
                <button
                  className="px-3 py-2 rounded-lg text-sm font-medium border transition-colors"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => toast.success('Editando informações do paciente')}
                >
                  <FaEdit />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card-surface rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
              Adicionar Novo Paciente
            </h2>
            
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Gênero
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <option value="">Selecione</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Tipo Sanguíneo
                  </label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <option value="">Selecione</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Alergias
                  </label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="2"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Contato de Emergência
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    Telefone de Emergência
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_phone}
                    onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg hover:opacity-90 transition"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                >
                  Adicionar Paciente
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
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
