'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useRouter } from 'next/navigation'
import { feesAPI } from '../../../services/api'
import Navbar from '../../../components/Navbar'
import ReceiptViewer from '../../../components/ReceiptViewer'
import { 
  CreditCard, 
  Eye, 
  Download, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  DollarSign,
  Receipt
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentFeesPage() {
  const { user, isAuthenticated, isStudent } = useAuth()
  const router = useRouter()
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReceipt, setShowReceipt] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [stats, setStats] = useState({
    totalPaid: 0,
    pendingFees: 0,
    totalTransactions: 0
  })

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (!isStudent) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isStudent, router])

  // Load student's fee data
  useEffect(() => {
    if (isAuthenticated && isStudent) {
      loadStudentFees()
    }
  }, [isAuthenticated, isStudent])

  const loadStudentFees = async () => {
    try {
      setLoading(true)
      const response = await feesAPI.getAll({ studentId: user.studentId })
      if (response.data.success) {
        setFees(response.data.fees)
        
        // Calculate statistics
        const totalPaid = response.data.fees
          .filter(fee => fee.status === 'paid')
          .reduce((sum, fee) => sum + parseFloat(fee.amount), 0)
        
        const pendingFees = response.data.fees
          .filter(fee => fee.status === 'pending')
          .reduce((sum, fee) => sum + parseFloat(fee.amount), 0)
        
        setStats({
          totalPaid,
          pendingFees,
          totalTransactions: response.data.fees.length
        })
      }
    } catch (error) {
      toast.error('Failed to load fee data')
      console.error('Load fees error:', error)
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
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
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

  const handleViewReceipt = async (feeId) => {
    try {
      const response = await feesAPI.getReceipt(feeId)
      if (response.data.success) {
        setSelectedReceipt({
          id: feeId,
          receipt: response.data.receipt,
          qrCode: response.data.qrCode
        })
        setShowReceipt(true)
      }
    } catch (error) {
      toast.error('Failed to load receipt')
      console.error('Load receipt error:', error)
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
          <h1 className="text-3xl font-bold text-gray-900">My Fee Payments</h1>
          <p className="mt-2 text-gray-600">
            View your payment history and download receipts
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Paid
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.totalPaid)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Fees
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(stats.pendingFees)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Receipt className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Transactions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalTransactions}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee History */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Payment History
            </h2>
          </div>
          
          {fees.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">
                You haven&apos;t made any fee payments yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(fee.status)}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {fee.transaction_id}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {fee.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(fee.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fee.status)}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(fee.payment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewReceipt(fee.id)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Receipt"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {fee.blockchain_hash && (
                            <button
                              onClick={() => window.open(`/api/blockchain/verify?hash=${fee.blockchain_hash}`, '_blank')}
                              className="text-green-600 hover:text-green-900"
                              title="Verify on Blockchain"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && selectedReceipt && (
        <ReceiptViewer
          receipt={selectedReceipt}
          onClose={() => {
            setShowReceipt(false)
            setSelectedReceipt(null)
          }}
        />
      )}
    </div>
  )
}
