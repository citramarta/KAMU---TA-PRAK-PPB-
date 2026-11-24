import { useState } from "react";
import { Link } from "react-router-dom";
import { IconChevronRight } from "../components/Icons.jsx";

const faqData = [
  {
    question: "Siapa yang bisa menggunakan KAMU?",
    answer:
      "KAMU ditujukan untuk mahasiswa yang ingin membeli atau menjual barang. Pengguna dapat mendaftar menggunakan identitas mahasiswa."
  },
  {
    question: "Bagaimana cara membeli barang?",
    answer:
      "Pilih barang yang kamu inginkan melalui halaman Beranda atau Jelajah, kemudian buka detail produk untuk melihat informasi dan menghubungi penjual."
  },
  {
    question: "Bagaimana cara menjual barang?",
    answer:
      "Masuk ke akun KAMU, pilih menu Jual, kemudian isi informasi produk seperti nama barang, harga, deskripsi, kondisi, dan foto barang."
  },
  {
    question: "Apakah barang yang dijual harus baru?",
    answer:
      "Tidak. Kamu bisa menjual barang baru maupun preloved selama barang tersebut layak digunakan dan sesuai dengan ketentuan KAMU."
  },
  {
    question: "Bagaimana cara menghubungi penjual?",
    answer:
      "Kamu dapat melihat informasi kontak atau metode komunikasi yang tersedia pada halaman detail produk."
  },
  {
    question: "Apakah transaksi dilakukan secara langsung?",
    answer:
      "Pembeli dan penjual dapat menyepakati metode transaksi secara langsung, termasuk lokasi dan waktu pertemuan di lingkungan kampus."
  },
  {
    question: "Bagaimana jika mengalami kendala?",
    answer:
      "Jika mengalami kendala saat menggunakan aplikasi, kamu dapat menghubungi pihak pengelola KAMU melalui kontak resmi yang disediakan."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  function toggleFAQ(index) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <div className="page page-narrow faq-page">
      <header className="faq-header">
        <div className="faq-topbar">
          <Link to="/profil" className="faq-back">
            <IconChevronRight
              size={20}
              style={{ transform: "rotate(180deg)" }}
            />
          </Link>

          <h1>Pertanyaan Umum</h1>
        </div>

        <div className="faq-heading">
          <p>
            Temukan jawaban dari pertanyaan yang sering
            diajukan tentang KAMU.
          </p>
        </div>
      </header>

      <section className="faq-list">
        {faqData.map((faq, index) => (
          <div
            className={`faq-item ${
              openIndex === index ? "active" : ""
            }`}
            key={index}
          >
            <button
              type="button"
              className="faq-question"
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
            >
              <span>{faq.question}</span>

              <span
                className={`faq-arrow ${
                  openIndex === index ? "rotated" : ""
                }`}
              >
                <IconChevronRight size={19} />
              </span>
            </button>

            {openIndex === index && (
              <div className="faq-answer">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="faq-contact">
        <h3>Masih ada pertanyaan?</h3>
        <p>
          Belum menemukan jawaban yang kamu cari?
          Hubungi tim KAMU untuk mendapatkan bantuan.
        </p>
        <Link to="/tentang" className="btn btn-primary">
          Tentang KAMU
        </Link>
      </section>
    </div>
  );
}
