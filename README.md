# BidHouse API

BidHouse adalah backend API untuk platform lelang barang. Proyek ini menggunakan Node.js (ESM), Express, Prisma (PostgreSQL), dan Zod untuk validasi, serta Swagger untuk dokumentasi API.

## Fitur Utama

- Autentikasi pengguna (register, verifikasi email, login)
- Manajemen item/lelang
- Upload file (multer)
- Token JWT untuk otorisasi
- Dokumentasi API (Swagger UI)

## Teknologi

- Node.js 24 (ES Modules)
- Express 5
- Prisma 7 + @prisma/client
- PostgreSQL
- Zod (validasi)
- bcrypt (hash password)
- jsonwebtoken (JWT)
- nodemailer (email verifikasi)
- multer (upload)
- Swagger UI (docs)

## Struktur Proyek

```
.
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ src/
│  ├─ server.js
│  ├─ controllers/
│  ├─ middlewares/
│  ├─ routes/
│  ├─ utils/
│  └─ docs/swagger.js
├─ prisma.config.ts
├─ vercel.json
├─ package.json
└─ README.md
```

## Persyaratan

- Node.js v24.x (disarankan) atau kompatibel ESM
- PostgreSQL instance yang dapat diakses
- Environment variables (.env)

## Konfigurasi Environment (.env)

Buat file `.env` di root proyek dengan variabel:

```
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>?schema=public
JWT_SECRET=your_jwt_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_email_password
SMTP_FROM="BidHouse <no-reply@bidhouse.local>"
APP_BASE_URL=http://localhost:3000
```

Sesuaikan `DATABASE_URL` dan konfigurasi SMTP.

## Instalasi & Setup

1. Install dependencies
   - npm install
2. Generate Prisma Client dari schema
   - npx prisma generate
3. Jalankan migrasi database (opsional jika belum)
   - npx prisma migrate dev --name init_bidhouse

Jika sudah ada folder `prisma/migrations`, perintah migrate akan menerapkan migrasi yang ada.

## Menjalankan Secara Lokal

- Development: npm run dev
- Production (local): npm start

Server akan berjalan di `http://localhost:3000`. Dokumentasi API tersedia di `http://localhost:3000/api-docs`.

## Dokumentasi API (Swagger)

Swagger UI disajikan di `/api-docs`. Sumber dokumen berada di `src/docs/swagger.js`. Anda dapat menambah/memperbarui definisi endpoint di sana.

## Endpoints Utama

- Auth
  - POST /api/auth/register — registrasi + kirim email verifikasi
  - GET /api/auth/verify-email?token=... — verifikasi email
  - POST /api/auth/login — login dan mendapatkan JWT
- Items
  - GET/POST /api/items — daftar atau membuat item
  - Detail lainnya tergantung implementasi di `item.controller.js` dan `item.route.js`

## Prisma & Database

- Skema: `prisma/schema.prisma`
- Client: diinisialisasi via `new PrismaClient()`
- Studio (GUI): npx prisma studio
- Reset dev database (hati-hati): npx prisma migrate reset

## Scripts

- npm run dev — jalankan server dengan nodemon
- npm start — jalankan server Node

## Deployment

- Vercel: konfigurasi dasar pada `vercel.json` (sesuaikan runtime/variabel env)
- Pastikan variabel environment disetel di platform deployment (DATABASE*URL, JWT_SECRET, SMTP*\*)

## Troubleshooting

- Error: "The requested module '@prisma/client' does not provide an export named 'PrismaClient'"
  - Gunakan default import ESM:
    - import prismaPkg from "@prisma/client";
    - const { PrismaClient } = prismaPkg;
  - Lalu jalankan: npx prisma generate
- Jika Prisma Client belum dibuat
  - Jalankan: npx prisma generate
- Perubahan schema tidak ter-update
  - Jalankan: npx prisma migrate dev --name <deskripsi>
- Koneksi DB gagal
  - Periksa `DATABASE_URL`, kredensial, firewall, dan akses network
- SMTP gagal mengirim email
  - Periksa host, port, user/pass, dan izin dari provider

## Catatan Keamanan

- Jangan commit file `.env`
- Simpan `JWT_SECRET` dan kredensial DB di secret manager pada environment produksi

## Lisensi

ISC (default di package.json). Sesuaikan jika diperlukan.
