'use client'

/**
 * SSO Components - Stub Implementations
 * SSO functionality is disabled
 */

interface SSOFormProps {
  identifier?: string
}

export function SSOForm() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Single Sign-On</h1>
        <p className="text-gray-600">
          Single Sign-On (SSO) is not available in this deployment.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Please contact your administrator if you believe this is in error.
        </p>
      </div>
    </div>
  )
}

export function SSO() {
  return (
    <div className="p-4 text-center text-gray-500">
      <p>Single Sign-On (SSO) is not available in this deployment.</p>
      <p className="text-sm mt-2">SSO configuration requires the enterprise edition.</p>
    </div>
  )
}

interface SSOAuthProps {
  identifier: string
}

export function SSOAuth({ identifier }: SSOAuthProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-4">
          Single Sign-On (SSO) is not available in this deployment.
        </p>
        <p className="text-sm text-gray-500">
          Please contact your administrator for access to this chat.
        </p>
      </div>
    </div>
  )
}
