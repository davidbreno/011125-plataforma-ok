import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// Use a safe local placeholder (logo.png exists in the assets folder). We
// dynamically try to load `logo.svg` or `logo.png` from the user's folder
// at runtime; this import provides a guaranteed fallback for the build.
import LogoPlaceholder from '../../assets/logo/logo.png'
import { useEffect } from 'react'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaStar, FaShieldHalved } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [logoSrc, setLogoSrc] = useState(LogoPlaceholder)

  // Note: we avoid dynamic import of optional assets to prevent Vite
  // import-analysis errors when the file does not exist. The component
  // uses the statically imported `LogoPlaceholder` (logo.png) as the
  // guaranteed asset. If you want SVG support, add `logo.svg` and I can
  // update the code to statically import it.

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Preencha todos os campos.')
      return
    }
    
    setIsLoading(true)
    setError('')
    
         try {
       // Use Firebase authentication - now returns user with role attached
       const user = await login(email, password)
       
       // Role is already fetched during login for faster navigation
       const userRole = user.userRole || 'doctor'
       if (userRole === 'receptionist') {
         navigate('/receptionist')
       } else {
         // default to doctor for any other role or if not found
         navigate('/doctor')
       }
    } catch (error) {
      console.error('Login error:', error)
      // Handle specific Firebase errors
  let errorMessage = 'Falha ao entrar. Tente novamente.'
      
      if (error.code === 'auth/user-not-found') {
  errorMessage = 'Nenhuma conta encontrada com este e‑mail.'
      } else if (error.code === 'auth/wrong-password') {
  errorMessage = 'Senha incorreta. Tente novamente.'
      } else if (error.code === 'auth/invalid-email') {
  errorMessage = 'Por favor, insira um endereço de e‑mail válido.'
      } else if (error.code === 'auth/user-disabled') {
  errorMessage = 'Esta conta foi desativada.'
      } else if (error.message.includes('No document to update')) {
  errorMessage = 'Configuração da conta incompleta. Contate o suporte.'
      }
      
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
  <div className="min-h-screen text-text antialiased relative overflow-hidden bg-hero-palette">
      {/* Animated Background Elements */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none bg-hero-dark">
        {/* Floating orbs */}
  <div className="absolute top-20 left-20 w-72 h-72 bg-primary-20 rounded-full blur-3xl animate-pulse"></div>
  <div className="absolute top-40 right-20 w-96 h-96 bg-primary-20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
  <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary-20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-900/50 to-slate-900"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          <div className="rounded-2xl overflow-hidden flex flex-col md:flex-row" style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
            {/* Left panel (art + marketing) */}
            <div className="md:w-1/2 p-12 flex flex-col justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #121b2a 0%, #172234 100%)' }}>
              {/* Textura escura no fundo */}
              <div className="absolute inset-0 opacity-30" style={{ 
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px),
                                  repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)`,
                backgroundSize: '20px 20px'
              }}></div>
              <div className="max-w-lg relative z-10">
                <img src={logoSrc} alt="Logo" className="w-96 md:w-[896px] h-auto mb-4 object-contain mx-auto" />
                <h2 className="text-3xl font-extrabold text-white mb-2 -mt-3">Transforme sorrisos, simplifique sua rotina</h2>
                <p className="text-sm text-white/90">Uma plataforma inteligente feita para o dentista moderno. Eficiência, controle e praticidade em um só lugar.</p>
              </div>
            </div>

            {/* Right panel (form) */}
            <div className="md:w-1/2 p-12" style={{ backgroundColor: 'var(--color-bg)' }}>
              <div className="max-w-md mx-auto">
                <div className="text-left mb-6">
                  <h1 className="text-2xl font-semibold" style={{ color: '#121b2a' }}>Sign in</h1>
                  <p className="text-sm" style={{ color: '#121b2a' }}>Entre com seu usuário</p>
                </div>

                <div className="card-surface">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>User name or email address</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-light)' }}>
                          <FaEnvelope />
                        </div>
                        <input
                          type="email"
                          placeholder="Digite seu e‑mail"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none"
                          style={{
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)'
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>Your password</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-light)' }}>
                          <FaLock />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-lg outline-none"
                          style={{
                            backgroundColor: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text)'
                          }}
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--color-text-light)' }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    {error && <div className="text-sm text-red-500">{error}</div>}

                    <button
                      type="submit"
                      disabled={!email || !password || isLoading}
                      className="btn-primary w-full"
                    >
                      {isLoading ? 'Entrando...' : 'Sign in'}
                    </button>
                  </form>

                  <div className="mt-6 text-sm" style={{ color: 'var(--color-text-light)' }}>
                    Don't have an account? <Link to="/signup" className="underline font-medium" style={{ color: 'var(--color-primary)' }}>Sign up</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
