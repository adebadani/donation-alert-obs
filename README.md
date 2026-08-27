# donation-alert-obs

Backend minimal untuk sistem alert donasi (mirip Saweria): satu endpoint HTTP untuk menerima donasi, dan satu WebSocket untuk widget OBS.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

`STREAM_KEYS` di `.env` berisi daftar streamKey valid, format `key:owner`, dipisah koma.

## Endpoint donasi

```
POST /api/donations/:streamKey
Content-Type: application/json

{
  "donatorName": "Budi",
  "amount": 10000,
  "currency": "IDR",
  "message": "Semangat live-nya!"
}
```

Response `201`:

```json
{
  "donation": {
    "id": "...",
    "streamKey": "d63b2619a3d911e473393cff4bd24a80",
    "donatorName": "Budi",
    "amount": 10000,
    "currency": "IDR",
    "message": "Semangat live-nya!",
    "createdAt": "2026-08-27T..."
  },
  "deliveredTo": 1
}
```

`deliveredTo` = jumlah widget OBS yang sedang terkoneksi dan menerima event ini.

## WebSocket widget (Browser Source di OBS)

```
http://localhost:3000/widgets/alert?streamKey=d63b2619a3d911e473393cff4bd24a80
```

Tambahkan sebagai Browser Source di OBS (bungkus dengan halaman HTML yang connect ke URL ini, render animasi alert saat menerima pesan).

Pesan yang dikirim server saat ada donasi:

```json
{
  "type": "donation",
  "data": {
    "id": "...",
    "streamKey": "...",
    "donatorName": "Budi",
    "amount": 10000,
    "currency": "IDR",
    "message": "Semangat live-nya!",
    "createdAt": "2026-08-27T..."
  }
}
```

- Koneksi dengan `streamKey` yang tidak terdaftar akan ditolak (`401`) saat handshake.
- Server melakukan ping/pong setiap 30 detik untuk membersihkan koneksi mati.
