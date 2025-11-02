import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const appName = import.meta.env.VITE_APP_NAME || 'Life Clinic Management System'
  const redirectDelay = Number(import.meta.env.VITE_REDIRECT_DELAY_MS || 1500) // Reduzido de 5000 para 1500ms

  useEffect(() => {
    const id = setTimeout(() => navigate('/login'), redirectDelay)
    return () => clearTimeout(id)
  }, [navigate, redirectDelay])

  useEffect(() => {
    document.title = `${appName} — Bem-vindo`
  }, [appName])

  return (
    <div className="home-landing">
      <style>{`
        .home-landing {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #080d17 0%, #0e141e 50%, #080d17 100%);
          background-attachment: fixed;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial;
        }
        .home-landing .container {
          text-align: center;
          padding: 32px 24px;
          max-width: 560px;
        }
        .home-landing .logo-container {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          position: relative;
          animation: pulse 2s ease-in-out infinite;
        }
        .home-landing .logo-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(200, 134, 84, 0.3);
          position: relative;
          overflow: hidden;
        }
        .home-landing .logo-circle::before {
          content: '';
          position: absolute;
          inset: 0;
          background: conic-gradient(from 0deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05), rgba(255,255,255,0.3));
          animation: spin 3s linear infinite;
        }
        .home-landing .logo-text {
          font-size: 32px;
          font-weight: 700;
          color: white;
          z-index: 1;
          position: relative;
        }
        .home-landing h1 {
          margin: 0 0 12px;
          font-weight: 700;
          font-size: 28px;
          color: var(--color-text);
          animation: fadeInUp 900ms ease both;
        }
        .home-landing p {
          margin: 0 auto 24px;
          font-size: 15px;
          color: var(--color-text-light);
          line-height: 1.6;
          animation: fadeInUp 900ms ease 120ms both;
        }
        .home-landing .loader {
          width: 48px;
          height: 48px;
          margin: 24px auto 0;
          border-radius: 50%;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-primary);
          animation: spin 1s linear infinite;
        }
        .home-landing .hint {
          margin-top: 20px;
          font-size: 13px;
          color: var(--color-text-light);
          animation: fadeIn 1.2s ease 500ms both;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <main className="container" role="main" aria-label="Tela de boas-vindas">
        <div className="logo-container">
          <img src="/logo-db.png" alt="Logo Dr. David Breno" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
        </div>
        <h1>Consultório Dr. David Breno</h1>
        <p>Preparando tudo para você. Redirecionando para o login em instantes...</p>
        <div className="loader" aria-hidden="true"></div>
        <div className="hint" aria-hidden="true">Você será redirecionado em cerca de 5 segundos.</div>
      </main>
    </div>
  )
}


