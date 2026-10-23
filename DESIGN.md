# design.md: Aplikasi Pencatatan Keuangan untuk Anak Perantauan

> Dokumen ini adalah acuan utama untuk agent (Antigravity) dalam membangun desain dan fungsionalitas aplikasi. Baca seluruh dokumen sebelum menulis kode. Jika ada instruksi yang bertentangan, dokumen ini yang diprioritaskan.
>
> Nama aplikasi: `[NAMA_APLIKASI]` (placeholder; ganti sesuai nama final, misalnya Dompetku / Kasku / Celengin). Simpan sebagai satu konstanta di `src/config/app.ts` agar mudah diganti.

---

## 1. Ringkasan Produk

**Apa:** Aplikasi web pencatatan keuangan pribadi yang simpel, cepat, dan menenangkan.

**Untuk siapa:** Anak perantauan, yaitu mahasiswa rantau, pekerja baru, dan perantau yang hidup jauh dari keluarga. Mereka biasanya:
- Punya pemasukan tidak rutin atau berupa kiriman bulanan (orang tua, gaji, beasiswa, freelance).
- Punya pengeluaran tetap yang besar (kos/kontrakan, makan, transport, pulsa/paket data).
- Mengalami "tanggal tua", yaitu uang menipis sebelum kiriman/gajian berikutnya.
- Ingin menabung untuk pulang kampung/mudik dan sesekali mengirim uang ke rumah.
- Sering patungan atau pinjam-meminjam dengan teman kos/rekan kerja.

**Masalah utama yang diselesaikan:** "Uangku sisa berapa, dan cukup sampai kapan?"

**Nilai jual (value proposition):** Catat pengeluaran dalam kurang dari 5 detik, lalu langsung tahu batas aman belanja harian sampai kiriman/gajian berikutnya.

**Prinsip rasa (tone):** Ramah, suportif, tidak menghakimi. Bahasa Indonesia santai tapi sopan. Hindari nada menggurui atau menakut-nakuti.

---

## 2. Prinsip Desain

1. **Cepat di atas segalanya.** Aksi paling sering (catat pengeluaran) maksimal 3 ketukan dan 5 detik.
2. **Satu angka penting.** Dashboard menonjolkan satu angka utama: *Aman dipakai per hari*.
3. **Nyaman di mata.** Warna lembut, kontras cukup, ruang napas lega, tidak ramai.
4. **Mobile-first.** Mayoritas pengguna memakai HP dengan satu tangan. Desktop adalah versi yang diperluas, bukan sebaliknya.
5. **Ramah koneksi lemah.** Berfungsi offline (PWA); data tersinkron saat online.
6. **Tidak menghakimi.** Pengeluaran besar tidak ditandai merah menakutkan; gunakan peringatan yang halus dan bermanfaat.
7. **Privasi dulu.** Tidak ada iklan, tidak menjual data. Ada opsi sembunyikan saldo.
8. **Konsisten.** Gunakan design token dan komponen yang sama di seluruh halaman.

---

## 3. Fitur dan Prioritas

### MVP (wajib ada di rilis pertama)
| Kode | Fitur | Deskripsi singkat |
|------|-------|-------------------|
| F1 | **Catat cepat** | Tombol tambah mengambang, input nominal besar, pilih kategori dengan chip, simpan. |
| F2 | **Dompet/Akun** | Tunai, rekening bank, e-wallet. Saldo per dompet dan total. |
| F3 | **Siklus uang** | Pengguna mengatur tanggal kiriman/gajian. Aplikasi menghitung sisa hari dan batas aman harian. |
| F4 | **Kategori khas perantau** | Kos/Kontrakan, Makan, Transport, Pulsa & Data, Kirim ke Rumah, Dana Pulang Kampung, Kebutuhan Harian, Hiburan, Kesehatan, Lainnya. Bisa ditambah dan diedit. |
| F5 | **Riwayat transaksi** | Daftar dikelompokkan per hari, ada pencarian dan filter (kategori, dompet, rentang tanggal). |
| F6 | **Ringkasan bulanan** | Total masuk/keluar, grafik per kategori, perbandingan dengan bulan lalu. |
| F7 | **Anggaran per kategori** | Batas bulanan opsional dengan progress bar yang lembut. |
| F8 | **Mode gelap/terang** | Otomatis mengikuti sistem, bisa diubah manual. |
| F9 | **PWA + offline** | Bisa dipasang di layar utama, jalan tanpa internet. |
| F10 | **Ekspor data** | CSV untuk riwayat transaksi. |

### Tahap 2 (setelah MVP stabil)
| Kode | Fitur | Deskripsi singkat |
|------|-------|-------------------|
| F11 | **Tabungan tujuan** | Contoh: "Pulang Lebaran", "Beli laptop". Ada target, progress, dan estimasi tercapai. |
| F12 | **Tagihan & pengingat** | Kos, listrik/token, wifi, langganan. Pengingat H-3 dan H-1. |
| F13 | **Catatan utang-piutang** | Siapa pinjam ke siapa, nominal, status lunas. |
| F14 | **Patungan (split bill)** | Bagi tagihan ke beberapa teman, lacak siapa yang sudah bayar. |
| F15 | **Transaksi berulang** | Otomatis catat kos bulanan, uang kiriman, dan sebagainya. |
| F16 | **Mode "Tanggal Tua"** | Tampilan khusus saat sisa uang tipis, berisi tips hemat dan prioritas pengeluaran. |
| F17 | **Pindai struk** | Isi nominal dari foto struk (opsional). |

---

## 4. Konsep Inti: Siklus Uang dan "Aman per Hari"

Ini adalah fitur pembeda. Implementasikan dengan benar.

**Input pengguna:** tanggal kiriman/gajian berikutnya (bisa berulang bulanan, mingguan, atau tanggal tertentu).

**Perhitungan:**
```
sisa_hari      = selisih hari dari hari ini sampai tanggal kiriman berikutnya (minimal 1)
kewajiban      = total tagihan/anggaran wajib yang belum dibayar sebelum kiriman berikutnya
uang_bebas     = saldo_total_dompet_aktif - kewajiban
aman_per_hari  = max(0, floor(uang_bebas / sisa_hari))
```

**Status visual (jangan hanya warna; sertakan ikon dan teks):**
| Kondisi | Label | Nada pesan |
|---------|-------|------------|
| Pengeluaran hari ini ≤ 80% aman_per_hari | "Aman" | "Masih lega hari ini." |
| 80%–100% | "Hati-hati" | "Hampir mencapai batas harian." |
| > 100% | "Lewat batas" | "Hari ini agak boros. Besok bisa diseimbangkan." |
| uang_bebas ≤ 0 | "Tanggal tua" | "Fokus ke kebutuhan pokok dulu ya." |

---

## 5. Design Tokens

### 5.1 Warna

Gunakan CSS variables. Semua pasangan teks/latar harus memenuhi kontras WCAG AA (minimal 4.5:1 untuk teks biasa).

**Mode terang**
| Token | Nilai | Kegunaan |
|-------|-------|----------|
| `--bg` | `#F7F6F2` | Latar halaman (krem lembut, tidak menyilaukan) |
| `--surface` | `#FFFFFF` | Kartu, sheet, modal |
| `--surface-2` | `#EFEDE6` | Latar sekunder, input |
| `--border` | `#E2DFD5` | Garis pembatas |
| `--text` | `#1F2A27` | Teks utama |
| `--text-muted` | `#5C6B66` | Teks sekunder |
| `--primary` | `#0F766E` | Aksi utama (teal) |
| `--primary-soft` | `#D8EFEB` | Latar aksen lembut |
| `--accent` | `#F2A93B` | Sorotan hangat (tujuan, pencapaian) |
| `--income` | `#15803D` | Pemasukan |
| `--expense` | `#C2413C` | Pengeluaran (merah bata, tidak mencolok) |
| `--warning` | `#B45309` | Peringatan |
| `--info` | `#2563EB` | Informasi |

**Mode gelap**
| Token | Nilai |
|-------|-------|
| `--bg` | `#0F1715` |
| `--surface` | `#17211E` |
| `--surface-2` | `#1E2B27` |
| `--border` | `#2A3A35` |
| `--text` | `#E8EFEC` |
| `--text-muted` | `#9DB0A9` |
| `--primary` | `#2DB7A8` |
| `--primary-soft` | `#12332F` |
| `--accent` | `#F5B85C` |
| `--income` | `#4ADE80` |
| `--expense` | `#F28B82` |

> Hindari hitam murni (#000) dan putih murni sebagai latar penuh. Jangan gunakan merah terang untuk pengeluaran biasa.

### 5.2 Tipografi
- **Font utama:** `Plus Jakarta Sans` (fallback: `Inter`, `system-ui`, `sans-serif`).
- **Angka/nominal:** aktifkan `font-variant-numeric: tabular-nums` agar angka sejajar.

| Peran | Ukuran | Berat | Tinggi baris |
|-------|--------|-------|--------------|
| Angka hero (aman/hari) | 40px | 700 | 1.1 |
| H1 | 28px | 700 | 1.2 |
| H2 | 22px | 600 | 1.3 |
| H3 | 18px | 600 | 1.35 |
| Body | 16px | 400 | 1.5 |
| Caption | 13px | 500 | 1.4 |

Ukuran teks isi minimal 16px di mobile agar nyaman dan mencegah zoom otomatis di iOS.

### 5.3 Spasi, Radius, Bayangan
- **Skala spasi (basis 4px):** 4, 8, 12, 16, 24, 32, 48.
- **Radius:** kartu 16px, tombol 12px, chip 999px, input 12px.
- **Bayangan:** tipis dan lembut, contoh `0 1px 2px rgba(0,0,0,.05), 0 4px 12px rgba(0,0,0,.04)`. Pada mode gelap, andalkan border, bukan bayangan.
- **Target sentuh:** minimal 44x44px.

### 5.4 Gerak (Motion)
- Durasi 150–250ms, easing `ease-out`.
- Hormati `prefers-reduced-motion`: matikan animasi non-esensial.
- Animasi hanya untuk memberi umpan balik (simpan berhasil, progress bar), bukan dekorasi.

---

## 6. Layout dan Navigasi

### Mobile (utama)
- **Bottom navigation** dengan 4 tab dan 1 tombol aksi tengah:
  1. Beranda
  2. Riwayat
  3. **[+] Catat** (tombol tengah menonjol)
  4. Anggaran
  5. Lainnya (tujuan, tagihan, utang, pengaturan)
- Konten berada di dalam lebar maksimal 480px dan terpusat pada layar besar.
- Zona jempol: aksi penting diletakkan di bagian bawah layar.

### Desktop (≥1024px)
- Sidebar kiri berisi navigasi, konten utama di tengah (maks. 960px), panel ringkasan opsional di kanan.
- Tombol "Catat" tetap tersedia dengan pintasan keyboard `N`.

### Breakpoint
`sm 640px`, `md 768px`, `lg 1024px`, `xl 1280px`.

---

## 7. Spesifikasi Halaman

### 7.1 Beranda (Dashboard)
Urutan dari atas ke bawah:
1. **Sapaan singkat** + tombol sembunyikan saldo (ikon mata).
2. **Kartu hero "Aman dipakai hari ini"**: angka besar, status (Aman/Hati-hati/Lewat batas), teks "X hari lagi sampai kiriman".
3. **Progress hari ini**: terpakai vs batas harian.
4. **Total saldo** dan ringkasan dompet (geser horizontal).
5. **Pemasukan vs pengeluaran bulan ini** (dua angka kecil).
6. **Pengingat terdekat** (tagihan kos, dan sebagainya), maksimal 2 item.
7. **Transaksi terbaru** (5 item) dengan tautan "Lihat semua".

Empty state: ilustrasi sederhana dan ajakan "Catat pengeluaran pertamamu".

### 7.2 Catat Cepat (bottom sheet)
- Muncul dari bawah, fokus otomatis ke nominal.
- **Nominal:** input angka besar dengan keypad numerik (`inputmode="numeric"`), format Rupiah otomatis (`Rp 25.000`).
- **Pintasan nominal:** chip +5rb, +10rb, +20rb, +50rb.
- **Tipe:** Pengeluaran (default) | Pemasukan | Transfer antar dompet.
- **Kategori:** chip dengan ikon; tampilkan 6 kategori paling sering dipakai lebih dulu.
- **Dompet:** default ke dompet terakhir dipakai.
- **Tanggal:** default hari ini; ketuk untuk mengubah.
- **Catatan:** opsional, satu baris.
- Tombol **Simpan** besar di bawah. Setelah simpan: toast "Tersimpan", sheet menutup, dan ada opsi "Urungkan" selama 5 detik.
- Mode **"Simpan & tambah lagi"** untuk mencatat beberapa transaksi berturut-turut.

### 7.3 Riwayat
- Dikelompokkan per tanggal dengan subtotal harian.
- Pencarian teks, filter kategori/dompet/tipe/tanggal.
- Geser untuk edit/hapus (atau menu titik tiga di desktop). Hapus selalu bisa diurungkan.
- Scroll tak terbatas atau paginasi 30 item.

### 7.4 Anggaran
- Daftar kategori dengan progress bar (hijau teal → kuning → bata, dengan label teks persentase).
- Ringkasan: total anggaran, terpakai, sisa.
- Edit anggaran lewat bottom sheet.

### 7.5 Ringkasan/Laporan
- Pemilih bulan.
- Donut chart pengeluaran per kategori + daftar peringkat.
- Grafik batang pemasukan vs pengeluaran 6 bulan terakhir.
- Satu kalimat insight yang netral, contoh: "Pengeluaran makan naik 12% dibanding bulan lalu."

### 7.6 Tujuan Tabungan (Tahap 2)
- Kartu per tujuan: nama, target, terkumpul, progress, estimasi tercapai.
- Template cepat: "Pulang Lebaran", "Dana Darurat", "Beli Gadget".
- Setoran dicatat sebagai transfer dari dompet ke tujuan.

### 7.7 Tagihan, Utang-Piutang, Patungan (Tahap 2)
- **Tagihan:** daftar dengan tanggal jatuh tempo, tombol "Tandai sudah bayar" yang otomatis membuat transaksi.
- **Utang-piutang:** dua tab (Aku berutang / Mereka berutang), pelunasan sebagian diperbolehkan.
- **Patungan:** input total, pilih teman, bagi rata atau kustom, lacak status bayar, dan bisa menyalin pesan penagihan ke WhatsApp.

### 7.8 Pengaturan
Profil singkat, siklus uang (tanggal kiriman), kategori, dompet, tema, sembunyikan saldo, kunci PIN (opsional), ekspor/impor data, hapus semua data.

### 7.9 Onboarding (maksimal 4 langkah, bisa dilewati)
1. Sambutan singkat + pilih peran (mahasiswa/pekerja/lainnya) untuk template kategori.
2. Tambah dompet pertama dan saldo awal.
3. Atur tanggal kiriman/gajian dan perkiraan jumlah.
4. Selesai dan langsung ke Beranda.

---

## 8. Komponen UI (Design System)

Bangun komponen yang dapat dipakai ulang dan simpan di `src/components/ui/`:

- `Button` (primary, secondary, ghost, danger; ukuran sm/md/lg; status loading)
- `IconButton`
- `Input`, `CurrencyInput`, `DatePicker`, `Select`, `Textarea`
- `Chip` / `CategoryChip`
- `Card` (varian: default, hero, interactive)
- `BottomSheet` / `Modal`
- `ProgressBar` (dengan label teks)
- `Toast` (dengan aksi Urungkan)
- `Tabs`, `BottomNav`, `Sidebar`
- `TransactionItem`
- `EmptyState`
- `Skeleton` (placeholder loading)
- `Badge` (status)
- `Switch`

**Aturan komponen:**
- Semua komponen mendukung mode gelap lewat token, tanpa warna hardcode.
- Setiap komponen interaktif punya status: default, hover, focus-visible, active, disabled, loading.
- Fokus keyboard harus jelas (outline 2px `--primary`, offset 2px).

---

## 9. Mikrokopi dan Bahasa

- Bahasa Indonesia sehari-hari, hindari istilah keuangan yang rumit.
- Format mata uang: `Rp 1.250.000` (titik sebagai pemisah ribuan, tanpa desimal untuk tampilan umum). Gunakan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`.
- Format tanggal: `21 Okt 2026` dan relatif ("Hari ini", "Kemarin").
- Zona waktu: ikuti perangkat; sediakan penanda WIB/WITA/WIT bila perlu.

**Contoh teks:**
| Situasi | Teks |
|---------|------|
| Simpan berhasil | "Tersimpan. Semangat atur uangnya!" |
| Hapus | "Transaksi dihapus. Urungkan?" |
| Saldo tipis | "Sisa uang mulai tipis. Yuk prioritaskan kebutuhan pokok." |
| Empty riwayat | "Belum ada catatan. Mulai dari yang kecil dulu, yuk." |
| Melewati anggaran | "Anggaran Makan sudah terpakai 100%. Tidak apa-apa, tinjau lagi besok." |
| Error jaringan | "Lagi offline. Tenang, datamu disimpan dan disinkronkan nanti." |

Hindari: kata menyalahkan ("boros!", "gagal"), tanda seru berlebihan, dan emoji berlebihan (maksimal satu per pesan, hanya jika memperkuat makna).

---

## 10. Aksesibilitas

- Kontras minimal WCAG AA.
- Jangan mengandalkan warna saja: sertakan ikon dan teks untuk status.
- Semua kontrol dapat dioperasikan dengan keyboard; urutan tab logis.
- Label dan `aria-*` yang tepat; `aria-live="polite"` untuk toast.
- Dukung pembesaran teks hingga 200% tanpa kehilangan fungsi.
- Hormati `prefers-reduced-motion` dan `prefers-color-scheme`.
- Gambar dekoratif diberi `alt=""`.

---

## 11. Performa dan Offline

- **Target:** LCP < 2,5 dtk pada jaringan 4G sedang; bundle awal < 200 KB gzip jika memungkinkan.
- **PWA:** manifest, ikon, service worker (cache aset + strategi stale-while-revalidate).
- **Offline-first:** simpan data ke IndexedDB, antrean sinkronisasi saat online kembali, dan penyelesaian konflik "perubahan terbaru menang".
- Gunakan lazy-loading untuk halaman laporan dan grafik.
- Gunakan skeleton, bukan spinner layar penuh.

---

## 12. Rekomendasi Tech Stack

Boleh disesuaikan oleh agent jika ada alasan kuat; jelaskan perubahan di `README.md`.

| Lapisan | Pilihan |
|---------|---------|
| Framework | React + Vite + TypeScript (atau Next.js bila butuh SSR/auth) |
| Styling | Tailwind CSS dengan token di atas dipetakan ke CSS variables |
| Komponen dasar | shadcn/ui atau Radix UI (aksesibel secara default) |
| State | Zustand atau TanStack Query |
| Penyimpanan lokal | IndexedDB lewat Dexie |
| Backend (opsional) | Supabase atau Firebase (auth + sinkronisasi) |
| Grafik | Recharts |
| Validasi | Zod |
| Pengujian | Vitest + Testing Library, Playwright untuk alur utama |
| Ikon | Lucide |

---

## 13. Model Data (acuan)

```ts
type Wallet = {
  id: string;
  name: string;            // "Tunai", "BCA", "GoPay"
  type: 'cash' | 'bank' | 'ewallet';
  balance: number;         // simpan dalam rupiah bulat (integer)
  archived: boolean;
};

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  kind: 'expense' | 'income';
  monthlyBudget?: number;
};

type Transaction = {
  id: string;
  type: 'expense' | 'income' | 'transfer';
  amount: number;          // integer, rupiah
  categoryId?: string;
  walletId: string;
  toWalletId?: string;     // untuk transfer
  date: string;            // ISO 8601
  note?: string;
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;      // soft delete agar bisa diurungkan
};

type Cycle = {
  id: string;
  nextPayday: string;      // ISO date
  frequency: 'monthly' | 'weekly' | 'custom';
  expectedAmount?: number;
};
```

**Aturan data:** simpan nominal sebagai integer (hindari float), gunakan soft delete, dan semua tanggal dalam ISO 8601.

---

## 14. Struktur Proyek yang Disarankan

```
src/
  app/            # routing dan layout
  components/
    ui/           # komponen dasar design system
    features/     # komponen khusus fitur (quick-add, budget, dst.)
  features/
    transactions/
    wallets/
    budgets/
    cycle/
    reports/
  lib/            # util: format rupiah, tanggal, perhitungan aman-per-hari
  db/             # skema Dexie dan sinkronisasi
  styles/         # tokens.css, global.css
  config/         # app.ts (nama aplikasi, konstanta)
  tests/
public/           # manifest, ikon PWA
```

---

## 15. Rencana Kerja untuk Agent

Kerjakan berurutan dan lakukan verifikasi di setiap tahap.

1. **Fondasi:** inisialisasi proyek, atur Tailwind, token warna/tipografi, mode gelap, layout dasar (bottom nav + sidebar).
2. **Design system:** bangun komponen UI dasar dan halaman galeri komponen (`/dev/components`) untuk pengecekan visual.
3. **Data layer:** skema IndexedDB, repository untuk dompet/kategori/transaksi, dan util perhitungan siklus uang (disertai unit test).
4. **Catat Cepat + Riwayat:** alur utama end-to-end.
5. **Beranda:** kartu hero "Aman per hari", ringkasan dompet, transaksi terbaru.
6. **Anggaran + Laporan.**
7. **Onboarding + Pengaturan + Ekspor CSV.**
8. **PWA + offline + pengujian aksesibilitas dan performa.**
9. **Tahap 2** sesuai prioritas di bagian 3.

---

## 16. Kriteria Penerimaan (Definition of Done)

- [ ] Mencatat pengeluaran dapat dilakukan dalam ≤ 3 ketukan dan ≤ 5 detik.
- [ ] Angka "Aman per hari" benar sesuai rumus di bagian 4 (ada unit test untuk kasus tepi: sisa hari = 0, saldo negatif, kiriman hari ini).
- [ ] Tampilan nyaman di layar 360px hingga desktop, tanpa scroll horizontal yang tidak disengaja.
- [ ] Mode gelap dan terang konsisten; tidak ada warna hardcode di luar token.
- [ ] Skor Lighthouse: Performance ≥ 90, Accessibility ≥ 95, PWA lolos.
- [ ] Berfungsi offline untuk catat, lihat riwayat, dan lihat beranda.
- [ ] Semua teks antarmuka berbahasa Indonesia dan format Rupiah benar.
- [ ] Tidak ada aksi destruktif tanpa opsi urungkan atau konfirmasi.
- [ ] Alur utama diuji otomatis (catat → muncul di riwayat → saldo dan "aman per hari" berubah).

---

## 17. Hal yang Dihindari

- Desain yang ramai, penuh gradasi mencolok, atau terlalu banyak warna.
- Pop-up atau iklan yang mengganggu.
- Wajib login/daftar sebelum bisa mencoba (utamakan mode lokal dulu).
- Formulir panjang untuk pencatatan harian.
- Bahasa yang menggurui atau membuat pengguna merasa bersalah.
- Menyimpan nominal sebagai float atau menghitung uang dengan bilangan desimal.

---

## 18. Catatan untuk Agent

- Jika ada keputusan desain yang belum tercakup di sini, pilih opsi paling sederhana yang sejalan dengan Prinsip Desain (bagian 2), lalu catat keputusannya di `DECISIONS.md`.
- Jangan menambah fitur di luar daftar tanpa konfirmasi.
- Setiap selesai satu tahap, jalankan lint, pengujian, dan periksa tampilan di lebar 360px dan 1280px sebelum lanjut.
- Gunakan data contoh yang realistis (harga makan, ongkos ojek, dan kos sesuai konteks Indonesia) agar tampilan mudah dinilai.