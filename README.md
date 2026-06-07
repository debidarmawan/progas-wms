# Progas WMS — Frontend

Web admin dashboard untuk **Warehouse Management System Gas Industri**, dibangun dengan [Next.js](https://nextjs.org) 16 dan terhubung ke backend Go.

## Prasyarat

- Node.js 20+
- Backend API berjalan (default: `http://localhost:3131`)
- Swagger: [http://localhost:3131/swagger/index.html](http://localhost:3131/swagger/index.html)

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — akan diarahkan ke login atau dashboard.

### Environment

| Variable | Default |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3131/api/v1` |

## Modul yang sudah terintegrasi

- **Auth** — login, logout (JWT di cookie)
- **Master Items** — list, tambah
- **Tabung** — list, registrasi
- **Pelanggan** — list, tambah, edit (kuota & outstanding)
- **Produksi** — QC pre-fill, filling batch (list, submit, detail)
- **Inbound** — terima tabung kosong

Modul menunggu API backend: Surat Jalan, pertukaran tabung, work order, dashboard analitik, audit log.

## Struktur

```
app/
  login/              # Halaman masuk
  dashboard/          # Area terproteksi + modul WMS
components/           # UI & layout
lib/
  api/                # Client & service per domain
  auth/               # Session cookie
  types/              # TypeScript DTO dari Swagger
middleware.ts         # Proteksi route /dashboard
```

## Scripts

```bash
npm run dev      # Development
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
``` 
