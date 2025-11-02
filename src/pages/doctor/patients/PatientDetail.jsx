import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft, FaCheck, FaClock, FaFileContract, FaPlus, FaPrint, FaTooth, FaUser } from 'react-icons/fa'
import { collection, doc, getDoc, onSnapshot, addDoc, updateDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { useAuth } from '../../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const isUserReady = !!(currentUser && currentUser.uid)

  const [patient, setPatient] = useState(null)
  const [activeTab, setActiveTab] = useState('sobre')

  // Budgets state
  const [budgets, setBudgets] = useState([])
  const [budgetForm, setBudgetForm] = useState({
    description: '',
    plan: 'Particular',
    responsible: '',
    date: new Date().toISOString().slice(0,10),
    items: [], // { procedure, value, teeth: [numbers], dentition: 'permanentes'|'deciduos' }
    procedure: '',
    value: '',
    dentition: 'permanentes',
    selectedTeeth: [],
    installments: 1,
    dueDay: 5,
  })

  // Anamnesis state
  const [anamneses, setAnamneses] = useState([])
  const [anamneseForm, setAnamneseForm] = useState({
    model: 'Anamnese adulta resumida',
    date: new Date().toISOString().slice(0,10),
    answers: {
      tratamentoMedico: '',
      tratamentoMedicoQuais: '',
      usaMedicamentos: '',
      usaMedicamentosQuais: '',
      cirurgiaInternacao: '',
      cirurgiaInternacaoQuais: '',
      alergia: '',
      alergiaQuais: '',
      doencasCronicas: '',
      doencasCronicasQuais: '',
      cardiacoRespiratorio: '',
      hemorragia: '',
      infecciosa: '',
      gravidaAmamentando: '',
      condicaoAlergica: '',
      fuma: '',
      alcool: '',
      roeUnhas: '',
      bruxismo: '',
      docesAcidos: '',
      ultimaConsulta: '',
      canalExtracao: '',
      gengivaSangra: '',
      mauHalito: '',
      aparelhoProteseImplante: '',
      disfuncaoMandibula: '',
      satisfacaoSorriso: '',
      observacoes: ''
    }
  })

  // Load patient
  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, 'patients', id)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          toast.error('Paciente não encontrado')
          navigate('/doctor/patients')
          return
        }
        setPatient({ id: snap.id, ...snap.data() })
      } catch (e) {
        console.error(e)
        toast.error('Erro ao carregar paciente')
      }
    })()
  }, [id, navigate])

  // Realtime budgets for this patient
  useEffect(() => {
    if (!id) return
    const q = query(collection(db, 'budgets'), where('patientId', '==', id), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setBudgets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [id])

  // Realtime anamneses
  useEffect(() => {
    if (!id) return
    const q = query(collection(db, 'anamneses'), where('patientId', '==', id), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setAnamneses(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [id])

  // Realtime attendances for overview (by patientName fallback)
  const [attendances, setAttendances] = useState([])
  useEffect(() => {
    if (!patient?.name) return
    const q = query(collection(db, 'attendances'), where('patientName', '==', patient.name), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => setAttendances(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
    return () => unsub()
  }, [patient?.name])

  const totalBudget = useMemo(() => {
    const sum = budgetForm.items.reduce((acc, it) => acc + (parseFloat(it.value) || 0), 0)
    return sum
  }, [budgetForm.items])

  const teethPermanent = useMemo(() => ([
    // Upper right to upper left: 18..11
    [18,17,16,15,14,13,12,11],
    // Upper left to upper right: 21..28
    [21,22,23,24,25,26,27,28],
    // Lower right to lower left: 48..41
    [48,47,46,45,44,43,42,41],
    // Lower left to lower right: 31..38
    [31,32,33,34,35,36,37,38]
  ]), [])

  const teethDeciduous = useMemo(() => ([
    // Upper right to upper left: 55..51
    [55,54,53,52,51],
    // Upper left to upper right: 61..65
    [61,62,63,64,65],
    // Lower right to lower left: 85..81
    [85,84,83,82,81],
    // Lower left to lower right: 71..75
    [71,72,73,74,75]
  ]), [])

  const toggleTooth = (n) => {
    setBudgetForm((prev) => {
      const exists = prev.selectedTeeth.includes(n)
      const selectedTeeth = exists ? prev.selectedTeeth.filter(t => t !== n) : [...prev.selectedTeeth, n]
      return { ...prev, selectedTeeth }
    })
  }

  const addTreatmentItem = () => {
    if (!budgetForm.procedure || !budgetForm.value) {
      toast.error('Informe o tratamento e o valor')
      return
    }
    const item = {
      procedure: budgetForm.procedure,
      value: parseFloat(budgetForm.value),
      teeth: budgetForm.selectedTeeth.slice().sort((a,b)=>a-b),
      dentition: budgetForm.dentition
    }
    setBudgetForm((prev) => ({
      ...prev,
      items: [...prev.items, item],
      procedure: '',
      value: '',
      selectedTeeth: []
    }))
  }

  const saveBudget = async () => {
    try {
      if (!isUserReady) {
        toast.error('Sessão do usuário ainda não carregou. Tente novamente em alguns segundos.')
        return
      }
      if (!budgetForm.description || budgetForm.items.length === 0) {
        toast.error('Descrição e pelo menos um tratamento são obrigatórios')
        return
      }
      const payload = {
        patientId: id,
        patientName: patient?.name || '',
        description: budgetForm.description,
        plan: budgetForm.plan,
        responsible: budgetForm.responsible || currentUser?.displayName || currentUser?.email || 'Desconhecido',
        date: budgetForm.date,
        items: budgetForm.items,
        installments: parseInt(budgetForm.installments) || 1,
        dueDay: parseInt(budgetForm.dueDay) || 5,
        status: 'em_orcamento',
        total: budgetForm.items.reduce((acc, it) => acc + (parseFloat(it.value)||0), 0),
        createdAt: serverTimestamp(),
      }
      if (currentUser?.uid) payload.createdBy = currentUser.uid
      await addDoc(collection(db, 'budgets'), payload)
      toast.success('Orçamento salvo!')
      setBudgetForm({
        description: '', plan: 'Particular', responsible: '', date: new Date().toISOString().slice(0,10),
        items: [], procedure: '', value: '', dentition: 'permanentes', selectedTeeth: [], installments: 1, dueDay: 5
      })
    } catch (e) {
      console.error(e)
      toast.error('Erro ao salvar orçamento')
    }
  }

  const approveBudget = async (b) => {
    try {
      await updateDoc(doc(db, 'budgets', b.id), { status: 'aprovado', approvedAt: serverTimestamp() })
      toast.success('Orçamento aprovado')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao aprovar orçamento')
    }
  }

  const openContractWindow = (b) => {
    const win = window.open('', '_blank')
    if (!win) return
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Contrato</title>
      <style>body{font-family:Arial;padding:24px;} h1{font-size:20px} table{width:100%;border-collapse:collapse;margin-top:16px} td,th{border:1px solid #ccc;padding:8px;text-align:left}</style>
    </head><body>
      <h1>Contrato de Tratamento Odontológico</h1>
      <p><strong>Paciente:</strong> ${b.patientName}</p>
      <p><strong>Descrição:</strong> ${b.description}</p>
      <p><strong>Plano:</strong> ${b.plan} | <strong>Responsável:</strong> ${b.responsible}</p>
      <table><thead><tr><th>Procedimento</th><th>Dentes/Região</th><th>Valor</th></tr></thead><tbody>
        ${b.items.map(it => `<tr><td>${it.procedure}</td><td>${(it.teeth||[]).join(', ')}</td><td>R$ ${(it.value||0).toFixed(2)}</td></tr>`).join('')}
      </tbody></table>
      <h3>Total: R$ ${(b.total||0).toFixed(2)}</h3>
      <p>Parcelas: ${b.installments} | Vencimento: dia ${b.dueDay}</p>
      <p>Ao assinar, o paciente concorda com os procedimentos e valores descritos acima.</p>
      <p style="margin-top:80px">Assinatura do paciente: ________________________________</p>
      <script>window.print()</script>
    </body></html>`
    win.document.write(html)
    win.document.close()
  }

  const saveAnamnese = async () => {
    try {
      if (!isUserReady) {
        toast.error('Sessão do usuário ainda não carregou. Tente novamente em alguns segundos.')
        return
      }
      const payload = {
        patientId: id,
        patientName: patient?.name || '',
        model: anamneseForm.model,
        date: anamneseForm.date,
        answers: anamneseForm.answers,
        createdAt: serverTimestamp(),
      }
      if (currentUser?.uid) payload.createdBy = currentUser.uid
      await addDoc(collection(db, 'anamneses'), payload)
      toast.success('Anamnese salva')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao salvar anamnese')
    }
  }

  if (!patient) {
    return (
      <div className="min-h-screen p-8 bg-hero-dark">
        <div className="card-surface p-6">Carregando paciente...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-hero-dark">
      {/* Header */}
      <header className="p-6 card-surface mb-6" style={{ borderRadius: '1.5rem' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/doctor/patients"
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-light)' }}
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar</span>
            </Link>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
              <FaUser className="text-2xl" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{patient.name}</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                {patient.phone} • Nº paciente: {patient.id?.slice(0,6)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-6 border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
          {[
            { key: 'sobre', label: 'SOBRE' },
            { key: 'orcamentos', label: 'ORÇAMENTOS' },
            { key: 'anamnese', label: 'ANAMNESE' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="px-3 pb-2 font-medium"
              style={{
                color: activeTab === t.key ? 'var(--color-text)' : 'var(--color-text-light)',
                borderBottom: activeTab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      {activeTab === 'sobre' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card-surface p-6">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Dados pessoais</h3>
            <div className="space-y-3 text-sm" style={{ color: 'var(--color-text-light)' }}>
              <div className="flex justify-between"><span>Número paciente</span><span>{patient.id?.slice(0,6)}</span></div>
              <div className="flex justify-between"><span>Celular</span><span>{patient.phone || '-'}</span></div>
              <div className="flex justify-between"><span>E-mail</span><span>{patient.email || '-'}</span></div>
              <div className="flex justify-between"><span>CPF</span><span>{patient.cpf || '-'}</span></div>
            </div>
          </div>

          <div className="card-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Consultas</h3>
              <Link to="/doctor/appointments" className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>Ver na agenda</Link>
            </div>
            <div className="space-y-3">
              {attendances.length === 0 && (
                <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>Nenhuma consulta</div>
              )}
              {attendances.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{a.date} às {a.time}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-light)' }}>{a.type}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: a.status === 'cancelado' ? '#dc2626' : a.status === 'concluido' ? '#10b981' : 'var(--color-text-light)' }}>
                    {a.status === 'concluido' ? <FaCheck/> : <FaClock/>}
                    {a.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orcamentos' && (
        <div className="space-y-4">
          {/* New budget */}
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaTooth style={{ color: 'var(--color-primary)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Novo Orçamento</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>Descrição *</label>
                <input
                  type="text"
                  value={budgetForm.description}
                  onChange={(e)=>setBudgetForm(v=>({...v, description:e.target.value}))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>Plano *</label>
                <select
                  value={budgetForm.plan}
                  onChange={(e)=>setBudgetForm(v=>({...v, plan:e.target.value}))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }}
                >
                  <option>Particular</option>
                  <option>Convênio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>Responsável</label>
                <input
                  type="text"
                  value={budgetForm.responsible}
                  onChange={(e)=>setBudgetForm(v=>({...v, responsible:e.target.value}))}
                  placeholder={currentUser?.displayName || currentUser?.email || ''}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>Data</label>
                <input
                  type="date"
                  value={budgetForm.date}
                  onChange={(e)=>setBudgetForm(v=>({...v, date:e.target.value}))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }}
                />
              </div>
            </div>

            {/* Add treatment */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>Tratamento *</label>
                <input
                  type="text"
                  value={budgetForm.procedure}
                  onChange={(e)=>setBudgetForm(v=>({...v, procedure:e.target.value}))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>Valor *</label>
                <input
                  type="number"
                  value={budgetForm.value}
                  onChange={(e)=>setBudgetForm(v=>({...v, value:e.target.value}))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>Dentição</label>
                <select
                  value={budgetForm.dentition}
                  onChange={(e)=>setBudgetForm(v=>({...v, dentition:e.target.value, selectedTeeth:[]}))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }}
                >
                  <option value="permanentes">Permanentes</option>
                  <option value="deciduos">Decíduos</option>
                </select>
              </div>
            </div>

            {/* Odontogram */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <FaTooth style={{ color: 'var(--color-text-light)' }} />
                <span className="text-sm" style={{ color: 'var(--color-text-light)' }}>Selecione os dentes/regiões:</span>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-bg)', border:'1px dashed var(--color-border)' }}>
                {(budgetForm.dentition === 'permanentes' ? teethPermanent : teethDeciduous).map((row, idx) => (
                  <div key={idx} className="flex justify-center gap-2 mb-3">
                    {row.map((n) => {
                      const selected = budgetForm.selectedTeeth.includes(n)
                      return (
                        <button
                          key={n}
                          onClick={() => toggleTooth(n)}
                          type="button"
                          className="w-8 h-8 rounded text-xs font-medium"
                          style={{
                            backgroundColor: selected ? 'var(--color-primary)' : 'transparent',
                            color: selected ? '#0b111b' : 'var(--color-text-light)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          {n}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 text-sm" style={{ color: 'var(--color-text-light)' }}>
                <div>Dentes selecionados: {budgetForm.selectedTeeth.sort((a,b)=>a-b).join(', ') || '—'}</div>
                <button type="button" onClick={addTreatmentItem} className="btn-primary flex items-center gap-2">
                  <FaPlus className="w-4 h-4" />
                  Adicionar tratamento
                </button>
              </div>
            </div>

            {/* Items list */}
            {budgetForm.items.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr style={{ color: 'var(--color-text-light)' }}>
                      <th className="text-left py-2">Procedimento</th>
                      <th className="text-left py-2">Dentes</th>
                      <th className="text-left py-2">Valor</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: 'var(--color-text)' }}>
                    {budgetForm.items.map((it, i) => (
                      <tr key={i}>
                        <td className="py-2">{it.procedure}</td>
                        <td className="py-2">{(it.teeth||[]).join(', ')}</td>
                        <td className="py-2">R$ {(it.value||0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payment options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>Parcelas</label>
                <input type="number" min={1} value={budgetForm.installments}
                  onChange={(e)=>setBudgetForm(v=>({...v, installments:e.target.value}))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>Dia do vencimento</label>
                <input type="number" min={1} max={28} value={budgetForm.dueDay}
                  onChange={(e)=>setBudgetForm(v=>({...v, dueDay:e.target.value}))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }} />
              </div>
              <div className="flex items-end">
                <div className="text-right w-full">
                  <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>Total</div>
                  <div className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>R$ {totalBudget.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button onClick={saveBudget} disabled={!isUserReady} className="btn-primary flex items-center gap-2" style={!isUserReady?{opacity:.6,cursor:'not-allowed'}:{}}>
                <FaCheck className="w-4 h-4" /> Salvar Orçamento
              </button>
              {!isUserReady && <span className="text-sm" style={{ color:'var(--color-text-light)' }}>Carregando sessão...</span>}
            </div>
          </div>

          {/* Budgets list */}
          <div className="card-surface p-6">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Orçamentos do paciente</h3>
            <div className="space-y-3">
              {budgets.length === 0 && (
                <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>Nenhum orçamento cadastrado</div>
              )}
              {budgets.map((b) => (
                <div key={b.id} className="p-4 rounded border" style={{ borderColor:'var(--color-border)' }}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium" style={{ color:'var(--color-text)' }}>{b.description}</div>
                      <div className="text-sm" style={{ color:'var(--color-text-light)' }}>{b.plan} • R$ {(b.total||0).toFixed(2)} • {b.items?.length||0} procedimentos</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor:'var(--color-bg)', color: b.status==='aprovado'?'#10b981':'var(--color-text-light)' }}>{b.status==='aprovado' ? 'Aprovado' : 'Em orçamento'}</span>
                      {b.status !== 'aprovado' && (
                        <button onClick={()=>approveBudget(b)} className="btn-primary">Aprovar</button>
                      )}
                      <button onClick={()=>openContractWindow(b)} className="px-3 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--color-secondary)', color:'var(--color-text)' }}>
                        <FaFileContract /> Emitir contrato
                      </button>
                      <button onClick={()=>openContractWindow(b)} className="px-3 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--color-bg)', color:'var(--color-text)' }}>
                        <FaPrint /> Configurar impressão
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'anamnese' && (
        <div className="space-y-4">
          <div className="card-surface p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>Modelo de anamnese</label>
                <select
                  value={anamneseForm.model}
                  onChange={(e)=>setAnamneseForm(v=>({...v, model:e.target.value}))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }}
                >
                  <option>Anamnese adulta</option>
                  <option>Anamnese adulta resumida</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>Data</label>
                <input type="date" value={anamneseForm.date} onChange={(e)=>setAnamneseForm(v=>({...v, date:e.target.value}))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }} />
              </div>
            </div>

            {/* Questions (resumida) */}
            <div className="mt-6 space-y-4">
              {[
                { key:'tratamentoMedico', label:'Está em tratamento médico atualmente?' },
                { key:'usaMedicamentos', label:'Usa algum medicamento regularmente?' },
                { key:'cirurgiaInternacao', label:'Já foi hospitalizado ou passou por cirurgia?' },
                { key:'alergia', label:'Tem alergia a medicamentos, alimentos ou produtos odontológicos?' },
                { key:'doencasCronicas', label:'É portador de alguma doença crônica (diabetes, hipertensão, etc.)?' },
                { key:'cardiacoRespiratorio', label:'Já teve problemas cardíacos ou respiratórios?' },
                { key:'hemorragia', label:'Possui problemas hemorrágicos (sangramento fácil, hemofilia)?' },
                { key:'infecciosa', label:'Já teve hepatite, HIV, tuberculose ou outra doença infecciosa?' },
                { key:'gravidaAmamentando', label:'Está grávida ou amamentando?' },
                { key:'condicaoAlergica', label:'Possui alguma condição alérgica (rinite, dermatite)?' },
                { key:'fuma', label:'Fuma?' },
                { key:'alcool', label:'Consome bebidas alcoólicas com frequência?' },
                { key:'roeUnhas', label:'Costuma roer unhas ou morder objetos?' },
                { key:'bruxismo', label:'Range ou aperta os dentes (bruxismo)?' },
                { key:'docesAcidos', label:'Alimenta-se com frequência de doces, refrigerantes ou alimentos ácidos?' },
                { key:'ultimaConsulta', label:'Quando foi sua última consulta odontológica?' },
                { key:'canalExtracao', label:'Já fez tratamento de canal ou extração dentária?' },
                { key:'gengivaSangra', label:'Sente dor, sensibilidade ou sangramento nas gengivas?' },
                { key:'mauHalito', label:'Tem mau hálito com frequência?' },
                { key:'aparelhoProteseImplante', label:'Usa aparelho ortodôntico, prótese ou implante?' },
                { key:'disfuncaoMandibula', label:'Dificuldade para abrir a boca, mastigar ou estalos na mandíbula?' },
                { key:'satisfacaoSorriso', label:'Está satisfeito(a) com a aparência dos dentes e sorriso?' },
              ].map((q) => (
                <div key={q.key} className="p-4 rounded" style={{ backgroundColor:'var(--color-bg)' }}>
                  <div className="mb-2" style={{ color: 'var(--color-text)' }}>{q.label}</div>
                  <div className="flex gap-4 text-sm" style={{ color:'var(--color-text-light)' }}>
                    {['Sim','Não','Não sei'].map(opt => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={q.key}
                          checked={anamneseForm.answers[q.key] === opt}
                          onChange={() => setAnamneseForm(v=>({ ...v, answers:{ ...v.answers, [q.key]: opt } }))}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {/* Details field when yes */}
                  {['tratamentoMedico','usaMedicamentos','cirurgiaInternacao','alergia','doencasCronicas'].includes(q.key) && (
                    <input
                      type="text"
                      placeholder="Se sim, especifique..."
                      value={anamneseForm.answers[q.key+"Quais"] || ''}
                      onChange={(e)=>setAnamneseForm(v=>({ ...v, answers:{ ...v.answers, [q.key+"Quais"]: e.target.value } }))}
                      className="mt-2 w-full px-4 py-2 rounded-lg outline-none"
                      style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }}
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--color-text)' }}>Observações adicionais</label>
                <textarea rows="3" value={anamneseForm.answers.observacoes}
                  onChange={(e)=>setAnamneseForm(v=>({...v, answers:{...v.answers, observacoes:e.target.value}}))}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ backgroundColor:'var(--color-bg)', border:'1px solid var(--color-border)', color:'var(--color-text)' }} />
              </div>

              <div className="flex items-center gap-3">
                <button onClick={saveAnamnese} disabled={!isUserReady} className="btn-primary" style={!isUserReady?{opacity:.6,cursor:'not-allowed'}:{}}>Salvar anamnese</button>
                {!isUserReady && <span className="text-sm" style={{ color:'var(--color-text-light)' }}>Carregando sessão...</span>}
              </div>
            </div>
          </div>

          {/* Previous anamneses */}
          <div className="card-surface p-6">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Anamneses salvas</h3>
            <div className="space-y-3">
              {anamneses.length === 0 && (
                <div className="text-sm" style={{ color: 'var(--color-text-light)' }}>Nenhum registro</div>
              )}
              {anamneses.map(a => (
                <div key={a.id} className="p-3 rounded border" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm" style={{ color:'var(--color-text)' }}>{a.model} • {a.date}</div>
                    <button onClick={()=>{
                      const w = window.open('', '_blank')
                      if (!w) return
                      w.document.write(`<pre>${JSON.stringify(a, null, 2)}</pre>`)
                      w.document.close()
                    }} className="px-3 py-2 rounded-lg" style={{ backgroundColor:'var(--color-bg)', color:'var(--color-text)' }}>
                      Imprimir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
