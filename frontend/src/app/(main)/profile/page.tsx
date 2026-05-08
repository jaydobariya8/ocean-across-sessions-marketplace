'use client'

import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { api } from '@/lib/api'
import Spinner from '@/components/ui/Spinner'

export default function ProfilePage() {
  const { user, loading: authLoading } = useRequireAuth()
  const [saving, setSaving] = useState(false)
  const [switchingRole, setSwitchingRole] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [form, setForm] = useState({ first_name: '', last_name: '', bio: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) setAvatarUrl(user.avatar)
  }, [user])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const { data } = await api.post('/auth/upload/avatar/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAvatarUrl(data.avatar)
      toast.success('Avatar updated.')
    } catch {
      toast.error('Upload failed.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  useEffect(() => {
    if (user) {
      setForm({ first_name: user.first_name || '', last_name: user.last_name || '', bio: user.bio || '' })
    }
  }, [user])

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/auth/user/', form)
      toast.success('Profile updated.')
    } catch {
      toast.error('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleSwitchRole = async () => {
    if (!user) return
    const newRole = user.role === 'creator' ? 'user' : 'creator'
    const msg = newRole === 'creator'
      ? 'Switch to Creator? You can create and manage sessions.'
      : 'Switch back to User? You will lose Creator access.'
    if (!confirm(msg)) return
    setSwitchingRole(true)
    try {
      await api.post('/auth/switch-role/', { role: newRole })
      toast.success(`Switched to ${newRole} role. Please refresh.`)
      window.location.reload()
    } catch {
      toast.error('Role switch failed.')
    } finally {
      setSwitchingRole(false)
    }
  }

  if (authLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile</h1>

      {/* Avatar + identity */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-50" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold ring-4 ring-primary-50">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              {uploadingAvatar
                ? <Spinner size="sm" className="border-white" />
                : <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
              }
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-900">{user?.username}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user?.role === 'creator'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input className="input" value={form.first_name} onChange={set('first_name')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input className="input" value={form.last_name} onChange={set('last_name')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={form.bio}
              onChange={set('bio')}
              placeholder="Tell people about yourself..."
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Role switcher */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Account Role</h2>
        <p className="text-sm text-gray-500 mb-4">
          {user?.role === 'creator'
            ? 'You are a Creator. You can create and manage sessions.'
            : 'You are a User. Switch to Creator to host sessions.'}
        </p>
        <button
          onClick={handleSwitchRole}
          disabled={switchingRole}
          className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
            user?.role === 'creator'
              ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'border-primary-300 text-primary-700 bg-primary-50 hover:bg-primary-100'
          }`}
        >
          {switchingRole ? 'Switching...' : user?.role === 'creator' ? 'Switch to User' : 'Become a Creator'}
        </button>
      </div>

      {/* OAuth info */}
      {user?.oauth_provider && (
        <div className="card p-6 mt-6">
          <h2 className="font-semibold text-gray-900 mb-1">Connected Account</h2>
          <p className="text-sm text-gray-500 capitalize">
            Signed in via {user.oauth_provider}
          </p>
        </div>
      )}
    </div>
  )
}
