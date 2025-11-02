import { supabase } from '../supabase/config'

export async function createUserWithRole(email, password, fullName, role) {
  // Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      },
      emailRedirectTo: `${window.location.origin}/login`
    }
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Failed to create user')

  // Create user record in users table
  const { error: dbError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: email,
      user_role: role,
      full_name: fullName,
      created_at: new Date().toISOString()
    })

  if (dbError) throw dbError

  return authData.user
}

export async function signInUser(email, password) {
  // Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Invalid credentials')

  const user = authData.user

  // Fetch user role from database
  const { data: userData, error: dbError } = await supabase
    .from('users')
    .select('user_role, full_name')
    .eq('id', user.id)
    .single()

  let userRole = 'doctor' // default

  if (dbError) {
    console.warn('Database error during signIn, using default role:', dbError)
  } else if (userData) {
    userRole = userData.user_role || 'doctor'
    
    // Update lastLogin in background (non-blocking)
    supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)
      .then()
      .catch(err => console.warn('Failed to update lastLogin:', err))
  } else {
    // Create new user record if it doesn't exist
    await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        user_role: 'doctor',
        full_name: user.user_metadata?.full_name || 'Unknown',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      })
  }

  // Attach role to user object for immediate access
  user.userRole = userRole
  user.displayName = userData?.full_name || user.user_metadata?.full_name
  
  return user
}

export async function resetUserPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  if (error) throw error
  return { success: true }
}

export async function resendUserVerificationEmail(user) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email
  })
  if (error) throw error
  return { success: true }
}

export async function fetchUserRoleFromFirestore(uid) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_role')
      .eq('id', uid)
      .single()
    
    if (error) throw error
    return data?.user_role || null
  } catch (error) {
    console.error('Error fetching user role:', error)
    return null
  }
}


