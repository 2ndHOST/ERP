'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'
import { dashboardAPI } from '../../services/api'
import Navbar from '../../components/Navbar'
import { 
  User, 
  CreditCard, 
  Home as HomeIcon, 
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentDashboard() {
  const { user, isAuthenticated, isStudent } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [studentData, setStudentData] = useState(null)
  const [fees, setFees] = useState(null)
  const [hostel, setHostel] = useState(null)

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (!isStudent) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isStudent, router])

  // Load student dashboard data
  useEffect(() => {
    if (isAuthenticated && isStudent) {
      loadStudentData()
    }
  }, [isAuthenticated, isStudent])

  const loadStudentData = async () => {
    try {
      setLoading(true)
      const response = await dashboardAPI.getStudentDashboard()
      if (response.data.success) {
        setStudentData(response.data.student)
        setFees(response.data.fees)
        setHostel(response.data.hostel)
      }
    } catch (error) {
      toast.error('Failed to load student data')
      console.error('Load student data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated || !isStudent) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {studentData?.name || user?.username}!
          </p>
        </div>

        {/* Student Info Card */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-lg text-gray-900">{studentData?.name}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg text-gray-900">{studentData?.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Course</p>
                  <p className="text-lg text-gray-900">{studentData?.course}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-lg text-gray-900">{formatDate(studentData?.dob)}</p>
                </div>
              </div>

              {studentData?.phone && (
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <Phone className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-lg text-gray-900">{studentData.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-lg text-gray-900">{studentData?.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fee Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Fee Information
              </h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(fees?.totalPaid || 0)}
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {formatCurrency(fees?.pendingFees || 0)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Transactions</h3>
                {fees?.history && fees.history.length > 0 ? (
                  <div className="space-y-3">
                    {fees.history.slice(0, 5).map((fee) => (
                      <div key={fee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          {getStatusIcon(fee.status)}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(fee.amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(fee.payment_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fee.status)}`}>
                            {fee.status}
                          </span>
                          {fee.blockchain_hash && (
                            <button
                              onClick={() => window.open(`/api/blockchain/verify?hash=${fee.blockchain_hash}`, '_blank')}
                              className="text-primary-600 hover:text-primary-900"
                              title="Verify on Blockchain"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No fee transactions found</p>
                )}
              </div>
            </div>
          </div>

          {/* Hostel Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2" />
                Hostel Information
              </h2>
            </div>
            <div className="px-6 py-4">
              {hostel ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Room Allocated</p>
                        <p className="text-lg font-bold text-green-900">Room {hostel.room_no}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Allocated on:</strong> {formatDate(hostel.allocated_at)}</p>
                    {hostel.blockchain_hash && (
                      <div className="mt-2 flex items-center">
                        <span className="text-xs text-gray-500 mr-2">Blockchain Verified:</span>
                        <button
                          onClick={() => window.open(`/api/blockchain/verify?hash=${hostel.blockchain_hash}`, '_blank')}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Hostel Allocation</h3>
                  <p className="text-gray-500">
                    You don&apos;t have an active hostel allocation. Contact the administration for room allocation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                <FileText className="h-5 w-5 mr-2 text-primary-600" />
                <span className="text-sm font-medium">View All Receipts</span>
              </button>
              <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="h-5 w-5 mr-2 text-primary-600" />
                <span className="text-sm font-medium">Download Documents</span>
              </button>
              <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Eye className="h-5 w-5 mr-2 text-primary-600" />
                <span className="text-sm font-medium">Blockchain Verification</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
