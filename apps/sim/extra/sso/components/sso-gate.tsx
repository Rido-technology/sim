'use client'

import { type KeyboardEvent, useCallback, useState } from 'react'
import { createLogger } from '@sim/logger'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/emcn'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/core/utils/cn'
import { quickValidateEmail } from '@/lib/messaging/email/validation'
import { inter } from '@/app/_styles/fonts/inter/inter'
import { soehne } from '@/app/_styles/fonts/soehne/soehne'
import AuthBackground from '@/app/(auth)/components/auth-background'
import { BrandedButton } from '@/app/(auth)/components/branded-button'
import { SupportFooter } from '@/app/(auth)/components/support-footer'
import Nav from '@/app/(landing)/components/nav/nav'

const logger = createLogger('SSOAuth')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEmailErrors(value: string): string[] {
  if (!value?.trim()) return ['Email is required.']
  const result = quickValidateEmail(value.trim().toLowerCase())
  return result.isValid ? [] : [result.reason || 'Please enter a valid email address.']
}

// ---------------------------------------------------------------------------
// useSSOAuth hook â€“ encapsulates the authentication flow logic
// ---------------------------------------------------------------------------

interface UseSSOAuthOptions {
  identifier: string
  router: ReturnType<typeof useRouter>
}

interface SSOAuthState {
  email: string
  emailErrors: string[]
  showEmailValidationError: boolean
  isLoading: boolean
}

function useSSOAuth({ identifier, router }: UseSSOAuthOptions) {
  const [authState, setAuthState] = useState<SSOAuthState>({
    email: '',
    emailErrors: [],
    showEmailValidationError: false,
    isLoading: false,
  })

  const setEmail = useCallback((value: string) => {
    setAuthState((prev) => ({ ...prev, email: value, showEmailValidationError: false, emailErrors: [] }))
  }, [])

  const setErrors = useCallback((errors: string[]) => {
    setAuthState((prev) => ({ ...prev, emailErrors: errors, showEmailValidationError: errors.length > 0, isLoading: false }))
  }, [])

  const authenticate = useCallback(async () => {
    const { email } = authState
    const errors = getEmailErrors(email)

    if (errors.length > 0) {
      setErrors(errors)
      return
    }

    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      const res = await fetch(`/api/chat/${identifier}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ email, checkSSOAccess: true }),
      })

      if (!res.ok) {
        const data = await res.json()
        setErrors([(data as { error?: string }).error || 'Email not authorized for this chat'])
        return
      }

      router.push(
        `/sso?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(`/chat/${identifier}`)}`
      )
    } catch (error) {
      logger.error('SSO authentication error:', error)
      setErrors(['An error occurred during authentication'])
    }
  }, [authState, identifier, router, setErrors])

  return { authState, setEmail, authenticate }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SSOAuthProps {
  identifier: string
}

export default function SSOAuth({ identifier }: SSOAuthProps) {
  const router = useRouter()
  const { authState, setEmail, authenticate } = useSSOAuth({ identifier, router })
  const { email, emailErrors, showEmailValidationError, isLoading } = authState

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      authenticate()
    }
  }

  return (
    <AuthBackground>
      <main className='relative flex min-h-screen flex-col text-foreground'>
        <Nav hideAuthButtons={true} variant='auth' />
        <div className='relative z-30 flex flex-1 items-center justify-center px-4 pb-24'>
          <div className='w-full max-w-lg px-4'>
            <div className='flex flex-col items-center justify-center'>
              <div className='space-y-1 text-center'>
                <h1
                  className={`${soehne.className} font-medium text-[32px] text-black tracking-tight`}
                >
                  SSO Authentication
                </h1>
                <p className={`${inter.className} font-[380] text-[16px] text-muted-foreground`}>
                  This chat requires SSO authentication
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  authenticate()
                }}
                className={`${inter.className} mt-8 w-full max-w-[410px] space-y-6`}
              >
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='email'>Work Email</Label>
                  </div>
                  <Input
                    id='email'
                    name='email'
                    required
                    type='email'
                    autoCapitalize='none'
                    autoComplete='email'
                    autoCorrect='off'
                    placeholder='Enter your work email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      'rounded-[10px] shadow-sm transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100',
                      showEmailValidationError &&
                        emailErrors.length > 0 &&
                        'border-red-500 focus:border-red-500 focus:ring-red-100 focus-visible:ring-red-500'
                    )}
                    autoFocus
                  />
                  {showEmailValidationError && emailErrors.length > 0 && (
                    <div className='mt-1 space-y-1 text-red-400 text-xs'>
                      {emailErrors.map((error, index) => (
                        <p key={index}>{error}</p>
                      ))}
                    </div>
                  )}
                </div>

                <BrandedButton type='submit' loading={isLoading} loadingText='Redirecting to SSO'>
                  Continue with SSO
                </BrandedButton>
              </form>
            </div>
          </div>
        </div>
        <SupportFooter position='absolute' />
      </main>
    </AuthBackground>
  )
}
