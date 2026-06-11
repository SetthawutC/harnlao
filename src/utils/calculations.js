/**
 * Utility functions for bill calculations.
 *
 * Pure functions — ไม่มี side effect, ไม่แตะ state, ทำงานกับ input ที่รับมาเท่านั้น
 * แยกออกมาเพื่อให้ test ง่าย และ reuse ได้จากหลาย component
 */

/**
 * คำนวณยอดเงินที่แต่ละคนต้องจ่าย โดยหารจากรายการทั้งหมดที่คนนั้นมีส่วนร่วม
 *
 * @param {string[]} people - รายชื่อคนทั้งหมดในบิล
 * @param {Array<{ price: number, sharedBy: string[] }>} items - รายการสินค้า
 *        - price: ราคารวมของรายการ
 *        - sharedBy: รายชื่อคนที่หารรายการนี้
 * @returns {Object<string, number>} key = ชื่อคน, value = ยอดเงินที่ต้องจ่าย
 *
 * @example
 * calculateTotals(['A', 'B'], [{ price: 100, sharedBy: ['A', 'B'] }])
 * // => { A: 50, B: 50 }
 */
export function calculateTotals(people, items) {
  // เริ่มต้นทุกคนมียอด 0 เพื่อให้แน่ใจว่าคนที่ไม่ได้หารอะไรเลยก็แสดงผลเป็น 0
  const totals = {};
  people.forEach((person) => {
    totals[person] = 0;
  });

  // วนลูปแต่ละรายการ หารราคาตามจำนวนคนที่ร่วมหาร
  items.forEach((item) => {
    const splitCount = item.sharedBy.length;
    if (splitCount > 0) {
      // หารราคาออกเท่าๆ กัน (ใช้การหารปกติ ไม่สนสตางค์เศษ — คงพฤติกรรมเดิม)
      const costPerPerson = item.price / splitCount;
      item.sharedBy.forEach((person) => {
        // เช็ค undefined เผื่อมีคนใน sharedBy ที่ถูกลบไปแล้วจาก people
        if (totals[person] !== undefined) {
          totals[person] += costPerPerson;
        }
      });
    }
  });

  return totals;
}

/**
 * รวมยอดเงินทั้งหมดจากทุกรายการในบิล
 *
 * @param {Array<{ price: number }>} items - รายการสินค้า
 * @returns {number} ยอดรวมทั้งหมด (บาท)
 *
 * @example
 * calculateGrandTotal([{ price: 100 }, { price: 250 }]) // => 350
 */
export function calculateGrandTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
