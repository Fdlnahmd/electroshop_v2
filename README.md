# ⚡ Electroshop V2 — E-Commerce Komponen Elektronik

**Electroshop V2** adalah platform e-commerce modern yang dirancang khusus untuk penjualan komponen elektronik, mikrokontroler (seperti Arduino, ESP32), sensor, module IoT, dan berbagai alat pendukung elektronika lainnya. 

Project ini merupakan evolusi (V2) dari sistem PHP Monolith lama (V1), kini dibangun kembali dengan arsitektur **Decoupled (REST API & SPA)** yang memisahkan antara Backend (Laravel API) dan Frontend (React Single Page Application) menggunakan containerization **Docker Compose** agar siap di-scale secara mandiri.

---

## 🌟 Fitur Utama

Platform Electroshop V2 dilengkapi dengan berbagai fitur e-commerce end-to-end:

### 🛍️ Sisi Pembeli (Customer Portal)
*   **Katalog Komponen Dinamis**: Navigasi produk berdasarkan kategori (Mikrokontroler, Sensor, IC, Aktuator, Pasif, dll.) dengan fitur pencarian dan rating.
*   **Keranjang Belanja (Shopping Cart)**: Pengelolaan item belanja secara realtime dengan sinkronisasi ke server.
*   **Sistem Transaksi (Checkout)**: Proses checkout yang mulus terintegrasi dengan pencatatan transaksi detail.
*   **Riwayat Pesanan (Order History)**: Lacak status pembelian dari proses pembayaran hingga pengiriman.
*   **Ulasan & Rating (Review System)**: Memberikan penilaian bintang dan ulasan tekstual pada produk yang telah dibeli.
*   **Autentikasi User**: Registrasi, login, dan keamanan sesi berbasis API Token (Laravel Sanctum).

### 💼 Sisi Pengelola (Admin Dashboard)
*   **Manajemen Produk & Kategori**: CRUD produk (tambah gambar, harga, stok, deskripsi) dan kategori komponen.
*   **Laporan Penjualan (Sales Report)**: Dashboard ringkas untuk memantau pesanan masuk dan total omzet penjualan.
*   **Manajemen Ulasan**: Moderasi ulasan dan penilaian dari pembeli.

---

## 🛠️ Detail Teknologi & Stack

### 🐘 Backend API (Laravel)
*   **Framework**: Laravel 10 (PHP 8.2) sebagai headless RESTful API.
*   **Authentication**: Laravel Sanctum untuk autentikasi API token yang aman bagi SPA.
*   **Database**: MySQL 8.0 dengan implementasi Eloquent ORM, Seeders, dan Migrations terstruktur.
*   **Media Storage**: Local storage symlink untuk pengelolaan gambar produk secara dinamis.

### ⚛️ Frontend SPA (React)
*   **Framework & Build Tool**: React 18 dengan Vite (TypeScript) untuk build yang super cepat.
*   **State Management**: React Context API untuk menangani state global (Keranjang Belanja, Informasi User, Autentikasi).
*   **Routing**: React Router DOM untuk navigasi halaman SPA yang mulus tanpa refresh.
*   **Styling**: Modern Vanilla CSS yang bersih dan modular.
*   **API Client**: Axios dengan interceptors untuk komunikasi data ke Backend API.

### 🐳 DevOps & Deployment
*   **Docker Compose**: Orkestrasi multi-container lokal (backend, frontend, mysql, phpmyadmin, cloudflared).
*   **Cloudflare Tunnel**: Untuk mengekspos port local frontend secara aman ke internet untuk kebutuhan demo / staging.

---

## 📁 Struktur Folder

```text
electroshop/
├── backend/            # Source code Laravel API (Backend)
├── frontend/           # Source code React + Vite + TS (Frontend)
├── uploads/            # Direktori bersama untuk file upload (Shared Volume)
├── docker-compose.yml  # Konfigurasi container Docker
├── .env.example        # Contoh environment variables utama
└── README.md           # Dokumentasi ini
```

---

## 🚀 Panduan Setup & Instalasi Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan project di komputer lokal Anda menggunakan Docker:

### 1. Salin Environment File
Salin file `.env.example` di root directory menjadi `.env` dan sesuaikan nilainya (misalnya password database atau port):
```bash
cp .env.example .env
```

### 2. Nyalakan Container Docker
Bangun (*build*) dan nyalakan seluruh container di background:
```bash
docker compose up -d --build --remove-orphans
```

### 3. Setup Backend Laravel (Migrasi & Database)
Setelah container berjalan, lakukan setup awal Laravel di dalam container `electroshop_backend`:
```bash
# Generate APP_KEY
docker exec electroshop_backend php artisan key:generate

# Jalankan Migration & Seed Data Awal
docker exec electroshop_backend php artisan migrate:fresh --seed

# Buat Symlink Storage
docker exec electroshop_backend php artisan storage:link
```

### 4. Akses Aplikasi
Aplikasi sekarang berjalan dan dapat diakses melalui URL berikut:

*   **Frontend SPA**: [http://localhost:3000](http://localhost:3000)
*   **Backend API**: [http://localhost:8000](http://localhost:8000)
*   **PHPMyAdmin**: [http://localhost:8084](http://localhost:8084) (Username: `root`, Password sesuai `.env`)

---

## 📝 Catatan Penting
*   **Database Setup**: Untuk inisialisasi database, silakan gunakan file SQL dump lokal Anda. File `.sql` di-exclude dari Git repository demi keamanan data.
*   **Shared Uploads**: Folder `uploads` di root dipetakan langsung ke folder public upload Laravel (`public/uploads`) agar gambar produk/file yang di-upload dari admin panel dapat dibaca langsung oleh aplikasi.
