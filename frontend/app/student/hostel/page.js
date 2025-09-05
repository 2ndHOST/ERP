'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useRouter } from 'next/navigation'
import { hostelAPI } from '../../../services/api'
import Navbar from '../../../components/Navbar'
import { 
  Building, 
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  Key,
  Shield,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentHostelPage() {
  const { user, isAuthenticated, isStudent } = useAuth()
  const router = useRouter()
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (!isStudent) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isStudent, router])

  // Load student's hostel allocation
  useEffect(() => {
    if (isAuthenticated && isStudent) {
      loadStudentHostel()
    }
  }, [isAuthenticated, isStudent])

  const loadStudentHostel = async () => {
    try {
      setLoading(true)
      const response = await hostelAPI.getByStudentId(user.studentId)
      if (response.data.success) {
        setAllocation(response.data.allocation)
      }
    } catch (error) {
      // If no allocation found, that's okay - student just doesn't have one
      if (error.response?.status !== 404) {
        toast.error('Failed to load hostel information')
        console.error('Load hostel error:', error)
      }
    } finally {
      setLoading(false)
    }
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
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'inactive':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Hostel Information</h1>
          <p className="mt-2 text-gray-600">
            View your hostel allocation and room details
          </p>
        </div>

        {allocation ? (
          <div className="space-y-6">
            {/* Allocation Status Card */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Hostel Allocation
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center justify-between p-6 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    {getStatusIcon(allocation.status)}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-green-900">Room Allocated</h3>
                      <p className="text-2xl font-bold text-green-900">Room {allocation.room_no}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(allocation.status)}`}>
                    {allocation.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Room Details
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Key className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Room Number</p>
                      <p className="text-lg font-medium text-gray-900">{allocation.room_no}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Allocated On</p>
                      <p className="text-lg font-medium text-gray-900">
                        {formatDate(allocation.allocated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain Verification */}
            {allocation.blockchain_hash && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Blockchain Verification
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Record Verified</p>
                        <p className="text-xs text-blue-700">
                          This allocation is recorded on the blockchain
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(`/api/blockchain/verify?hash=${allocation.blockchain_hash}`, '_blank')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Important Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important Information
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Keep your room key safe and report any issues to the hostel warden</li>
                      <li>Follow hostel rules and regulations</li>
                      <li>Contact administration for any room-related concerns</li>
                      <li>Your allocation is verified on the blockchain for security</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No Allocation */
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-12 text-center">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Hostel Allocation</h3>
              <p className="text-gray-500 mb-6">
                You don&apos;t have an active hostel allocation. Contact the administration office to apply for hostel accommodation.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">How to Apply for Hostel:</h4>
                <ul className="text-sm text-blue-700 text-left space-y-1">
                  <li>• Visit the administration office</li>
                  <li>• Fill out the hostel application form</li>
                  <li>• Submit required documents</li>
                  <li>• Wait for allocation based on availability</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
