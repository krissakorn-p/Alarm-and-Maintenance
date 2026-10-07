# Alarm & Maintenance Management System
เว็บแอปจัดการเครื่องจักร, Alarm และงานซ่อมบำรุงในโรงงาน (วิชา Programming in Automation Systems)

**Vercel URL:** _(ใส่ URL หลัง deploy)_

## Functions
Login/Logout (Supabase Auth) · Role Admin/Technician (RLS) · Machine CRUD · Alarm Create/Read/Update · Maintenance Create/Read/Update · Search/Filter · Dashboard · Input Validation

## Tech
Next.js 14 · Tailwind CSS · Supabase · GitHub Actions (CI) · Vercel

## Database
`profiles(id→auth.users, full_name, role)` · `machines(machine_id unique, name, type, location, status)` ·
`alarms(machine_id→machines, alarm_code, description, cause, occurred_at, status)` ·
`maintenance_records(machine_id→machines, alarm_id→alarms, technician_id→profiles, description, performed_at, status)`
SQL ทั้งหมด + RLS อยู่ที่ `supabase/schema.sql`

## ติดตั้ง
1. สร้างโปรเจกต์ Supabase → SQL Editor รัน `supabase/schema.sql`
2. `cp .env.example .env.local` ใส่ URL และ **anon key** (ห้ามใส่ service role key ในแอป)
3. `npm install && npm run dev`
4. สมัครผู้ใช้ แล้วตั้ง Admin: `update profiles set role='admin' where id='<uuid>';`
5. Deploy: import repo ใน Vercel + ตั้ง Environment Variables 2 ตัวข้างต้น

## สิทธิ์ (บังคับด้วย RLS ที่ฐานข้อมูล)
Admin: จัดการทุกอย่าง · Technician: ดู Machine/Dashboard, เปลี่ยนสถานะ Alarm, บันทึก/แก้ไข Maintenance

## การใช้ AI
ใช้ Claude ช่วยวิเคราะห์ requirement, ออกแบบ schema/RLS, เขียนโค้ด UI และ validation, สร้าง unit test และ CI workflow — ผู้พัฒนาตรวจสอบและทดสอบเองทั้งหมด
