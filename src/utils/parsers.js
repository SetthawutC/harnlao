/**
 * Utility functions สำหรับแปลง/parse ข้อมูล input
 *
 * Pure functions — ไม่มี side effect
 */

/**
 * แปลง string ชื่อคน (คั่นด้วย space) เป็น array ของชื่อใหม่ที่:
 * - ตัด space หน้า-หลังออก
 * - ตัดชื่อว่างทิ้ง
 * - ตัดชื่อที่ซ้ำกับคนที่มีอยู่แล้วออก
 *
 * @param {string} input - ข้อความ input เช่น "สมชาย สมหญิง  สมศักดิ์"
 * @param {string[]} existingPeople - รายชื่อคนที่มีอยู่แล้ว (ใช้เช็ค duplicate)
 * @returns {string[]} array ของชื่อใหม่ที่ผ่านการกรองแล้ว
 *
 * @example
 * parseNames("สมชาย สมหญิง", ["สมชาย"])
 * // => ["สมหญิง"]  (สมชาย ถูกตัดออกเพราะซ้ำ)
 */
export function parseNames(input, existingPeople = []) {
  // split ด้วย space → trim แต่ละชื่อ → ตัดชื่อว่าง → ตัดชื่อที่มีอยู่แล้ว
  return input
    .split(' ')
    .map((name) => name.trim())
    .filter((name) => name !== '' && !existingPeople.includes(name));
}
