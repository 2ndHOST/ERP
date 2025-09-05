'use client'

import { useState } from 'react'
import { Download, Eye, EyeOff, X, QrCode, CheckCircle } from 'lucide-react'

export default function ReceiptViewer({ receipt, qrCode, blockchainHash, onClose }) {
  const [showQR, setShowQR] = useState(false)

  const handleDownload = () => {
    if (receipt) {
      const link = document.createElement('a')
      link.href = `data:application/pdf;base64,${receipt}`
      link.download = `receipt-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePrint = () => {
    if (receipt) {
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <iframe src="data:application/pdf;base64,${receipt}" width="100%" height="600px"></iframe>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="btn btn-outline btn-sm"
            >
              {showQR ? <EyeOff className="h-4 w-4 mr-1" /> : <QrCode className="h-4 w-4 mr-1" />}
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>
            <button
              onClick={handleDownload}
              className="btn btn-primary btn-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PDF Receipt */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Receipt Document</h4>
              {receipt ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src={`data:application/pdf;base64,${receipt}`}
                    width="100%"
                    height="500"
                    className="border-0"
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-8 text-center">
                  <p className="text-gray-500">Receipt not available</p>
                </div>
              )}
            </div>

            {/* QR Code and Blockchain Info */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Verification Details</h4>
              
              {/* QR Code */}
              {showQR && qrCode && (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Verification QR Code</h5>
                  <div className="flex justify-center">
                    <img 
                      src={qrCode} 
                      alt="Verification QR Code" 
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Scan to verify this receipt
                  </p>
                </div>
              )}

              {/* Blockchain Hash */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Blockchain Hash</h5>
                <div className="bg-white p-3 rounded border font-mono text-xs break-all">
                  {blockchainHash || 'Not available'}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This hash verifies the authenticity of this receipt
                </p>
              </div>

              {/* Verification Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <h5 className="text-sm font-medium text-green-800">Verified</h5>
                    <p className="text-xs text-green-600">
                      This receipt has been verified on the blockchain
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handlePrint}
                  className="w-full btn btn-outline btn-sm"
                >
                  Print Receipt
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(blockchainHash || '')}
                  className="w-full btn btn-secondary btn-sm"
                >
                  Copy Hash
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
