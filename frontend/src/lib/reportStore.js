const KEY = 'ww_my_reports'
const MAX_SAVED = 10

/** Reads the resident's recently-submitted tracking codes from this browser. */
export function getSavedReports() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Remembers a tracking code locally so the resident can find it again later on this device. */
export function saveReport({ tracking_code, address }) {
  try {
    const existing = getSavedReports().filter((r) => r.tracking_code !== tracking_code)
    const updated = [{ tracking_code, address, savedAt: new Date().toISOString() }, ...existing].slice(0, MAX_SAVED)
    localStorage.setItem(KEY, JSON.stringify(updated))
  } catch {
    // localStorage unavailable (e.g. private browsing) - safe to ignore, email is the fallback
  }
}
