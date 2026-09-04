/**
 * storage.js — helpers สำหรับจัดการข้อมูลใน localStorage
 *
 * Keys ที่ใช้:
 *  - harnlao_session : session ปัจจุบัน (people, items, billName, qrCode)
 *  - harnlao_history : ประวัติบิลที่บันทึกไว้ (array)
 *
 * ห่อด้วย try/catch ทั้งหมด เผื่อ browser บล็อก localStorage (Private Mode บางเวอร์ชัน)
 */

const SESSION_KEY = 'harnlao_session';
const HISTORY_KEY = 'harnlao_history';

// ============================================================
// === Session (บิลปัจจุบัน) ===
// ============================================================

/**
 * โหลด session จาก localStorage
 * @returns {{ billName, people, items, qrCode } | null}
 */
export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * บันทึก session ลง localStorage
 * @param {{ billName: string, people: string[], items: Array, qrCode: string|null }} session
 */
export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // silently fail (เช่น storage เต็ม)
  }
}

/** ลบ session ออกจาก localStorage (ใช้ตอนเริ่มบิลใหม่) */
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // silently fail
  }
}

// ============================================================
// === History (ประวัติบิล) ===
// ============================================================

/**
 * โหลดประวัติบิลทั้งหมดจาก localStorage
 * @returns {Array<{ id, billName, date, people, items, grandTotal }>}
 */
export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * บันทึกประวัติบิลทั้งหมดลง localStorage
 * @param {Array} history
 */
export function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // silently fail (storage อาจเต็ม)
  }
}
