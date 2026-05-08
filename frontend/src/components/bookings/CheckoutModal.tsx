'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import type { Session } from '@/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || '')

interface Props {
  open: boolean
  onClose: () => void
  session: Session
  bookingId: number
  onPaid: () => void
}

export default function CheckoutModal({ open, onClose, session, bookingId, onPaid }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loadingIntent, setLoadingIntent] = useState(false)

  useEffect(() => {
    if (!open || !bookingId) return
    setLoadingIntent(true)
    api.post('/payments/create-intent/', { booking_id: bookingId })
      .then(({ data }) => setClientSecret(data.client_secret))
      .catch(() => toast.error('Failed to initialize payment.'))
      .finally(() => setLoadingIntent(false))
  }, [open, bookingId])

  return (
    <Modal open={open} onClose={onClose} title="Complete Payment">
      {loadingIntent || !clientSecret ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <CheckoutForm
            session={session}
            clientSecret={clientSecret}
            onPaid={onPaid}
            onClose={onClose}
          />
        </Elements>
      )}
    </Modal>
  )
}

function CheckoutForm({ session, onPaid, onClose }: {
  session: Session
  clientSecret: string
  onPaid: () => void
  onClose: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setPaying(true)
    setError('')

    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (result.error) {
      setError(result.error.message || 'Payment failed.')
      setPaying(false)
    } else if (result.paymentIntent?.status === 'succeeded') {
      toast.success('Payment successful! Booking confirmed.')
      onPaid()
      onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Order summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-500">Booking for</p>
        <p className="font-semibold text-gray-900">{session.title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">${Number(session.price).toFixed(2)}</p>
      </div>

      <PaymentElement />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={!stripe || paying} className="btn-primary flex-1">
          {paying ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" /> Processing...
            </span>
          ) : `Pay $${Number(session.price).toFixed(2)}`}
        </button>
      </div>
    </form>
  )
}
