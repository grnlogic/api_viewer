# Remote Backends Configuration

Untuk mengatasi masalah hardcode data backend, proyek ini menggunakan sistem konfigurasi yang fleksibel.

## Struktur Konfigurasi

### 1. File Konfigurasi JSON

- **Lokasi**: `src/config/remote-backends.json`
- **Fungsi**: Menyimpan konfigurasi default untuk semua remote backends
- **Format**:

```json
{
  "backends": [
    {
      "name": "Rekap Penjualan",
      "url": "https://rekap-penjualan-api.padudjayaputera.com",
      "healthEndpoint": "/api/health/status",
      "description": "Backend untuk sistem rekap penjualan",
      "enabled": true
    }
  ]
}
```

### 2. Environment Variables Override

- **File**: `.env`
- **Prefix**: `REMOTE_BACKEND_[NAMA]_URL`
- **Contoh**:
  - `REMOTE_BACKEND_REKAP_PENJUALAN_URL=https://new-url.com`
  - `REMOTE_BACKEND_LAPORAN_HARIAN_URL=https://new-url.com`

### 3. Helper Functions

- **File**: `src/lib/config.ts`
- **Functions**:
  - `getRemoteBackendsConfig()`: Mendapatkan semua konfigurasi
  - `getEnabledRemoteBackends()`: Mendapatkan backend yang aktif
  - `getRemoteBackendByName(name)`: Mendapatkan backend berdasarkan nama

## Cara Menggunakan

### Menambah Backend Baru:

1. Tambahkan ke `src/config/remote-backends.json`
2. (Opsional) Tambahkan environment variable override di `.env`

### Mengubah URL Backend:

1. **Permanen**: Edit di `src/config/remote-backends.json`
2. **Sementara/Environment**: Set di `.env` dengan format `REMOTE_BACKEND_[NAMA]_URL`

### Menonaktifkan Backend:

- Set `"enabled": false` di file JSON

## Keuntungan Solusi Ini:

1. **Centralized Configuration**: Semua konfigurasi di satu tempat
2. **Environment Override**: Bisa override per environment tanpa ubah code
3. **Easy Management**: Mudah tambah/hapus/edit backend
4. **Type Safety**: Menggunakan TypeScript interfaces
5. **Fallback Support**: Jika API gagal, pakai konfigurasi dari file

## Files yang Sudah Diupdate:

- ✅ `src/app/api/remote-health/init/route.ts`
- ✅ `src/components/remote-health-monitor.tsx`
- ✅ `src/lib/config.ts` (baru)
- ✅ `src/config/remote-backends.json` (baru)
- ✅ `.env` (updated)

## TODO untuk Backend Java:

Untuk backend Java, buat file `application.properties` atau `application.yml` dengan konfigurasi serupa untuk menghilangkan hardcode di `RemoteHealthController.java`.
