import { Route, Routes, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import DoctorLayout from './pages/doctor/DoctorLayout'
import DoctorHome from './pages/doctor/DoctorHome'
import ReceptionistLayout from './pages/receptionist/ReceptionistLayout'
import ReceptionistHome from './pages/receptionist/ReceptionistHome'
import DoctorAppointments from './pages/doctor/appointment/Appointments'
import ReceptionistAppointments from './pages/receptionist/appointment/Appointments'
import Signup from './pages/auth/Signup'
import ForgotPasswordForm from './pages/auth/ForgotPasswordForm'
import VerifyEmail from './pages/auth/VerifyEmail'
import ProtectedRoute from './components/ProtectedRoute'

// Doctor Prescription Pages
import DoctorPrescriptions from './pages/doctor/prescriptions/Prescriptions'
import CreatePrescription from './pages/doctor/prescriptions/CreatePrescription'
import ViewPrescription from './pages/doctor/prescriptions/ViewPrescription'
import Medicines from './pages/doctor/prescriptions/Medicines'

// Receptionist Prescription Pages
import ReceptionistPrescriptions from './pages/receptionist/prescriptions/Prescriptions'
import ReceptionistViewPrescription from './pages/receptionist/prescriptions/ViewPrescription'
import TokenManagement from './pages/receptionist/token/TokenManagement'
import TokenQueue from './pages/doctor/token/TokenQueue'
import TokenDisplay from './components/TokenDisplay'

// Receptionist Billing Pages
import BillingDashboard from './pages/receptionist/billing/BillingDashboard'
import CreateInvoice from './pages/receptionist/billing/CreateInvoice'
import InvoiceList from './pages/receptionist/billing/InvoiceList'
import PaymentProcessing from './pages/receptionist/billing/PaymentProcessing'
import PaymentHistory from './pages/receptionist/billing/PaymentHistory'
import InvoicePdfGenerator from './pages/receptionist/billing/InvoicePdfGenerator'
import BillingReports from './pages/receptionist/billing/Reports'
import Reports from './pages/Reports'
// Generic Pages
import Estoque from './pages/Estoque'
import Documentos from './pages/Documentos'
import Agenda from './pages/Agenda'
import Configuracoes from './pages/Configuracoes'
import Pacientes from './pages/Pacientes'

// New Doctor Pages
import DoctorPatients from './pages/doctor/patients/Patients'
import DoctorDocuments from './pages/doctor/documents/Documents'
import DoctorReports from './pages/doctor/reports/Reports'
import DoctorStock from './pages/doctor/stock/Stock'
import DoctorAttendance from './pages/doctor/attendance/Attendance'
import DoctorBilling from './pages/doctor/billing/Billing'

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/:role" element={<Signup />} />
        <Route path="/queue" element={<TokenDisplay />} />
      
      {/* Doctor Routes (layout with dashbar + nested routes) */}
      <Route path="/doctor" element={
        <ProtectedRoute requiredRole="doctor">
          <DoctorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DoctorHome />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="documents" element={<DoctorDocuments />} />
        <Route path="reports" element={<DoctorReports />} />
        <Route path="stock" element={<DoctorStock />} />
        <Route path="attendance" element={<DoctorAttendance />} />
        <Route path="token" element={<TokenQueue />} />
        <Route path="billing" element={<DoctorBilling />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="prescriptions/create" element={<CreatePrescription />} />
        <Route path="prescriptions/create/:id" element={<CreatePrescription />} />
        <Route path="prescriptions/view/:id" element={<ViewPrescription />} />
        <Route path="prescriptions/edit/:id" element={<CreatePrescription />} />
        <Route path="prescriptions/medicines" element={<Medicines />} />
        {/* Doctor - Generic Pages (old) */}
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="relatorios" element={<Reports />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>
      
      {/* Doctor Prescription Routes */}
      <Route path="/doctor/prescriptions" element={
        <ProtectedRoute requiredRole="doctor">
          <DoctorPrescriptions />
        </ProtectedRoute>
      } />
      <Route path="/doctor/prescriptions/create" element={
        <ProtectedRoute requiredRole="doctor">
          <CreatePrescription />
        </ProtectedRoute>
      } />
      <Route path="/doctor/prescriptions/create/:id" element={
        <ProtectedRoute requiredRole="doctor">
          <CreatePrescription />
        </ProtectedRoute>
      } />
      <Route path="/doctor/prescriptions/view/:id" element={
        <ProtectedRoute requiredRole="doctor">
          <ViewPrescription />
        </ProtectedRoute>
      } />
      <Route path="/doctor/prescriptions/edit/:id" element={
        <ProtectedRoute requiredRole="doctor">
          <CreatePrescription />
        </ProtectedRoute>
      } />
      <Route path="/doctor/prescriptions/medicines" element={
        <ProtectedRoute requiredRole="doctor">
          <Medicines />
        </ProtectedRoute>
      } />
      
      {/* Receptionist Routes (layout with dashbar + nested routes) */}
      <Route path="/receptionist" element={
        <ProtectedRoute requiredRole="receptionist">
          <ReceptionistLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ReceptionistHome />} />
        <Route path="appointments" element={<ReceptionistAppointments />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="prescriptions" element={<ReceptionistPrescriptions />} />
        <Route path="prescriptions/view/:id" element={<ReceptionistViewPrescription />} />
        <Route path="tokens" element={<TokenManagement />} />
        <Route path="billing" element={<BillingDashboard />} />
        <Route path="billing/create" element={<CreateInvoice />} />
        <Route path="billing/invoices" element={<InvoiceList />} />
        <Route path="billing/payments" element={<PaymentProcessing />} />
        <Route path="billing/history" element={<PaymentHistory />} />
        <Route path="billing/invoices/:id" element={<InvoicePdfGenerator />} />
        <Route path="billing/invoices/:id/download" element={<InvoicePdfGenerator />} />
        <Route path="billing/invoices/:id/edit" element={<CreateInvoice />} />
        <Route path="billing/reports" element={<BillingReports />} />
        {/* Receptionist - Generic Pages */}
        <Route path="relatorios" element={<Reports />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="documentos" element={<Documentos />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>

      <Route path="/forgot-password" element={<ForgotPasswordForm />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
