

## 🎯 Website Layanan IMEI Unblock - Rencana Implementasi

### Ringkasan Proyek
Website layanan unblock IMEI dengan konsep mobile-first, wizard step-by-step, dan penyimpanan Local Storage yang siap di-migrate ke Supabase.

---

### 🏠 1. Halaman Beranda
**Hero Section**
- Headline: "Unblock IMEI Cepat, Aman & Transparan"
- Subheadline dan tombol CTA "Mulai Unblock Sekarang"
- Animasi halus untuk kesan profesional

**Keunggulan Layanan**
- 4 card fitur: Tanpa Login, Harga Transparan, Update via WhatsApp, Garansi Jelas
- Ikon minimalis dengan desain clean

**Alur Proses**
- Visual step 1-4 yang menjelaskan cara kerja layanan
- Desain timeline horizontal

---

### 📋 2. Layanan (Multi-Step Wizard)
**Progress Indicator**
- Bar progress dengan 4 step yang jelas
- Animasi transisi antar step

**Step 1 - Pilih Layanan**
- 3 jenis layanan: Basic, Priority, Express
- Setiap layanan menampilkan: harga, estimasi waktu, tingkat keberhasilan, garansi
- Card selection dengan highlight

**Step 2 - Input Data**
- Form input IMEI dengan validasi 15 digit
- Dropdown merek device (Apple, Samsung, Xiaomi, dll)
- Input tipe device
- Input nomor WhatsApp dengan validasi format +62
- Dropdown negara/operator (opsional)

**Step 3 - Konfirmasi Pesanan**
- Ringkasan lengkap: layanan, IMEI, device, harga, estimasi
- Nomor WhatsApp untuk notifikasi
- Checkbox persetujuan

**Step 4 - Pembayaran**
- 3 metode: Transfer Bank, E-Wallet, QRIS
- Tab untuk setiap metode dengan instruksi
- Nomor rekening/akun yang bisa di-copy
- Tombol "Konfirmasi Pembayaran"
- Setelah konfirmasi: Generate order ID, simpan ke Local Storage
- Modal sukses dengan tombol "Lacak Pesanan" dan "Kirim ke WhatsApp"

---

### 🔍 3. Lacak Pesanan
**Form Pencarian**
- Input nomor pesanan atau IMEI
- Tombol cari dengan icon

**Timeline Status Vertikal**
- Design timeline profesional dengan connector line
- 5 status: Pesanan Dibuat → Pembayaran Diterima → IMEI Dalam Proses → Berhasil Di-unblock → Selesai
- Timestamp lengkap: "12 Januari 2026 • 14:32:45 WIB"
- Status aktif dengan highlight biru
- Status belum tercapai dengan warna abu-abu

**Detail Pesanan**
- Card informasi pesanan (IMEI, device, layanan)
- Tombol "Kirim Update ke WhatsApp"

---

### 🎁 4. Referral
**Kode Referral**
- Generate kode unik otomatis
- Tombol copy dan share ke WhatsApp
- Cara kerja program referral

**Statistik**
- Card: Total Referral, Total Komisi (simulasi)
- Progress bar menuju target (gamifikasi)

**Riwayat Referral**
- Tabel daftar user yang menggunakan kode
- Tanggal dan status komisi

---

### 🔐 5. Admin Dashboard (/admin)
**Login Screen**
- Form sederhana dengan username & password hardcoded
- Session disimpan di Local Storage

**Dashboard Utama**
- 4 card statistik: Total Pesanan, Pesanan Aktif, Pesanan Selesai, Total Pendapatan
- Chart sederhana (optional)

**Manajemen Pesanan**
- Tabel dengan kolom: Order ID, IMEI, Device, Status, Tanggal
- Search dan filter status
- Modal detail pesanan
- Dropdown ubah status dengan auto-update timestamp
- Tombol "Kirim WhatsApp Notifikasi"

**Manajemen Layanan**
- Tabel layanan dengan CRUD
- Form tambah/edit: Nama, Harga, Estimasi, Garansi, Tingkat Keberhasilan
- Toggle aktif/nonaktif

**Manajemen Referral**
- Tabel semua kode referral
- Detail penggunaan per kode

---

### 💬 WhatsApp Integration (Simulasi)
**Template Pesan Otomatis**
- Pesan berisi: Nomor Pesanan, Status, Timestamp, Link Lacak
- Redirect ke wa.me dengan pesan pre-filled

---

### 🎨 Desain & Styling
**Warna**
- Primary: Biru Navy (#1e3a5f)
- Secondary: Biru Terang (#3b82f6)
- Background: Putih dengan abu-abu sangat muda
- Aksen: Hijau untuk sukses, Merah untuk error

**Typography**
- Font modern dan mudah dibaca
- Heading tebal dan jelas

**Komponen**
- Tombol dengan hover effect
- Card dengan shadow halus
- Animasi transisi antar halaman/step

---

### 📱 Responsivitas
- Mobile-first approach
- Breakpoint: Mobile (< 768px), Tablet (768-1024px), Desktop (> 1024px)
- Navigation: Bottom nav atau hamburger menu di mobile
- Form dan card full-width di mobile

---

### 💾 Struktur Data Local Storage
```
orders: [{ order_id, imei, brand, model, layanan, harga, whatsapp, status, timeline[], created_at }]
services: [{ service_id, nama, harga, estimasi, garansi, success_rate, active }]
referrals: [{ referral_code, total_user, total_komisi, history[] }]
admin_session: { logged_in, timestamp }
```

Data dirancang dengan struktur yang mudah di-migrate ke Supabase.

