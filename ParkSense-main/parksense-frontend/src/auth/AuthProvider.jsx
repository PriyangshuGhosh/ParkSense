import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/firebase' // Assumes you export 'auth' here

// Define the context shape
const AuthContext = createContext({ user: null, loading: true, token: null })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null) // State for the ID Token

  useEffect(() => {
    // Make callback async to use await for getIdToken()
    const unsub = onAuthStateChanged(auth, async (u) => { 
      setUser(u)
      
      if (u) {
        try {
          // CRITICAL: Fetch the ID Token for backend communication
          const idToken = await u.getIdToken()
          setToken(idToken) 
        } catch (error) {
          console.error("Error fetching token:", error)
          setToken(null)
        }
      } else {
        // Clear the token when the user logs out
        setToken(null)
      }
      
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return (
    // EXPOSE 'token' via the context provider
    <AuthContext.Provider value={{ user, loading, token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}