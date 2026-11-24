// Landing copy that comes in lists. Numbers match the lessons in pyground-backend/content.
// shortcut: Indonesian only; moves into next-intl messages with #40 (bilingual routes).

export const facts = [
  { value: "61", label: "pelajaran interaktif" },
  { value: "15+ jam", label: "materi, dari nol sampai OOP" },
  { value: "3", label: "proyek nyata untuk portofolio" },
  { value: "ID · EN", label: "Bahasa Indonesia dan Inggris" },
];

export const steps = [
  {
    title: "Baca",
    body: "Penjelasan pendek dengan contoh sehari-hari: belanja di warung, bayar kos, hitung nilai rapor. Tanpa istilah yang bikin pusing.",
  },
  {
    title: "Coba",
    body: "Setiap contoh bisa kamu ubah dan jalankan di browser. Salah ketik? Lihat pesan error-nya dan perbaiki sendiri.",
  },
  {
    title: "Kuis",
    body: "Tiga pertanyaan di akhir pelajaran. Progres dan streak harianmu tersimpan, jadi kamu bisa lanjut kapan saja.",
  },
];

export type Stage = {
  number: number;
  title: string;
  meta: string;
  status: "free" | "paid" | "soon";
  modules: string[];
};

export const stages: Stage[] = [
  {
    number: 1,
    title: "Dasar-Dasar",
    meta: "14 pelajaran · sekitar 3 jam",
    status: "free",
    modules: [
      "Apa Itu Pemrograman",
      "Variabel dan Tipe Data",
      "Input dan Operator",
      "String",
      "Percabangan",
      "Proyek Mini: Kasir Warung",
    ],
  },
  {
    number: 2,
    title: "Inti Pemula",
    meta: "19 pelajaran · sekitar 5 jam",
    status: "paid",
    modules: ["Perulangan", "List dan Tuple", "Dictionary dan Set", "Fungsi", "Debugging", "Proyek: Buku Nilai Siswa"],
  },
  {
    number: 3,
    title: "Menengah",
    meta: "27 pelajaran · sekitar 8 jam",
    status: "paid",
    modules: [
      "Penanganan Error",
      "File, CSV, JSON",
      "Modul, pip, dan venv",
      "Comprehension",
      "OOP",
      "Decorator",
      "Generator",
      "Type Hint dan pytest",
      "Proyek: Pencatat Pengeluaran",
    ],
  },
  {
    number: 4,
    title: "Pengembangan Web dengan Flask",
    meta: "Pelajaran pertama sudah tersedia",
    status: "soon",
    modules: ["Bagaimana Web Bekerja", "Routing", "Template Jinja2", "Form", "Database", "Login", "REST API", "Deploy"],
  },
];

export const faqs = [
  {
    q: "Saya belum pernah coding sama sekali. Bisa ikut?",
    a: 'Bisa. Tahap 1 dimulai dari "apa itu program" dan memakai contoh sehari-hari. Kamu tidak perlu latar belakang matematika atau IT.',
  },
  {
    q: "Perlu install Python di komputer?",
    a: "Tidak. Python berjalan langsung di browser. Kamu baru perlu install Python di Tahap 3, saat belajar pip dan virtual environment, dan ada panduannya.",
  },
  {
    q: "Bisa belajar dari HP?",
    a: "Bisa. Semua halaman dirancang untuk layar HP. Untuk menulis kode yang panjang, laptop tetap lebih nyaman.",
  },
  {
    q: "Apakah akses diperpanjang otomatis?",
    a: "Tidak. Akses berlaku 30 hari sejak pembayaran. Kami mengirim email 3 hari sebelum dan di hari akses berakhir. Kalau kamu memperpanjang lebih awal, 30 hari ditambahkan ke sisa akses yang masih ada.",
  },
  {
    q: "Apa yang terjadi dengan progres saya kalau akses berakhir?",
    a: "Progresmu tetap tersimpan. Tahap 1 tetap bisa dibuka, dan pelajaran lain terbuka lagi begitu kamu memperpanjang.",
  },
  {
    q: "Ada versi bahasa Inggris?",
    a: "Ada. Semua pelajaran tersedia dalam Bahasa Indonesia dan Inggris, dan kamu bisa mengganti bahasa kapan saja.",
  },
];

// shortcut: price mirrors ACCESS_PASS_PRICE_IDR in the API's .env.example; read it from the API once #10 lands.
export const passPrice = 49000;
