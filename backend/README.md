# Backend

API ค้นหาหอพักด้วย Express และ PostgreSQL บน Neon

## เริ่มใช้งาน

1. สร้างฐานข้อมูล PostgreSQL บน Neon
2. ใน PowerShell จากโฟลเดอร์ `backend` สร้างไฟล์ `.env` ถ้ายังไม่มี แล้วเปิดแก้ไข:

   ```powershell
   if (!(Test-Path .env)) { Copy-Item .env.example .env }
   notepad .env
   ```

   ใส่ connection string ของ Neon หลัง `DATABASE_URL=` (เลือก **Pooled connection** หรือ **Direct connection** จากหน้า Neon ก็ได้), เพิ่ม `JWT_SECRET=` ตามด้วย secret สุ่มอย่างน้อย 32 ตัวอักษร และตั้ง `ADMIN_EMAILS=` เป็นอีเมลผู้ดูแลที่คั่นด้วยเครื่องหมายจุลภาค (ผู้ดูแลต้องสมัครหรือมีบัญชีในระบบด้วยอีเมลดังกล่าว) ถ้ามี `.env` อยู่แล้ว อย่าลบค่าเดิม ให้เพิ่มบรรทัด `JWT_SECRET` และ `ADMIN_EMAILS` เข้าไป สร้าง secret ได้ด้วยคำสั่ง:

   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
   JWT_SECRET=replace_with_a_random_secret_at_least_32_characters
   ADMIN_EMAILS=admin@example.com
   ```

   สร้าง secret ด้วย PowerShell:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   ใช้ค่าจริงจาก Neon ทั้งบรรทัด อย่าใส่เครื่องหมาย `< >` และอย่าแชร์ไฟล์ `.env` เพราะมีรหัสผ่านฐานข้อมูลและ secret สำหรับลงนาม token
3. ติดตั้งและเริ่ม backend:

   ```powershell
   cd backend
   npm.cmd install
   npm.cmd run dev
   ```

บน Windows PowerShell ให้ใช้ `npm.cmd` แทน `npm` หากพบข้อความว่าไม่อนุญาตให้รัน `npm.ps1` วิธีนี้ไม่ต้องเปลี่ยน Execution Policy

หากขึ้น `DATABASE_URL is required` แปลว่ายังไม่มีไฟล์ `.env` ในโฟลเดอร์ `backend` หรือยังไม่ได้กำหนด `DATABASE_URL` ให้ตรวจสองจุดนี้ แล้วหยุดเซิร์ฟเวอร์ด้วย `Ctrl+C` และรัน `npm.cmd run dev` ใหม่

หากขึ้น `JWT_SECRET must be set` ให้เพิ่ม `JWT_SECRET=<secret ที่สุ่มได้>` ลงใน `backend/.env` แล้วหยุดและเริ่ม backend ใหม่

กำหนด role ผู้ดูแลผ่าน `ADMIN_EMAILS` เท่านั้น ไม่รับ role จากข้อมูลสมัครสมาชิกหรือจาก browser การเปลี่ยนรายชื่อใน `.env` มีผลเมื่อเริ่ม backend ใหม่ และจะปรับ role ของบัญชีเดิมตามรายชื่อที่กำหนด

เมื่อเริ่มทำงาน ระบบจะสร้างตาราง `listings` และ `users` ให้อัตโนมัติ และเพิ่มคอลัมน์ role, เจ้าของประกาศ, สถานะ และรายละเอียด หากจำเป็น ประกาศเก่าจะคงอยู่และถือว่าเผยแพร่แล้ว ส่วนประกาศที่ค้างในสถานะ `pending_review` จากระบบเดิมจะถูกเปลี่ยนเป็น `published` ระบบลบเฉพาะประกาศตัวอย่างชุดเดิมที่เคยเพิ่มไว้

## API

- `GET /api/health` ตรวจสอบสถานะ API และฐานข้อมูล
- `POST /api/auth/register` สมัครด้วย `{ "email": "...", "password": "..." }`
- `POST /api/auth/login` เข้าสู่ระบบด้วย `{ "email": "...", "password": "..." }`
- `GET /api/auth/me` ตรวจสอบ session ปัจจุบัน
- `POST /api/auth/logout` ออกจากระบบและลบ cookie
- `POST /api/listings` บันทึกฉบับร่างหรือเผยแพร่ประกาศทันที (ต้องเข้าสู่ระบบ) โดยส่งข้อมูลฟอร์มพร้อม `status: "draft"` หรือ `status: "published"`; รูปภาพรองรับ JPG, PNG และ WebP ไม่เกิน 5 รูป รูปละ 2 MB และรวมไม่เกิน 6 MB
- `PUT /api/listings/:id` แก้ไขประกาศของเจ้าของ ฉบับร่างบันทึกต่อหรือเผยแพร่ได้ ส่วนประกาศที่เผยแพร่หรือปิดแล้วจะแสดงข้อมูลที่แก้ไขทันที
- `GET /api/admin/listings` ดูประกาศทุกสถานะและทุกเจ้าของที่ยังไม่อยู่ในถังขยะ (ผู้ดูแลเท่านั้น)
- `PUT /api/admin/listings/:id` แก้ไขประกาศใดก็ได้ในระบบและบันทึกเป็นฉบับร่างหรือเผยแพร่ทันที (ผู้ดูแลเท่านั้น)
- `DELETE /api/admin/listings/:id` ย้ายประกาศเข้าถังขยะ (ผู้ดูแลเท่านั้น)
- `GET /api/admin/listings/trash` ดูประกาศที่ถูกลบและเวลาลบถาวร
- `PATCH /api/admin/listings/:id/restore` กู้คืนประกาศจากถังขยะภายใน 15 วัน
- `DELETE /api/admin/listings/:id/permanent` ลบประกาศในถังขยะถาวรทันที
- `GET /api/my-listings` ดูประกาศและสถานะของบัญชีที่เข้าสู่ระบบ
- `PATCH /api/listings/:id/status` ปิดประกาศที่เผยแพร่แล้ว หรือเผยแพร่ประกาศที่ปิดอยู่
- `GET /api/listings` แสดงเฉพาะประกาศที่เผยแพร่แล้ว พร้อมอีเมลบัญชีเจ้าของประกาศใน `owner_email`
- `GET /api/listings?search=ลุมพินี` ค้นหาจากชื่อโครงการหรือชื่อที่พักเท่านั้น
- รองรับตัวกรอง `maxPrice`, `transit=true|false` และ `pets=true|false`

ตัวอย่าง: `/api/listings?search=อารีย์&transit=true&maxPrice=5000`

ผู้ดูแลที่ระบุใน `ADMIN_EMAILS` จะเห็นรายการประกาศและถังขยะในเมนูด้านข้างของแดชบอร์ด และแก้ไขประกาศของทุกบัญชีได้ การลบจะย้ายประกาศไปถังขยะและยังไม่แสดงต่อสาธารณะหรือผู้โพสต์ ประกาศจะถูกลบถาวรเมื่อครบ 15 วัน โดย backend ลบรายการหมดอายุเมื่อเริ่มระบบและตรวจซ้ำทุกนาที; ผู้ดูแลกู้คืนหรือลบถาวรก่อนกำหนดได้ การตรวจ role ทำที่ backend ทุกคำขอ ส่วนผู้ใช้ทั่วไปจะได้รับ `403` เมื่อเรียก API ของผู้ดูแล ประกาศที่ส่งจากฟอร์มจะเผยแพร่ทันทีและแสดงในการค้นหาสาธารณะ หากมีข้อมูล `pending_review` จากระบบเดิม จะย้ายเป็น `published` เมื่อเริ่มระบบ ส่วนเจ้าของแก้ไขประกาศของตนได้จากหัวข้อ “ประกาศของฉัน”; ประกาศที่แก้ไขจะเผยแพร่ข้อมูลล่าสุดทันที ประกาศสาธารณะแสดงอีเมลบัญชีผู้โพสต์ใน `owner_email` และหน้าเว็บ รูปภาพของประกาศเก็บไว้ในข้อมูล JSONB ของฐานข้อมูลตามข้อจำกัดขนาดข้างต้น

รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ระบบเก็บเฉพาะ password hash และใช้ JWT อายุ 1 ชั่วโมงใน HttpOnly cookie ประกาศทุกชิ้นผูกกับบัญชีเจ้าของ

การตั้งค่า `FRONTEND_ORIGIN` ใช้กำหนด origin ของ frontend ที่อนุญาตให้เรียก API ส่วน `VITE_API_URL` ของ frontend ใช้ระบุ URL ของ backend เมื่อต้องการเปลี่ยนจาก `http://localhost:3000`
