export type Role = 'user' | 'creator'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: Role
  avatar: string | null
  bio: string
}

export type SessionStatus = 'draft' | 'published' | 'cancelled'

export interface Session {
  id: number
  creator: Pick<User, 'id' | 'username' | 'first_name' | 'last_name' | 'avatar'>
  title: string
  description: string
  category: string
  price: string
  duration_minutes: number
  max_participants: number
  current_participants: number
  scheduled_at: string
  image: string | null
  status: SessionStatus
  created_at: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Booking {
  id: number
  session: Session
  user: Pick<User, 'id' | 'username' | 'email'>
  status: BookingStatus
  stripe_payment_id: string
  amount_paid: string
  booked_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
