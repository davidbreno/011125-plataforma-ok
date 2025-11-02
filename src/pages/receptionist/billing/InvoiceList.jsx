import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '../../../firebase/config'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Edit, 
  Trash2,
  DollarSign,
  FileText,
  Calendar,
  User,
  Phone,
  CreditCard,
  Banknote, 
  Globe,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const invoicesRef = collection(db, 'invoices')
        const q = query(invoicesRef, orderBy('createdAt', 'desc'))
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const invoicesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setInvoices(invoicesData)
          setFilteredInvoices(invoicesData)
          setLoading(false)
        })
        
        return unsubscribe
      } catch (error) {
        console.error('Error fetching invoices:', error)
        setLoading(false)
      }
    }
    
    fetchInvoices()
  }, [])

  // Filter and search invoices
  useEffect(() => {
    let filtered = [...invoices]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(invoice =>
        invoice.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.patientPhone?.includes(searchQuery) ||
        invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      
      switch (dateFilter) {
        case 'today': {
          filtered = filtered.filter(invoice => {
            const invoiceDate = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt)
            return invoiceDate >= startOfDay
          })
          break
        }
        case 'week': {
          const weekAgo = new Date(startOfDay.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(invoice => {
            const invoiceDate = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt)
            return invoiceDate >= weekAgo
          })
          break
        }
        case 'month': {
          const monthAgo = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(invoice => {
            const invoiceDate = invoice.createdAt?.toDate?.() || new Date(invoice.createdAt)
            return invoiceDate >= monthAgo
          })
          break
        }
      }
    }

    // Sort invoices
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'date':
          aValue = a.createdAt?.toDate?.() || new Date(a.createdAt)
          bValue = b.createdAt?.toDate?.() || new Date(b.createdAt)
          break
        case 'amount':
          aValue = a.totalAmount || 0
          bValue = b.totalAmount || 0
          break
        case 'name':
          aValue = a.patientName || ''
          bValue = b.patientName || ''
          break
        default:
          aValue = a.createdAt?.toDate?.() || new Date(a.createdAt)
          bValue = b.createdAt?.toDate?.() || new Date(b.createdAt)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredInvoices(filtered)
  }, [invoices, searchQuery, statusFilter, dateFilter, sortBy, sortOrder])

  // Get status icon and color
  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20' }
      case 'pending':
        return { icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' }
      case 'overdue':
        return { icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-500/20' }
      default:
        return { icon: Clock, color: 'text-slate-400', bgColor: 'bg-slate-500/20' }
    }
  }

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
             case 'cash':
         return { icon: Banknote, color: 'text-green-400' }
      case 'card':
        return { icon: CreditCard, color: 'text-blue-400' }
      case 'online':
        return { icon: Globe, color: 'text-purple-400' }
      default:
        return { icon: DollarSign, color: 'text-slate-400' }
    }
  }

  // Get localized status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'Pago'
      case 'pending':
        return 'Pendente'
      case 'overdue':
        return 'Atrasado'
      default:
        return status || ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando faturas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link
              to="/receptionist/billing"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Gerenciamento de Faturas</h1>
              <p className="text-sm text-slate-400">Visualize e gerencie todas as faturas</p>
            </div>
          </div>
          <Link
            to="/receptionist/billing/create"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Criar nova fatura
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Filters and Search */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Pesquisar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome do paciente, telefone ou número da fatura..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="all">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Atrasado</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Intervalo de datas</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="all">Todo o período</option>
                <option value="today">Hoje</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="date">Data</option>
                <option value="amount">Valor</option>
                <option value="name">Nome do paciente</option>
              </select>
            </div>
          </div>

          {/* Sort Order Toggle */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              {sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
            </button>
          </div>
        </div>

        {/* Invoice Count */}
        <div className="mb-4">
          <p className="text-slate-400">
            Mostrando {filteredInvoices.length} de {invoices.length} faturas
          </p>
        </div>

        {/* Invoices Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">Nenhuma fatura encontrada</p>
              <p className="text-slate-500 text-sm">Tente ajustar sua pesquisa ou filtros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Fatura #</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Paciente</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Valor</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Método de Pagamento</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Data</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => {
                    const statusInfo = getStatusIcon(invoice.status)
                    const StatusIcon = statusInfo.icon
                    const paymentMethodInfo = getPaymentMethodIcon(invoice.paymentMethod)
                    const PaymentMethodIcon = paymentMethodInfo.icon

                    return (
                      <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-cyan-400">#{invoice.invoiceNumber}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{invoice.patientName}</p>
                            <p className="text-sm text-slate-400">{invoice.patientPhone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-green-400">₹{invoice.totalAmount?.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                              {getStatusLabel(invoice.status)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {invoice.paymentMethod ? (
                            <div className="flex items-center space-x-2">
                              <PaymentMethodIcon className={`w-4 h-4 ${paymentMethodInfo.color}`} />
                              <span className="text-sm capitalize">{invoice.paymentMethod}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">Não especificado</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-400">
                          {invoice.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                              <Link
                                to={`/receptionist/billing/invoices/${invoice.id}`}
                                className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-500/20 rounded transition-colors"
                                title="Visualizar fatura"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/receptionist/billing/invoices/${invoice.id}/download`}
                                className="text-green-400 hover:text-green-300 p-1 hover:bg-green-500/20 rounded transition-colors"
                                title="Baixar PDF"
                              >
                                <Download className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/receptionist/billing/invoices/${invoice.id}/edit`}
                                className="text-yellow-400 hover:text-yellow-300 p-1 hover:bg-yellow-500/20 rounded transition-colors"
                                title="Editar fatura"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setDateFilter('all')
                setSortBy('date')
                setSortOrder('desc')
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Limpar filtros
            </button>
            <Link
              to="/receptionist/billing"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              Voltar ao Painel
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
