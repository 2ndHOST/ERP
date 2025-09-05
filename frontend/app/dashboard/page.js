'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'
import { dashboardAPI, blockchainAPI } from '../../services/api'
import Navbar from '../../components/Navbar'
import FeeChart from '../../components/Charts/FeeChart'
import AdmissionChart from '../../components/Charts/AdmissionChart'
import { 
  Users, 
  CreditCard, 
  Building, 
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, isAdmin, isAuthenticated } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState(null)
  const [blockchainStatus, setBlockchainStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (!isAdmin) {
      router.push('/admissions')
    }
  }, [isAuthenticated, isAdmin, router])

  // Load dashboard data
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadDashboardData()
    }
  }, [isAuthenticated, isAdmin])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await dashboardAPI.getAdminDashboard()
      if (response.data.success) {
        setDashboardData(response.data)
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error('Load dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyBlockchain = async () => {
    try {
      setVerifying(true)
      const response = await blockchainAPI.verify()
      if (response.data.success) {
        setBlockchainStatus(response.data)
        if (response.data.isValid) {
          toast.success('Blockchain verification successful!')
        } else {
          toast.error('Blockchain verification failed!')
        }
      }
    } catch (error) {
      toast.error('Failed to verify blockchain')
      console.error('Blockchain verification error:', error)
    } finally {
      setVerifying(false)
    }
  }

  if (!isAuthenticated || !isAdmin) {
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

  const { summary, trends, recent, distribution } = dashboardData || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Overview of your Student ERP System
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'blockchain', name: 'Blockchain', icon: Shield },
                { id: 'analytics', name: 'Analytics', icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {summary?.totalStudents || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Fees Collected</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ₹{summary?.totalFeesCollected?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Hostel Occupancy</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {summary?.hostelOccupancyRate || 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Transactions</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {summary?.totalTransactions || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Fee Collection Trends
                </h3>
                <FeeChart data={trends?.fees || []} type="line" />
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Admission Trends
                </h3>
                <AdmissionChart data={trends?.admissions || []} type="area" />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Admissions
                </h3>
                <div className="space-y-3">
                  {recent?.admissions?.slice(0, 5).map((admission) => (
                    <div key={admission.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {admission.name}
                        </p>
                        <p className="text-sm text-gray-500">{admission.course}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(admission.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Payments
                </h3>
                <div className="space-y-3">
                  {recent?.fees?.slice(0, 5).map((fee) => (
                    <div key={fee.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {fee.student_name}
                        </p>
                        <p className="text-sm text-gray-500">₹{fee.amount}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(fee.payment_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blockchain Tab */}
        {activeTab === 'blockchain' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Blockchain Verification
                </h3>
                <button
                  onClick={verifyBlockchain}
                  disabled={verifying}
                  className="btn btn-primary btn-md"
                >
                  {verifying ? (
                    <div className="flex items-center">
                      <div className="loading-spinner mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Blockchain
                    </>
                  )}
                </button>
              </div>

              {blockchainStatus && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    blockchainStatus.isValid 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {blockchainStatus.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <h4 className={`text-sm font-medium ${
                        blockchainStatus.isValid ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {blockchainStatus.isValid ? 'Blockchain is Valid' : 'Blockchain Issues Detected'}
                      </h4>
                    </div>
                    <p className={`text-sm mt-1 ${
                      blockchainStatus.isValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {blockchainStatus.isValid 
                        ? 'All blocks are properly linked and verified.'
                        : 'Some blocks have integrity issues that need attention.'
                      }
                    </p>
                  </div>

                  {blockchainStatus.issues && blockchainStatus.issues.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-red-800 mb-2">Issues Found:</h5>
                      <ul className="text-sm text-red-600 space-y-1">
                        {blockchainStatus.issues.map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Total Blocks</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {blockchainStatus.statistics?.totalBlocks || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Block Types</p>
                      <div className="mt-2 space-y-1">
                        {Object.entries(blockchainStatus.statistics?.blockTypes || {}).map(([type, count]) => (
                          <div key={type} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500">Last Block Hash</p>
                      <p className="text-xs font-mono text-gray-600 break-all">
                        {blockchainStatus.statistics?.lastBlockHash || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Course Distribution
                </h3>
                <FeeChart 
                  data={distribution?.courses?.map(course => ({
                    name: course.course,
                    value: course.count
                  })) || []} 
                  type="pie" 
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Fee Collection by Month
                </h3>
                <FeeChart data={trends?.fees || []} type="bar" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Admission Trends
              </h3>
              <AdmissionChart data={trends?.admissions || []} type="line" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
