import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEnvelope, FaArrowLeft, FaCircleCheck, FaTriangleExclamation, FaCircleNotch, FaArrowRight, FaStar } from 'react-icons/fa6'
import { useAuth } from '../../hooks/useAuth'

export default function ForgotPasswordForm() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor, insira seu e‑mail');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor, insira um endereço de e‑mail válido');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Use Firebase password reset
      await resetPassword(email.trim());
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
      // Handle specific Firebase errors
  let errorMessage = 'Falha ao enviar o e‑mail de recuperação. Tente novamente.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Nenhuma conta encontrada com este e‑mail.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Por favor, insira um endereço de e‑mail válido.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas solicitações. Tente novamente mais tarde.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 p-4 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-200 dark:bg-cyan-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-sky-200 dark:bg-sky-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse animation-delay-2000"></div>
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="w-full shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8">
            <div className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <FaCircleCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                Verifique seu e‑mail
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400">
                Se existe uma conta com <strong>{email}</strong>, enviamos um link para redefinir a senha
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  O que acontece a seguir?
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Verifique sua caixa de entrada (e a pasta de spam)</li>
                  <li>• Clique no link de recuperação no e‑mail</li>
                  <li>• Crie uma nova senha</li>
                  <li>• Faça login com sua nova senha</li>
                </ul>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaEnvelope className="w-4 h-4 mr-2 inline" />
                  Reenviar e‑mail
                </button>
                <Link to="/login">
                  <button className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                    <FaArrowLeft className="w-4 h-4 mr-2 inline" />
                    Voltar ao login
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-200 dark:bg-cyan-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-sky-200 dark:bg-sky-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 animate-pulse animation-delay-2000"></div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="w-full shadow-2xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8">
          <div className="text-center pb-6">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mb-4 shadow-lg">
                <FaStar className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 leading-tight">
              Esqueceu sua senha?
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Insira seu e‑mail e enviaremos um link para redefinir sua senha
            </p>
          </div>
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Endereço de e‑mail
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Digite seu e‑mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 h-12 border-2 transition-all duration-300 border-gray-200 focus:border-blue-500 dark:border-gray-600 dark:focus:border-blue-400 rounded-lg"
                    disabled={isLoading}
                    required
                  />
                </div>
                {error && (
                  <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                    <FaTriangleExclamation className="w-4 h-4 mr-2" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                
                {/* Helpful information */}
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="mb-1"><strong>O que acontece a seguir?</strong></p>
                  <ul className="space-y-1">
                    <li>• Processaremos sua solicitação de redefinição de senha</li>
                    <li>• Se uma conta existir, enviaremos um link de recuperação</li>
                    <li>• Verifique sua caixa de entrada (e spam)</li>
                    <li>• Clique no link para criar uma nova senha</li>
                  </ul>
                </div>
              </div>
              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaCircleNotch className="w-5 h-5 mr-2 animate-spin inline" />
                    Verificando e enviando...
                  </>
                ) : (
                  <>
                    Enviar link de recuperação
                    <FaArrowRight className="w-5 h-5 ml-2 inline" />
                  </>
                )}
              </button>
            </form>
            {/* Back to Login */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p>
            Lembrou da senha?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
            >
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
