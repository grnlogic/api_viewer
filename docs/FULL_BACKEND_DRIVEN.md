# Remote Backends Configuration - Full Backend Driven

Untuk mengatasi masalah hardcode data backend, proyek ini menggunakan sistem konfigurasi yang sepenuhnya bergantung pada backend database.

## Arsitektur Full Backend-Driven

### ✅ **Tidak Ada Hardcode**

- Semua konfigurasi backend disimpan di database PostgreSQL
- Frontend membaca konfigurasi dari API backend
- Tidak ada fallback ke file konfigurasi lokal

### 🗄️ **Database Structure**

```sql
CREATE TABLE remote_backends (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    url VARCHAR(500) NOT NULL,
    health_endpoint VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🔌 **Backend API Endpoints**

#### Management Endpoints:

- `GET /api/remote-health/backends` - Get all enabled backends
- `POST /api/remote-health/backends` - Add new backend
- `PUT /api/remote-health/backends/{id}` - Update backend
- `DELETE /api/remote-health/backends/{id}` - Delete backend
- `POST /api/remote-health/backends/bulk` - Bulk add/update
- `POST /api/remote-health/backends/seed` - Initial seeding (empty DB only)

#### Health Check Endpoints:

- `GET /api/remote-health/status/all` - Get health status for all backends
- `GET /api/remote-health/status/{backendId}` - Get health for specific backend

### 📱 **Frontend Components**

#### 1. RemoteHealthMonitor (Updated)

- **File**: `src/components/remote-health-monitor-v2.tsx`
- **Function**: Monitor health status dari database
- **Features**:
  - Auto-refresh setiap 30 detik
  - Real-time status indicators
  - Error handling

#### 2. BackendManagement (New)

- **File**: `src/components/backend-management.tsx`
- **Function**: Admin interface untuk manage backends
- **Features**:
  - Add/Edit/Delete backends
  - Enable/Disable backends
  - Real-time database updates

#### 3. Backend API Helper

- **File**: `src/lib/backend-api.ts`
- **Function**: API calls ke backend tanpa hardcode
- **Features**:
  - Type-safe API calls
  - Error handling
  - Centralized configuration

## Cara Menggunakan Full Backend-Driven

### 1. **Database Setup**

```sql
-- Insert new backend
INSERT INTO remote_backends (name, url, health_endpoint, description, enabled)
VALUES ('New Service', 'https://api.example.com', '/health', 'Description', true);

-- Update existing backend
UPDATE remote_backends
SET url = 'https://new-url.com', enabled = true
WHERE name = 'Service Name';

-- Disable backend
UPDATE remote_backends SET enabled = false WHERE name = 'Service Name';
```

### 2. **Via API (Recommended)**

```javascript
// Add new backend
const newBackend = {
  name: "Payment Service",
  url: "https://payment-api.example.com",
  healthEndpoint: "/api/health",
  description: "Payment processing service",
  enabled: true,
};

await addRemoteBackend(newBackend);
```

### 3. **Current Database State**

```
 id |         name          | status |                                url
----+-----------------------+--------+-------------------------------------------------------------------
  1 | Rekap Penjualan       | UP     | https://rekap-penjualan-api.padudjayaputera.com/api/health/status
  2 | Laporan Harian        | UP     | https://laporan-harian.padudjayaputera.com/api/health/status
  4 | HRD-SISTEM MONITORING | UP     | https://sistem-hrd-padud.padudjayaputera.com/api/health
```

## Keuntungan Full Backend-Driven:

1. **✅ Zero Hardcode**: Tidak ada URL atau konfigurasi yang di-hardcode
2. **🔄 Dynamic Configuration**: Tambah/ubah backend tanpa redeploy
3. **🎯 Single Source of Truth**: Database sebagai satu-satunya sumber konfigurasi
4. **🔒 Centralized Management**: Admin dapat mengelola semua backend dari satu tempat
5. **📊 Real-time Updates**: Perubahan langsung terlihat di frontend
6. **🛡️ Better Security**: Konfigurasi tidak ter-expose di frontend code

## Files yang Updated:

### Backend (Java):

- ✅ `RemoteHealthController.java` - Remove hardcode, full database-driven
- ✅ `RemoteBackend.java` - Added constructor dengan enabled parameter

### Frontend (Next.js):

- ✅ `src/lib/backend-api.ts` - New API helper tanpa hardcode
- ✅ `src/components/remote-health-monitor-v2.tsx` - Clean version
- ✅ `src/components/backend-management.tsx` - Admin management interface
- ✅ `src/app/api/remote-health/init/route.ts` - Updated untuk database seeding

### Configuration:

- ✅ `.env` - Environment variables untuk backend URL
- ❌ `src/config/remote-backends.json` - Dihapus, tidak diperlukan lagi

## Migration dari Hardcode ke Database-Driven:

1. **Backup existing data** dari hardcode
2. **Insert ke database** menggunakan API atau SQL
3. **Update frontend** untuk menggunakan backend API
4. **Remove hardcode** dari semua files
5. **Test** semua functionality

Sekarang sistem Anda 100% backend-driven tanpa hardcode! 🚀
