import { createContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/config'
import {
  createUserWithRole,
  signInUser,
  resetUserPassword,
  resendUserVerificationEmail,
  fetchUserRoleFromFirestore
} from '../utils/authUtils'

const AuthContext = createContext()

export { AuthContext }
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(() => {
    // Tentar obter role do localStorage para acesso imediato
    return localStorage.getItem('userRole') || null
  })
  const [loading, setLoading] = useState(true)

  async function signup(email, password, fullName, role) {
    return await createUserWithRole(email, password, fullName, role)
  }

  async function login(email, password) {
    const user = await signInUser(email, password)
    // Role já vem anexado ao user
    if (user.userRole) {
      setUserRole(user.userRole)
      localStorage.setItem('userRole', user.userRole)
    }
    return user
  }

  async function logout() {
    localStorage.removeItem('userRole')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async function resetPassword(email) {
    return await resetUserPassword(email)
  }

  async function resendVerificationEmail() {
    if (currentUser) {
      return await resendUserVerificationEmail(currentUser)
    }
  }

  async function fetchUserRole(uid) {
    try {
      // Verificar cache primeiro
      const cachedRole = localStorage.getItem('userRole')
      if (cachedRole) {
        return cachedRole
      }
      
      const role = await fetchUserRoleFromFirestore(uid)
      if (role) {
        localStorage.setItem('userRole', role)
      }
      return role
    } catch (error) {
      console.error('Error fetching user role:', error)
      return localStorage.getItem('userRole') || null
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user)
        
        // Usar role do cache ou buscar
        const cachedRole = localStorage.getItem('userRole')
        if (cachedRole) {
          setUserRole(cachedRole)
          setLoading(false)
        } else {
          fetchUserRole(session.user.id)
            .then((role) => {
              if (role) {
                setUserRole(role)
              } else {
                console.warn('User role not available from database; using fallback role "doctor"')
                setUserRole('doctor')
                localStorage.setItem('userRole', 'doctor')
              }
            })
            .catch((err) => {
              console.warn('Error fetching user role (async):', err)
              setUserRole('doctor')
              localStorage.setItem('userRole', 'doctor')
            })
            .finally(() => setLoading(false))
        }
      } else {
        setCurrentUser(null)
        setUserRole(null)
        localStorage.removeItem('userRole')
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user)
        
        const cachedRole = localStorage.getItem('userRole')
        if (cachedRole) {
          setUserRole(cachedRole)
        } else {
          fetchUserRole(session.user.id).then((role) => {
            setUserRole(role || 'doctor')
            localStorage.setItem('userRole', role || 'doctor')
          })
        }
      } else {
        setCurrentUser(null)
        setUserRole(null)
        localStorage.removeItem('userRole')
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    logout,
    resetPassword,
    resendVerificationEmail,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
