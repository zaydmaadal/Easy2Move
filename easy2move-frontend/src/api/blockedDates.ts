import type { BlockedDateDto } from '../types/blockedDate'
import { http } from './client'

const BASE = '/api/blocked-dates'

// Publiek: de boekingskalender moet geblokkeerde dagen kunnen tonen
export const getBlockedDates = () => http<BlockedDateDto[]>(BASE)

// Admin-only: een dag blokkeren of weer vrijgeven
export const createBlockedDate = (blockedDate: { datum: string; reden: string }) =>
  http<BlockedDateDto>(BASE, { method: 'POST', body: JSON.stringify(blockedDate) }, true)

// Admin-only: elke dag tussen van en tot in één keer blokkeren (bv. vakantie)
export const createBlockedDateRange = (range: { van: string; tot: string; reden: string }) =>
  http<BlockedDateDto[]>(`${BASE}/range`, { method: 'POST', body: JSON.stringify(range) }, true)

export const deleteBlockedDate = (id: number) =>
  http<void>(`${BASE}/${id}`, { method: 'DELETE' }, true)
