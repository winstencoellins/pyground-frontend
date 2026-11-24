// Landing copy that comes in lists. Numbers and titles match the lessons in pyground-backend/content.
// shortcut: Indonesian only; moves into next-intl messages with #40 (bilingual routes).

/** Hero ticker: real lesson topics, in course order. */
export const learnables = [
  "Membuat program kasir warung",
  "Menyimpan daftar belanja di list",
  "Menulis fungsi pertamamu",
  "Membaca pesan error tanpa panik",
  "Mengolah file CSV dan JSON",
  "Membuat class dengan OOP",
  "Menguji kode dengan pytest",
];

/** Topic strip under the hero. */
export const topics = ["Python 3", "Percabangan", "Fungsi", "OOP", "File & JSON", "pytest", "Flask"];

export const features = [
  {
    icon: "play",
    title: "Langsung jalan di browser",
    body: "Python berjalan di halaman pelajaran. Tidak perlu install apa pun untuk mulai.",
  },
  {
    icon: "languages",
    title: "Bahasa Indonesia",
    body: "Penjelasan dan contoh yang dekat: warung, kos, ojek, nilai rapor.",
  },
  {
    icon: "list-checks",
    title: "Kuis di setiap pelajaran",
    body: "Tiga pertanyaan singkat untuk memastikan kamu paham sebelum lanjut.",
  },
  {
    icon: "flame",
    title: "Progres dan streak",
    body: "Progresmu tersimpan, dan streak harian membantumu belajar rutin.",
  },
] as const;

export type Stage = {
  number: number;
  title: string;
  summary: string;
  meta: string;
  status: "free" | "paid" | "soon";
  shape: "sphere" | "ring" | "blocks" | "pyramid";
};

export const stages: Stage[] = [
  {
    number: 1,
    title: "Dasar-Dasar",
    summary: "Variabel, input, string, percabangan, dan proyek kasir warung.",
    meta: "14 pelajaran · ±3 jam",
    status: "free",
    shape: "sphere",
  },
  {
    number: 2,
    title: "Inti Pemula",
    summary: "Perulangan, list, dictionary, fungsi, dan debugging.",
    meta: "19 pelajaran · ±5 jam",
    status: "paid",
    shape: "ring",
  },
  {
    number: 3,
    title: "Menengah",
    summary: "File, OOP, decorator, generator, type hint, dan pytest.",
    meta: "27 pelajaran · ±8 jam",
    status: "paid",
    shape: "blocks",
  },
  {
    number: 4,
    title: "Web dengan Flask",
    summary: "Routing, template, form, database, login, dan deploy.",
    meta: "Pelajaran pertama sudah tersedia",
    status: "soon",
    shape: "pyramid",
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
