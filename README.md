# PADUD Jaya Status Monitor

Aplikasi monitoring status sistem real-time untuk PADUD Jaya dengan antarmuka yang modern dan responsif.

## Fitur

- **Real-time Monitoring**: Server-Sent Events (SSE) untuk update status real-time
- **System Health**: Monitoring CPU, Memory, Disk, dan Network
- **Service Status**: Status individual untuk setiap layanan
- **Error Handling**: Halaman error yang informatif dan user-friendly
- **Responsive Design**: Antarmuka yang responsif untuk desktop dan mobile
- **Dark/Light Mode**: Toggle tema gelap dan terang

## Halaman Error

Aplikasi ini memiliki sistem error handling yang komprehensif dengan halaman error yang dirancang khusus:

### 1. ErrorPage Component (`/src/components/error-page.tsx`)

Komponen error page yang dapat digunakan di seluruh aplikasi dengan:

- Logo perusahaan PADUD Jaya
- Tipe error yang berbeda (connection, server, network, maintenance)
- Tombol retry dan kembali ke beranda
- Informasi kontak support
- Desain yang konsisten dengan tema aplikasi

### 2. Global Error Page (`/src/app/error.tsx`)

Halaman error global Next.js yang menangani error di seluruh aplikasi.

### 3. Not Found Page (`/src/app/not-found.tsx`)

Halaman 404 yang informatif dengan desain yang konsisten.

### 4. Loading Page (`/src/components/loading-page.tsx`)

Halaman loading yang menarik dengan animasi dan progress indicator.

## Tipe Error yang Didukung

1. **Connection Error**: Koneksi terputus atau tidak dapat terhubung ke server
2. **Server Error**: Masalah pada server backend
3. **Network Error**: Masalah jaringan atau koneksi internet
4. **Maintenance Error**: Sistem sedang dalam pemeliharaan

## Struktur File

```
src/
├── app/
│   ├── error.tsx              # Global error page
│   ├── not-found.tsx          # 404 page
│   └── api/
│       └── sse/
│           └── status/
│               └── route.ts   # SSE endpoint
├── components/
│   ├── error-page.tsx         # Error page component
│   ├── loading-page.tsx       # Loading page component
│   └── service-status-dashboard.tsx
└── public/
    └── logo.png               # Logo PADUD Jaya
```

## Penggunaan

### ErrorPage Component

```tsx
import { ErrorPage } from "@/components/error-page";

// Basic usage
<ErrorPage
  error="Connection failed"
  errorType="connection"
  onRetry={handleRetry}
/>

// With custom configuration
<ErrorPage
  error="Server maintenance in progress"
  errorType="maintenance"
  showBackToHome={true}
/>
```

### LoadingPage Component

```tsx
import { LoadingPage } from "@/components/loading-page";

// Basic usage
<LoadingPage message="Memuat data..." />

// With progress bar
<LoadingPage
  message="Memuat dashboard..."
  showProgress={true}
/>
```

## Styling

Semua halaman error menggunakan:

- Gradient background yang konsisten
- Logo perusahaan PADUD Jaya
- Color-coded error types
- Responsive design
- Dark/light mode support
- Consistent typography dan spacing

## Support Information

Setiap halaman error menampilkan informasi kontak support:

- Email: support@padudjaya.com
- Telp: +62 21 1234 5678

## Development

Untuk menjalankan aplikasi dalam mode development:

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`
