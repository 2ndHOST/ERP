'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      // Verify token with backend
      api.get('/auth/verify')
        .then(response => {
          if (response.data.success) {
            setUser(response.data.user)
          } else {
            Cookies.remove('token')
            setUser(null)
          }
        })
        .catch(() => {
          Cookies.remove('token')
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        const { token, user } = response.data
        
        // Store token in cookie
        Cookies.set('token', token, { 
          expires: 1, // 1 day
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        
        setUser(user)
        toast.success(`Welcome back, ${user.username}!`)
        
        // Redirect based on role
        if (user.role === 'admin') {
          router.push('/dashboard')
        } else {
          router.push('/admissions')
        }
        
        return { success: true }
      } else {
        throw new Error(response.data.error || 'Login failed')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        const { token, user } = response.data
        
        // Store token in cookie
        Cookies.set('token', token, { 
          expires: 1, // 1 day
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        
        setUser(user)
        toast.success('Registration successful!')
        
        // Redirect to appropriate page
        router.push('/admissions')
        
        return { success: true }
      } else {
        throw new Error(response.data.error || 'Registration failed')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    Cookies.remove('token')
    setUser(null)
    router.push('/')
    toast.success('Logged out successfully')
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
