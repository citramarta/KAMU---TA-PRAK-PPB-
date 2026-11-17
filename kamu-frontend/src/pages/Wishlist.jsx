import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import { EmptyState, LoginPrompt, SkeletonGrid } from "../components/States.jsx";
import { IconHeart } from "../components/Icons.jsx";

export default function Wishlist() {
  const { user, wishlist, wishLoading } = useApp();

  return (
    <div className="page">
      <Header
        title="Favorit"
        subtitle={user ? `${wishlist.length} barang tersimpan` : "Simpan barang incaranmu di sini."}
      />

      {!user ? (
        <LoginPrompt text="Masuk untuk menyimpan barang favoritmu." />
      ) : wishLoading && wishlist.length === 0 ? (
        <SkeletonGrid count={4} />
      ) : wishlist.length === 0 ? (
        <EmptyState
          icon={<IconHeart size={28} />}
          title="Belum ada favorit"
          text="Ketuk ikon hati pada barang untuk menyimpannya."
          action={
            <Link to="/jelajah" className="btn btn-primary btn-sm">
              Jelajahi Barang
            </Link>
          }
        />
      ) : (
        <ProductGrid items={wishlist} />
      )}
    </div>
  );
}
