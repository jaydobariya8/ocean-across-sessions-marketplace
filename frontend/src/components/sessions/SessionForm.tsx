'use client'

import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import Modal from '@/components/ui/Modal'
import type { Session } from '@/types'

const CATEGORIES = ['coaching', 'tutoring', 'fitness', 'wellness', 'business', 'tech', 'music', 'art', 'other']

interface Props {
  open: boolean
  onClose: () => void
  session?: Session | null
  onSaved: (session: Session) => void
}

interface FormData {
  title: string
  description: string
  category: string
  price: string
  duration_minutes: string
  max_participants: string
  scheduled_at: string
  status: string
}

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso)
  return format(d, "yyyy-MM-dd'T'HH:mm")
}

export default function SessionForm({ open, onClose, session, onSaved }: Props) {
  const isEdit = !!session
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormData>({
    title: '', description: '', category: 'coaching',
    price: '', duration_minutes: '60', max_participants: '1',
    scheduled_at: '', status: 'draft',
  })

  useEffect(() => {
    if (session) {
      setForm({
        title: session.title,
        description: session.description,
        category: session.category,
        price: session.price,
        duration_minutes: String(session.duration_minutes),
        max_participants: String(session.max_participants),
        scheduled_at: toLocalDatetimeValue(session.scheduled_at),
        status: session.status,
      })
    } else {
      setForm({ title: '', description: '', category: 'coaching', price: '', duration_minutes: '60', max_participants: '1', scheduled_at: '', status: 'draft' })
    }
  }, [session, open])

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await api.post('/auth/upload/session-image/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm((f) => ({ ...f, image: data.image }))
      toast.success('Image uploaded.')
    } catch {
      toast.error('Image upload failed.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: form.price,
        duration_minutes: Number(form.duration_minutes),
        max_participants: Number(form.max_participants),
        scheduled_at: new Date(form.scheduled_at).toISOString(),
      }
      const { data } = isEdit
        ? await api.patch<Session>(`/sessions/${session!.id}/`, payload)
        : await api.post<Session>('/sessions/', payload)
      toast.success(isEdit ? 'Session updated.' : 'Session created.')
      onSaved(data)
      onClose()
    } catch (err: any) {
      const detail = err?.response?.data
      const msg = typeof detail === 'string' ? detail : Object.values(detail || {}).flat().join(' ') || 'Save failed.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Session' : 'Create Session'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input className="input" value={form.title} onChange={set('title')} required maxLength={200} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="input min-h-[100px] resize-none" value={form.description} onChange={set('description')} required rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input capitalize" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="input" value={form.status} onChange={set('status')}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input type="number" className="input" value={form.price} onChange={set('price')} required min="0" step="0.01" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
            <input type="number" className="input" value={form.duration_minutes} onChange={set('duration_minutes')} required min="15" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Spots</label>
            <input type="number" className="input" value={form.max_participants} onChange={set('max_participants')} required min="1" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Image</label>
          <div className="flex items-center gap-3">
            {form.image && (
              <img src={form.image} alt="" className="w-16 h-12 rounded-lg object-cover border border-gray-200" />
            )}
            <button type="button" onClick={() => imageInputRef.current?.click()}
              className="btn-secondary text-sm px-3 py-1.5">
              {uploadingImage ? 'Uploading...' : form.image ? 'Change Image' : 'Upload Image'}
            </button>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled At</label>
          <input type="datetime-local" className="input" value={form.scheduled_at} onChange={set('scheduled_at')} required />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Session'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
