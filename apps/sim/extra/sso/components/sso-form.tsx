'use client'

import { useEffect, useReducer } from 'react'
import { createLogger } from '@sim/logger'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { client } from '@/lib/auth/auth-client'
import { env, isFalsy } from '@/lib/core/config/env'
import { cn } from '@/lib/core/utils/cn'
import { quickValidateEmail } from '@/lib/messaging/email/validation'
import { inter } from '@/app/_styles/fonts/inter/inter'
import { soehne } from '@/app/_styles/fonts/soehne/soehne'
import { useBrandedButtonClass } from '@/hooks/use-branded-button-class'

const logger = createLogger('SSOForm')

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

interface FormState {
  email: string
  emailErrors: string[]
  showEmailValidationError: boolean
  isLoading: boolean
  callbackUrl: string
}

type FormAction =
  | { type: 'SET_EMAIL'; email: string; errors: string[] }
  | { type: 'SET_ERRORS'; errors: string[]; show: boolean }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_CALLBACK_URL'; url: string }
  | { type: 'SET_EMAIL_PARAM'; email: string }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.email, emailErrors: action.errors, showEmailValidationError: false }
    case 'SET_ERRORS':
      return { ...state, emailErrors: action.errors, showEmailValidationError: action.show }
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }
    case 'SET_CALLBACK_URL':
      return { ...state, callbackUrl: action.url }
    case 'SET_EMAIL_PARAM':
      return { ...state, email: action.email }
    default:
      return state
  }
}

const INITIAL_FORM_STATE: FormState = {
  email: '',
  emailErrors: [],
  showEmailValidationError: false,
  isLoading: false,
  callbackUrl: '/workspace',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateEmail(value: string): string[] {
  if (!value?.trim()) return ['Email is required.']
  const result = quickValidateEmail(value.trim().toLowerCase())
  return result.isValid ? [] : [result.reason || 'Please enter a valid email address.']
}

function isSafeCallbackUrl(url: string): boolean {
  if (url.startsWith('/')) return true
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return url.startsWith(origin)
  } catch (error) {
    logger.error('Error validating callback URL:', { error, url })
    return false
  }
}

const SSO_ERROR_MESSAGES: Record<string, string> = {
  account_not_found:
    'No account found. Please contact your administrator to set up SSO access.',
  sso_failed: 'SSO authentication failed. Please try again.',
  invalid_provider: 'SSO provider not configured correctly.',
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FieldErrorsProps {
  errors: string[]
  visible: boolean
}

function FieldErrors({ errors, visible }: FieldErrorsProps) {
  if (!visible || errors.length === 0) return null
  return (
    <div className='mt-1 space-y-1 text-red-400 text-xs'>
      {errors.map((msg, i) => (
        <p key={i}>{msg}</p>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers for SSO sign-in error messages
// ---------------------------------------------------------------------------

function resolveSSOErrorMessage(code: string, message: string): string {
  const haystack = `${code} ${message}`.toLowerCase()

  if (haystack.includes('no_provider_found')) {
    return 'No SSO provider is configured for this email domain. Please contact your administrator.'
  }
  if (haystack.includes('invalid_email_domain')) {
    return 'Email domain not configured for SSO. Please contact your administrator.'
  }
  if (haystack.includes('sso_disabled')) {
    return 'SSO authentication is disabled. Please use another sign-in method.'
  }
  return message || 'SSO sign-in failed. Please try again.'
}

function resolveNetworkErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'SSO sign-in failed. Please try again.'

  const msg = err.message
  if (msg.includes('NO_PROVIDER_FOUND')) {
    return 'No SSO provider is configured for this email domain. Please contact your administrator.'
  }
  if (msg.includes('INVALID_EMAIL_DOMAIN')) {
    return 'Email domain not configured for SSO. Please contact your administrator.'
  }
  if (msg.includes('network')) return 'Network error. Please check your connection and try again.'
  if (msg.includes('rate limit')) return 'Too many requests. Please wait a moment before trying again.'
  if (msg.includes('SSO_DISABLED')) return 'SSO authentication is disabled. Please use another sign-in method.'
  return msg
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SSOForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, dispatch] = useReducer(formReducer, INITIAL_FORM_STATE)
  const buttonClass = useBrandedButtonClass()

  useEffect(() => {
    if (!searchParams) return

    const callback = searchParams.get('callbackUrl')
    if (callback) {
      if (isSafeCallbackUrl(callback)) {
        dispatch({ type: 'SET_CALLBACK_URL', url: callback })
      } else {
        logger.warn('Invalid callback URL detected and blocked:', { url: callback })
      }
    }

    const emailParam = searchParams.get('email')
    if (emailParam) dispatch({ type: 'SET_EMAIL_PARAM', email: emailParam })

    const error = searchParams.get('error')
    if (error) {
      const msg = SSO_ERROR_MESSAGES[error] ?? 'SSO authentication failed. Please try again.'
      dispatch({ type: 'SET_ERRORS', errors: [msg], show: true })
    }
  }, [searchParams])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_EMAIL', email: e.target.value, errors: validateEmail(e.target.value) })
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    dispatch({ type: 'SET_LOADING', loading: true })

    const emailValue = (new FormData(e.currentTarget).get('email') as string).trim().toLowerCase()
    const errors = validateEmail(emailValue)
    dispatch({ type: 'SET_ERRORS', errors, show: errors.length > 0 })

    if (errors.length > 0) {
      dispatch({ type: 'SET_LOADING', loading: false })
      return
    }

    try {
      const safeCallback = isSafeCallbackUrl(state.callbackUrl) ? state.callbackUrl : '/workspace'

      const result = await client.signIn.sso({
        email: emailValue,
        callbackURL: safeCallback,
        errorCallbackURL: `/sso?error=sso_failed&callbackUrl=${encodeURIComponent(safeCallback)}`,
      })

      if (result?.error) {
        const msg = resolveSSOErrorMessage(result.error.code ?? '', result.error.message ?? '')
        logger.error('SSO sign-in failed', { code: result.error.code, message: result.error.message, email: emailValue })
        dispatch({ type: 'SET_ERRORS', errors: [msg], show: true })
        dispatch({ type: 'SET_LOADING', loading: false })
      }
    } catch (err) {
      logger.error('SSO sign-in failed', { error: err, email: emailValue })
      dispatch({ type: 'SET_ERRORS', errors: [resolveNetworkErrorMessage(err)], show: true })
      dispatch({ type: 'SET_LOADING', loading: false })
    }
  }

  const { email, emailErrors, showEmailValidationError, isLoading, callbackUrl } = state

  return (
    <>
      <div className='space-y-1 text-center'>
        <h1 className={`${soehne.className} font-medium text-[32px] text-black tracking-tight`}>
          Sign in with SSO
        </h1>
        <p className={`${inter.className} font-[380] text-[16px] text-muted-foreground`}>
          Enter your work email to continue
        </p>
      </div>

      <form onSubmit={onSubmit} className={`${inter.className} mt-8 space-y-8`}>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='email'>Work email</Label>
            </div>
            <Input
              id='email'
              name='email'
              placeholder='Enter your work email'
              required
              autoCapitalize='none'
              autoComplete='email'
              autoCorrect='off'
              autoFocus
              value={email}
              onChange={handleEmailChange}
              className={cn(
                'rounded-[10px] shadow-sm transition-colors focus:border-gray-400 focus:ring-2 focus:ring-gray-100',
                showEmailValidationError &&
                  emailErrors.length > 0 &&
                  'border-red-500 focus:border-red-500 focus:ring-red-100 focus-visible:ring-red-500'
              )}
            />
            <FieldErrors errors={emailErrors} visible={showEmailValidationError} />
          </div>
        </div>

        <Button
          type='submit'
          className={`${buttonClass} flex w-full items-center justify-center gap-2 rounded-[10px] border font-medium text-[15px] text-white transition-all duration-200`}
          disabled={isLoading}
        >
          {isLoading ? 'Redirecting to SSO provider...' : 'Continue with SSO'}
        </Button>
      </form>

      {!isFalsy(env.NEXT_PUBLIC_EMAIL_PASSWORD_SIGNUP_ENABLED) && (
        <>
          <div className={`${inter.className} relative my-6 font-light`}>
            <div className='absolute inset-0 flex items-center'>
              <div className='auth-divider w-full border-t' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='bg-white px-4 font-[340] text-muted-foreground'>Or</span>
            </div>
          </div>

          <div className={`${inter.className} space-y-3`}>
            <Link
              href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            >
              <Button
                variant='outline'
                className='w-full rounded-[10px] shadow-sm hover:bg-gray-50'
                type='button'
              >
                Sign in with email
              </Button>
            </Link>
          </div>
        </>
      )}

      {!isFalsy(env.NEXT_PUBLIC_EMAIL_PASSWORD_SIGNUP_ENABLED) && (
        <div className={`${inter.className} pt-6 text-center font-light text-[14px]`}>
          <span className='font-normal'>Don&apos;t have an account? </span>
          <Link
            href={`/signup${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className='font-medium text-[var(--brand-accent-hex)] underline-offset-4 transition hover:text-[var(--brand-accent-hover-hex)] hover:underline'
          >
            Sign up
          </Link>
        </div>
      )}

      <div
        className={`${inter.className} auth-text-muted absolute right-0 bottom-0 left-0 px-8 pb-8 text-center font-[340] text-[13px] leading-relaxed sm:px-8 md:px-[44px]`}
      >
        By signing in, you agree to our{' '}
        <Link
          href='/terms'
          target='_blank'
          rel='noopener noreferrer'
          className='auth-link underline-offset-4 transition hover:underline'
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href='/privacy'
          target='_blank'
          rel='noopener noreferrer'
          className='auth-link underline-offset-4 transition hover:underline'
        >
          Privacy Policy
        </Link>
      </div>
    </>
  )
}
