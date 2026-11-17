import { useApp } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import { IconDownload } from "../components/Icons.jsx";

// ====== ISI DATA DIRIMU DI SINI ======
const DEVELOPER = {
  nama: "Nama Lengkap Kamu",
  nim: "NIM Kamu",
  kelompok: "Kelompok X",
  kelas: "Praktikum PPB",
};
// =====================================

const FEATURES = [
  "Jual beli barang baru dan preloved sesama mahasiswa",
  "Cari, filter, dan urutkan barang",
  "Simpan barang incaran ke favorit",
  "Hubungi penjual langsung lewat WhatsApp",
  "Bisa dipasang di HP dan tetap terbuka saat offline",
];

const TECH = ["React (JavaScript)", "React Router", "Progressive Web App", "Node.js + Express", "Neon PostgreSQL", "Vercel"];

export default function About() {
  const { canInstall, installed, install } = useApp();

  return (
    <div className="page">
      <Header title="Tentang Aplikasi" back />

      <section className="about-hero">
        <img src="/logo.svg" alt="" width="72" height="72" />
        <h2>KAMU</h2>
        <p>Marketplace Barang Baru &amp; Preloved Khusus Mahasiswa</p>
        <span className="version">Versi 1.0.0</span>
      </section>

      <section className="info-card">
        <h3>Tentang</h3>
        <p>
          KAMU mempertemukan mahasiswa yang ingin menjual dan membeli barang dengan harga bersahabat, mulai
          dari buku kuliah, perlengkapan kos, hingga gadget, dengan transaksi yang mudah di lingkungan kampus.
        </p>
      </section>

      <section className="info-card">
        <h3>Fitur</h3>
        <ul className="check-list">
          {FEATURES.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <section className="info-card">
        <h3>Pengembang</h3>
        <dl className="info-list">
          {Object.entries(DEVELOPER).map(([k, v]) => (
            <div key={k}>
              <dt>{k.charAt(0).toUpperCase() + k.slice(1)}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="info-card">
        <h3>Teknologi</h3>
        <div className="tech-chips">
          {TECH.map((t) => (
            <span key={t} className="chip static">
              {t}
            </span>
          ))}
        </div>
      </section>

      {installed ? (
        <p className="tip center">Aplikasi sudah terpasang di perangkatmu. ✅</p>
      ) : canInstall ? (
        <button className="btn btn-primary btn-block" onClick={install}>
          <IconDownload size={18} /> Pasang Aplikasi
        </button>
      ) : (
        <p className="tip center">
          Untuk memasang: buka menu browser lalu pilih “Tambahkan ke layar utama” / “Install app”.
        </p>
      )}
    </div>
  );
}
