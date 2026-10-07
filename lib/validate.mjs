export const MACHINE_STATUS = ["Running", "Stop", "Alarm", "Maintenance"];
const blank = (v) => !v || !String(v).trim();
export function validateMachine(m, existingIds = []) {
  const e = {};
  if (blank(m.machine_id)) e.machine_id = "กรุณากรอก Machine ID";
  else if (!/^[A-Za-z0-9_-]{2,30}$/.test(m.machine_id.trim())) e.machine_id = "Machine ID ใช้ได้เฉพาะ A-Z 0-9 _ - (2-30 ตัว)";
  else if (existingIds.includes(m.machine_id.trim().toLowerCase())) e.machine_id = "Machine ID ซ้ำ";
  ["name", "type", "location"].forEach((k) => blank(m[k]) && (e[k] = "ห้ามว่าง"));
  if (!MACHINE_STATUS.includes(m.status)) e.status = "สถานะไม่ถูกต้อง";
  return e;
}
export function validateAlarm(a) {
  const e = {};
  if (blank(a.machine_id)) e.machine_id = "เลือกเครื่องจักร";
  if (blank(a.alarm_code)) e.alarm_code = "กรุณากรอก Alarm Code";
  else if (!/^[A-Za-z0-9_-]{1,20}$/.test(a.alarm_code.trim())) e.alarm_code = "รูปแบบ Alarm Code ไม่ถูกต้อง";
  if (blank(a.description)) e.description = "ห้ามว่าง";
  if (blank(a.occurred_at) || isNaN(Date.parse(a.occurred_at))) e.occurred_at = "วันเวลาไม่ถูกต้อง";
  return e;
}
export function validateMaintenance(r) {
  const e = {};
  if (blank(r.machine_id)) e.machine_id = "เลือกเครื่องจักร";
  if (blank(r.description)) e.description = "ห้ามว่าง";
  if (blank(r.performed_at) || isNaN(Date.parse(r.performed_at))) e.performed_at = "วันที่ไม่ถูกต้อง";
  return e;
}
