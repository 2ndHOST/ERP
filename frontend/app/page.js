'use client'

import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  GraduationCap, 
  Shield, 
  Users, 
  CreditCard, 
  Home as HomeIcon, 
  BarChart3,
  CheckCircle,
  Lock
} from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'admin' ? '/dashboard' : '/admissions')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Student ERP System</h1>
            </div>
            <Link 
              href="/login" 
              className="btn btn-primary btn-md"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Modern Student
            <span className="text-primary-600"> Management</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            A comprehensive ERP system with blockchain verification for secure student record management, 
            fee processing, and hostel allocation.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link 
                href="/login" 
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link 
                href="/admissions" 
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Student Management */}
            <div className="card fade-in">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Student Management</h3>
                    <p className="text-sm text-gray-500">
                      Complete student lifecycle management from admission to graduation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Management */}
            <div className="card fade-in">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Fee Management</h3>
                    <p className="text-sm text-gray-500">
                      Secure fee processing with PDF receipts and QR code verification.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hostel Management */}
            <div className="card fade-in">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HomeIcon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Hostel Management</h3>
                    <p className="text-sm text-gray-500">
                      Efficient room allocation and management system.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="card fade-in">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
                    <p className="text-sm text-gray-500">
                      Real-time insights and comprehensive reporting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain Verification */}
            <div className="card fade-in">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Blockchain Security</h3>
                    <p className="text-sm text-gray-500">
                      Immutable record verification using blockchain technology.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secure Authentication */}
            <div className="card fade-in">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Lock className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Secure Authentication</h3>
                    <p className="text-sm text-gray-500">
                      JWT-based authentication with role-based access control.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-primary-600 rounded-lg">
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white">
                Ready to get started?
              </h3>
              <p className="mt-4 text-lg text-primary-100">
                Join thousands of educational institutions already using our platform.
              </p>
              <div className="mt-8">
                <Link 
                  href="/login" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Start Your Journey
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <GraduationCap className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-semibold text-gray-900">Student ERP System</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              © 2024 Student ERP System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
