'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'
import { hostelAPI, admissionsAPI } from '../../services/api'
import FormInput from '../../components/FormInput'
import Navbar from '../../components/Navbar'
import { 
  Building, 
  Plus, 
  Eye, 
  Search,
  Filter,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function HostelPage() {
  const { user, isAdmin, isAuthenticated } = useAuth()
  const router = useRouter()
  const [allocations, setAllocations] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    studentId: '',
    roomNo: ''
  })
  const [formErrors, setFormErrors] = useState({})

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Load data
  useEffect(() => {
    if (isAuthenticated) {
      loadAllocations()
      loadStudents()
    }
  }, [isAuthenticated])

  const loadAllocations = async () => {
    try {
      setLoading(true)
      const response = await hostelAPI.getAll()
      if (response.data.success) {
        setAllocations(response.data.allocations)
      }
    } catch (error) {
      toast.error('Failed to load hostel allocations')
      console.error('Load allocations error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      const response = await admissionsAPI.getAll()
      if (response.data.success) {
        setStudents(response.data.students)
      }
    } catch (error) {
      console.error('Load students error:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.studentId) errors.studentId = 'Student is required'
    if (!formData.roomNo.trim()) errors.roomNo = 'Room number is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const response = await hostelAPI.create(formData)
      if (response.data.success) {
        toast.success('Hostel room allocated successfully')
        await loadAllocations()
        resetForm()
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to allocate room'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: '',
      roomNo: ''
    })
    setFormErrors({})
    setShowForm(false)
  }

  const handleDeallocate = async (allocationId) => {
    if (!confirm('Are you sure you want to deallocate this room?')) {
      return
    }

    try {
      setLoading(true)
      await hostelAPI.deallocate(allocationId)
      toast.success('Room deallocated successfully')
      await loadAllocations()
    } catch (error) {
      toast.error('Failed to deallocate room')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
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

  const filteredAllocations = allocations.filter(allocation => {
    const matchesSearch = 
      allocation.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allocation.room_no?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || allocation.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Get available students (those without active allocations)
  const availableStudents = students.filter(student => 
    !allocations.some(allocation => 
      allocation.student_id === student.id && allocation.status === 'active'
    )
  )

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hostel Management</h1>
              <p className="mt-2 text-gray-600">
                Manage room allocations and assignments
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary btn-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Allocate Room
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Allocations</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {allocations.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Allocations</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {allocations.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available Students</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {availableStudents.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search allocations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Allocations List */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loading-spinner"></div>
            </div>
          ) : filteredAllocations.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No allocations found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by allocating a room'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allocated
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAllocations.map((allocation) => (
                    <tr key={allocation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {allocation.student_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {allocation.student_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            Room {allocation.room_no}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(allocation.status)}`}>
                          {getStatusIcon(allocation.status)}
                          <span className="ml-1 capitalize">{allocation.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(allocation.allocated_at).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {allocation.status === 'active' && (
                            <button
                              onClick={() => handleDeallocate(allocation.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Deallocate
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Allocation Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Allocate Hostel Room
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className={`input ${formErrors.studentId ? 'border-red-300' : ''}`}
                    required
                  >
                    <option value="">Select a student</option>
                    {availableStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} - {student.course}
                      </option>
                    ))}
                  </select>
                  {formErrors.studentId && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.studentId}</p>
                  )}
                  {availableStudents.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No available students for allocation
                    </p>
                  )}
                </div>

                <FormInput
                  label="Room Number"
                  name="roomNo"
                  value={formData.roomNo}
                  onChange={handleInputChange}
                  error={formErrors.roomNo}
                  required
                  placeholder="Enter room number"
                />

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Room Allocation</h4>
                      <p className="text-xs text-blue-600 mt-1">
                        Ensure the room is available before allocation
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary btn-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || availableStudents.length === 0}
                    className="btn btn-primary btn-md"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="loading-spinner mr-2"></div>
                        Allocating...
                      </div>
                    ) : (
                      <>
                        <Building className="h-4 w-4 mr-2" />
                        Allocate Room
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
