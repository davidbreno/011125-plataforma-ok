import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import LogoutButton from '../../../components/LogoutButton'
import { 
  User, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Plus,
  Minus,
  Save,
  ArrowLeft,
  Pill,
  FileText,
  Search,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'
import { collection, addDoc, onSnapshot, query, orderBy, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase/config'

export default function CreatePrescription() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const medicineDropdownRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [patients, setPatients] = useState([])
  const [medicines, setMedicines] = useState([])
  const [filteredMedicines, setFilteredMedicines] = useState([])
    const [showMedicineDropdown, setShowMedicineDropdown] = useState(false)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [manualPatient, setManualPatient] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const [filteredPatients, setFilteredPatients] = useState([])

  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientAge: '',
    patientGender: '',
    patientPhone: '',
    patientEmail: '',
    prescriptionDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    symptoms: '',
    medicines: [],
    instructions: '',
    followUpDate: '',
    status: 'active',
    notes: ''
  })

  // Fetch prescription data for editing
  const fetchPrescriptionData = useCallback(async () => {
    if (!id) return
    
    setInitialLoading(true)
    try {
      // First try to fetch as prescription
      const prescriptionRef = doc(db, 'prescriptions', id)
      const prescriptionSnap = await getDoc(prescriptionRef)
      
      if (prescriptionSnap.exists()) {
        const prescriptionData = prescriptionSnap.data()
        
        // This is edit mode - editing an existing prescription
        setIsEditMode(true)
        
        // Set form data
        setFormData({
          patientId: prescriptionData.patientId || '',
          patientName: prescriptionData.patientName || '',
          patientAge: prescriptionData.patientAge || '',
          patientGender: prescriptionData.patientGender || '',
          patientPhone: prescriptionData.patientPhone || '',
          patientEmail: prescriptionData.patientEmail || '',
          prescriptionDate: prescriptionData.prescriptionDate || new Date().toISOString().split('T')[0],
          diagnosis: prescriptionData.diagnosis || '',
          symptoms: prescriptionData.symptoms || '',
          medicines: prescriptionData.medicines || [],
          instructions: prescriptionData.instructions || '',
          followUpDate: prescriptionData.followUpDate || '',
          status: prescriptionData.status || 'active',
          notes: prescriptionData.notes || ''
        })

        toast.success('Prescription data loaded successfully')
      } else {
        // If not a prescription, try to fetch as appointment
        const appointmentRef = doc(db, 'appointments', id)
        const appointmentSnap = await getDoc(appointmentRef)
        
        if (appointmentSnap.exists()) {
          const appointmentData = appointmentSnap.data()
          
          // This is create mode - creating a new prescription from appointment
          setIsEditMode(false)
          
          // Pre-fill form with appointment data
          setFormData(prev => ({
            ...prev,
            patientId: appointmentData.id,
            patientName: appointmentData.patientName || '',
            patientAge: appointmentData.patientAge || '',
            patientGender: appointmentData.patientGender || '',
            patientPhone: appointmentData.patientPhone || '',
            patientEmail: appointmentData.patientEmail || '',
            symptoms: appointmentData.symptoms || '',
            notes: appointmentData.notes || ''
          }))

          toast.success(`Patient data loaded from appointment: ${appointmentData.patientName}`)
        } else {
          toast.error('Prescription or appointment not found')
          navigate('/doctor/prescriptions')
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error loading data')
      navigate('/doctor/prescriptions')
    } finally {
      setInitialLoading(false)
    }
  }, [id, navigate])

  // Check if we're in edit mode and fetch data
  useEffect(() => {
    if (id) {
      // Check if this is a prescription ID (edit mode) or appointment ID (new prescription)
      fetchPrescriptionData()
    }
  }, [id, fetchPrescriptionData])

  // Fetch patients and medicines
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients from appointments
        const appointmentsRef = collection(db, 'appointments')
        const appointmentsQuery = query(appointmentsRef, orderBy('createdAt', 'desc'))
        const appointmentsSnapshot = await getDocs(appointmentsQuery)
        
        const uniquePatients = []
        const patientMap = new Map()
        
        appointmentsSnapshot.docs.forEach(doc => {
          const appointment = doc.data()
          const patientKey = `${appointment.patientName}-${appointment.patientPhone}`
          
          if (!patientMap.has(patientKey)) {
            patientMap.set(patientKey, {
              id: patientKey,
              name: appointment.patientName,
              age: appointment.patientAge,
              gender: appointment.patientGender,
              phone: appointment.patientPhone,
              email: appointment.patientEmail,
              lastVisit: appointment.appointmentDate
            })
            uniquePatients.push(patientMap.get(patientKey))
          }
        })
        
        setPatients(uniquePatients)
        setFilteredPatients(uniquePatients)

        // Fetch medicines
        const medicinesRef = collection(db, 'medicines')
        const medicinesQuery = query(medicinesRef, orderBy('name', 'asc'))
        
        const unsubscribe = onSnapshot(medicinesQuery, (snapshot) => {
          const medicinesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setMedicines(medicinesData)
          setFilteredMedicines(medicinesData)
        })

        return () => unsubscribe()
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Error loading data')
      }
    }

    fetchData()
  }, [])

  // Filter medicines based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMedicines(filtered)
    } else {
      setFilteredMedicines(medicines)
    }
  }, [searchTerm, medicines])

  // Filter patients based on search
  useEffect(() => {
    if (patientSearchTerm) {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        patient.phone.includes(patientSearchTerm) ||
        patient.email.toLowerCase().includes(patientSearchTerm.toLowerCase())
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [patientSearchTerm, patients])

  // Handle click outside medicine dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (medicineDropdownRef.current && !medicineDropdownRef.current.contains(event.target)) {
        setShowMedicineDropdown(false)
        setSearchTerm('')
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowMedicineDropdown(false)
        setShowPatientModal(false)
        setSearchTerm('')
        setPatientSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handlePatientSelect = (patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      patientPhone: patient.phone,
      patientEmail: patient.email
    }))
    setManualPatient(false)
    setShowPatientModal(false)
    setPatientSearchTerm('')
    toast.success(`Selected patient: ${patient.name}`)
  }

  const handleAddMedicine = (medicine) => {
    const existingMedicine = formData.medicines.find(m => m.id === medicine.id)
    
    if (existingMedicine) {
      toast.error('Medicine already added')
      return
    }

    const newMedicine = {
      id: medicine.id,
      name: medicine.name,
      category: medicine.category,
      dosage: '',
      frequency: '',
      duration: '',
      timing: 'after_meal',
      specialInstructions: ''
    }

    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine]
    }))
    
    setShowMedicineDropdown(false)
    setSearchTerm('')
    toast.success(`Added ${medicine.name}`)
  }

  const handleRemoveMedicine = (medicineId) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter(m => m.id !== medicineId)
    }))
    toast.success('Medicine removed')
  }

  const handleMedicineChange = (medicineId, field, value) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.map(medicine =>
        medicine.id === medicineId
          ? { ...medicine, [field]: value }
          : medicine
      )
    }))
  }

  const validateForm = () => {
    if (!formData.patientName.trim()) {
      toast.error('Please select a patient')
      return false
    }
    if (!formData.diagnosis.trim()) {
      toast.error('Por favor, insira o diagnóstico')
      return false
    }
    if (formData.medicines.length === 0) {
      toast.error('Por favor, adicione pelo menos um medicamento')
      return false
    }
    
    // Validate medicine details
    for (const medicine of formData.medicines) {
      if (!medicine.dosage.trim()) {
        toast.error(`Por favor, insira a dosagem para ${medicine.name}`)
        return false
      }
      if (!medicine.frequency.trim()) {
        toast.error(`Por favor, insira a frequência para ${medicine.name}`)
        return false
      }
      if (!medicine.duration.trim()) {
        toast.error(`Por favor, insira a duração para ${medicine.name}`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const baseData = {
        ...formData,
        doctorName: currentUser?.displayName || 'Dentista desconhecido',
        updatedAt: new Date().toISOString()
      }
      // Only include doctorId when available to avoid Firestore undefined error
      const prescriptionData = currentUser?.uid
        ? { ...baseData, doctorId: currentUser.uid }
        : baseData

      if (isEditMode) {
        // Update existing prescription
        const prescriptionRef = doc(db, 'prescriptions', id)
        await updateDoc(prescriptionRef, prescriptionData)
        toast.success('Prescrição atualizada com sucesso!')
      } else {
        // Create new prescription
        const toCreate = { ...prescriptionData, createdAt: new Date().toISOString() }
        await addDoc(collection(db, 'prescriptions'), toCreate)
        toast.success('Prescrição criada com sucesso!')
      }
      
      navigate('/doctor/prescriptions')
    } catch (error) {
      console.error('Error saving prescription:', error)
      toast.error(`Erro ao salvar prescrição: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="min-h-screen p-8 bg-hero-dark">
      {/* Header */}
      <header className="card-surface border-b p-4 mb-6" style={{ borderColor: 'var(--color-border)', borderRadius: '1.5rem' }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link 
              to="/doctor/prescriptions"
              className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--color-secondary)', 
                color: 'var(--color-primary)' 
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar às Prescrições</span>
            </Link>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
              <FileText className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                {isEditMode ? 'Editar Prescrição' : 'Criar Prescrição'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                {isEditMode ? 'Atualizar detalhes da prescrição' : id ? 'Criar prescrição do atendimento' : 'Escrever nova prescrição para o paciente'}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {initialLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" style={{ borderTop: '2px solid var(--color-primary)', borderRight: '2px solid transparent' }}></div>
              <p style={{ color: 'var(--color-text-light)' }}>Carregando dados da prescrição...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Selection */}
            <div className="card-surface rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--color-text)' }}>
                <User className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <span>Informações do Paciente</span>
              </h2>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                    {manualPatient ? 'Nome do Paciente' : 'Selecionar Paciente'}
                  </label>
                  {manualPatient ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Digite o nome do paciente..."
                        value={formData.patientName}
                        onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none"
                        style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      />
                      <button
                        type="button"
                        onClick={() => { setManualPatient(false); setShowPatientModal(true) }}
                        className="px-3 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' }}
                      >
                        Selecionar da agenda
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Clique para selecionar um paciente..."
                        value={formData.patientName}
                        readOnly
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none cursor-pointer"
                        style={{ 
                          backgroundColor: 'var(--color-bg)', 
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)'
                        }}
                        onClick={() => setShowPatientModal(true)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPatientModal(true)}
                        className="btn-primary rounded-lg flex items-center space-x-2"
                      >
                        <Search className="w-4 h-4" />
                        <span>Selecionar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setManualPatient(true); setFormData(prev => ({ ...prev, patientId: '' })) }}
                        className="px-3 py-2 rounded-lg font-medium"
                        style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' }}
                      >
                        Digitar manualmente
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Data da Prescrição</label>
                  <input
                    type="date"
                    value={formData.prescriptionDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, prescriptionDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Idade do Paciente</label>
                  <input
                    type="text"
                    value={formData.patientAge}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientAge: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="Idade"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Gênero do Paciente</label>
                  <select
                    value={formData.patientGender}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientGender: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  >
                    <option value="">Selecionar Gênero</option>
                    <option value="Male">Masculino</option>
                    <option value="Female">Feminino</option>
                    <option value="Other">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Telefone</label>
                  <input
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="Número de telefone"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Email</label>
                  <input
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    placeholder="Endereço de email"
                  />
                </div>
              </div>
            </div>

            {/* Diagnosis and Symptoms */}
            <div className="card-surface rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--color-text)' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <span>Diagnóstico e Sintomas</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Diagnóstico</label>
                  <textarea
                    value={formData.diagnosis}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    rows="3"
                    placeholder="Inserir diagnóstico..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Sintomas</label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    rows="3"
                    placeholder="Inserir sintomas..."
                  />
                </div>
              </div>
            </div>

            {/* Medicines */}
            <div className="card-surface rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center space-x-2" style={{ color: 'var(--color-text)' }}>
                  <Pill className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  <span>Medicamentos ({formData.medicines.length})</span>
                </h2>
                
                <button
                  type="button"
                  onClick={() => setShowMedicineDropdown(!showMedicineDropdown)}
                  className="btn-primary rounded-lg flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Medicamento</span>
                </button>
              </div>
              
              {/* Medicine Search Dropdown */}
              {showMedicineDropdown && (
                <div className="mb-4" ref={medicineDropdownRef}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar medicamentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                      style={{ 
                        backgroundColor: 'var(--color-bg)', 
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                      autoFocus
                    />
                  </div>
                  
                  <div className="mt-2 max-h-60 overflow-y-auto card-surface border rounded-lg shadow-xl" style={{ borderColor: 'var(--color-border)' }}>
                    {filteredMedicines.length > 0 ? (
                      filteredMedicines.map((medicine) => (
                        <button
                          key={medicine.id}
                          type="button"
                          onClick={() => handleAddMedicine(medicine)}
                          className="w-full px-4 py-3 text-left border-b last:border-b-0 transition-colors"
                          style={{ 
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div className="font-medium">{medicine.name}</div>
                          <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                            {medicine.category} • {medicine.strength} • {medicine.form}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center" style={{ color: 'var(--color-text-light)' }}>
                        {searchTerm ? 'Nenhum medicamento encontrado.' : 'Nenhum medicamento disponível. Adicione medicamentos primeiro.'}
                      </div>
                    )}
                </div>
              </div>
            )}
            
              {/* Added Medicines */}
              <div className="space-y-4">
                {formData.medicines.map((medicine) => (
                  <div key={medicine.id} className="border rounded-lg p-4" style={{ 
                    backgroundColor: 'var(--color-bg)', 
                    borderColor: 'var(--color-border)' 
                  }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium" style={{ color: 'var(--color-text)' }}>{medicine.name}</h3>
                        <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>{medicine.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(medicine.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Dosagem</label>
                        <input
                          type="text"
                          value={medicine.dosage}
                          onChange={(e) => handleMedicineChange(medicine.id, 'dosage', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none text-sm"
                          style={{ 
                            backgroundColor: 'var(--color-card)', 
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)'
                          }}
                          placeholder="ex: 500mg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Frequência</label>
                        <input
                          type="text"
                          value={medicine.frequency}
                          onChange={(e) => handleMedicineChange(medicine.id, 'frequency', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none text-sm"
                          style={{ 
                            backgroundColor: 'var(--color-card)', 
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)'
                          }}
                          placeholder="ex: 2x ao dia"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Duração</label>
                        <input
                          type="text"
                          value={medicine.duration}
                          onChange={(e) => handleMedicineChange(medicine.id, 'duration', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none text-sm"
                          style={{ 
                            backgroundColor: 'var(--color-card)', 
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)'
                          }}
                          placeholder="ex: 7 dias"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Horário</label>
                        <select
                          value={medicine.timing}
                          onChange={(e) => handleMedicineChange(medicine.id, 'timing', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none text-sm"
                          style={{ 
                            backgroundColor: 'var(--color-card)', 
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text)'
                          }}
                        >
                          <option value="after_meal">Após Refeição</option>
                          <option value="before_meal">Antes da Refeição</option>
                          <option value="empty_stomach">Estômago Vazio</option>
                          <option value="bedtime">Antes de Dormir</option>
                          <option value="as_needed">Conforme Necessário</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>Instruções Especiais</label>
                      <input
                        type="text"
                        value={medicine.specialInstructions}
                        onChange={(e) => handleMedicineChange(medicine.id, 'specialInstructions', e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none text-sm"
                        style={{ 
                          backgroundColor: 'var(--color-card)', 
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text)'
                        }}
                        placeholder="Quaisquer instruções especiais..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions and Follow-up */}
            <div className="card-surface rounded-2xl p-6 border" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: 'var(--color-text)' }}>
                <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <span>Instruções e Acompanhamento</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Instruções Gerais</label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    rows="3"
                    placeholder="Instruções gerais para o paciente..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Data de Retorno</label>
                    <input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                      style={{ 
                        backgroundColor: 'var(--color-bg)', 
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                      style={{ 
                        backgroundColor: 'var(--color-bg)', 
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)'
                      }}
                    >
                      <option value="active">Ativo</option>
                      <option value="completed">Concluído</option>
                      <option value="discontinued">Descontinuado</option>
                      <option value="pending">Pendente</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Observações Adicionais</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-bg)', 
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                    rows="3"
                    placeholder="Quaisquer observações adicionais..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                to="/doctor/prescriptions"
                className="px-6 py-3 border rounded-lg transition-colors"
                style={{ 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4" style={{ borderTop: '2px solid white', borderRight: '2px solid transparent' }}></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{loading ? (isEditMode ? 'Atualizando...' : 'Criando...') : (isEditMode ? 'Atualizar Prescrição' : 'Criar Prescrição')}</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Patient Selection Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="card-surface border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Selecionar Paciente</h2>
              <button
                onClick={() => {
                  setShowPatientModal(false)
                  setPatientSearchTerm('')
                }}
                className="transition-colors"
                style={{ color: 'var(--color-text-light)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-light)'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <input
                type="text"
                placeholder="Buscar pacientes por nome, telefone ou email..."
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--color-bg)', 
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)'
                }}
                autoFocus
              />
            </div>

            {/* Patient List */}
            <div className="flex-1 overflow-y-auto max-h-96">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className="w-full p-4 text-left border-b last:border-b-0 transition-colors"
                    style={{ borderColor: 'var(--color-border)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-lg" style={{ color: 'var(--color-text)' }}>{patient.name}</div>
                        <div className="mt-1" style={{ color: 'var(--color-text-light)' }}>
                          {patient.age} anos, {patient.gender} • {patient.phone}
                        </div>
                        {patient.email && (
                          <div className="text-sm mt-1" style={{ color: 'var(--color-text-light)' }}>{patient.email}</div>
                        )}
                        <div className="text-sm mt-1" style={{ color: 'var(--color-text-light)' }}>
                          Última visita: {patient.lastVisit}
                        </div>
                      </div>
                      <div style={{ color: 'var(--color-primary)' }}>
                        <User className="w-5 h-5" />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="text-lg mb-2" style={{ color: 'var(--color-text-light)' }}>
                    {patientSearchTerm ? 'Nenhum paciente encontrado.' : 'Nenhum paciente disponível.'}
                  </div>
                   <div className="text-slate-500 text-sm">
                     {patientSearchTerm ? 'Try a different search term.' : 'Create appointments first to see patients here.'}
                   </div>
                 </div>
               )}
             </div>

             {/* Modal Footer */}
             <div className="p-6 border-t border-white/10 flex justify-end">
               <button
                 onClick={() => {
                   setShowPatientModal(false)
                   setPatientSearchTerm('')
                 }}
                 className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
               >
                 Cancel
               </button>
               <button
                 onClick={() => {
                   setManualPatient(true)
                   setFormData(prev => ({ ...prev, patientId: '', patientName: patientSearchTerm || prev.patientName }))
                   setShowPatientModal(false)
                 }}
                 className="ml-3 px-6 py-2 rounded-lg transition-colors"
                 style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' }}
               >
                 Digitar manualmente
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   )
 }
