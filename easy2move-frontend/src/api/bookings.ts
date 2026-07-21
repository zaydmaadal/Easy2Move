import type { BookingDto, NewBooking } from '../types/booking'
import { http } from './client'

export { ApiError, controleerAdminKey, getAdminKey, setAdminKey, wisAdminKey } from './client'

const BASE = '/api/bookings'

// Publiek: geen sleutel nodig
export const createBooking = (booking: NewBooking) =>
  http<BookingDto>(BASE, { method: 'POST', body: JSON.stringify(booking) })

// Admin-only: sturen de X-Admin-Key header mee
export const getBookings = () => http<BookingDto[]>(BASE, undefined, true)

export const getBooking = (id: number) => http<BookingDto>(`${BASE}/${id}`, undefined, true)

export const updateBooking = (id: number, booking: BookingDto) =>
  http<BookingDto>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(booking) }, true)

// Admin-only: voor telefonische boekingen. Hier mag de status wel meteen
// ingesteld worden (bv. rechtstreeks "Bevestigd").
export const createBookingAlsAdmin = (booking: Omit<BookingDto, 'id' | 'aangemaaktOp'>) =>
  http<BookingDto>(`${BASE}/admin`, { method: 'POST', body: JSON.stringify(booking) }, true)

export const deleteBooking = (id: number) =>
  http<void>(`${BASE}/${id}`, { method: 'DELETE' }, true)

// Publiek: welke tijdsloten zijn al bezet op deze datum (yyyy-mm-dd)?
export const getBezetteTijdsloten = (datum: string) =>
  http<string[]>(`${BASE}/bezet?datum=${datum}`)
