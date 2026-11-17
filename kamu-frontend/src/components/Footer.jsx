import { Link } from "react-router-dom";

// Footer hanya tampil di layar lebar (desktop). Di HP sudah ada BottomNav.
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <img src="/logo.svg" width="40" height="40" alt="" />
          <div>
            <strong>KAMU</strong>
            <p>Marketplace barang baru dan preloved khusus mahasiswa.</p>
          </div>
        </div>
        <nav className="footer-links" aria-label="Pintasan">
          <Link to="/">Beranda</Link>
          <Link to="/jelajah">Jelajahi</Link>
          <Link to="/jual">Jual Barang</Link>
          <Link to="/favorit">Favorit</Link>
          <Link to="/tentang">Tentang</Link>
        </nav>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} KAMU · Tugas Praktikum PPB</p>
    </footer>
  );
}
