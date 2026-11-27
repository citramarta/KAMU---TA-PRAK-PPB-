import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api.js";
import { useAsync } from "../hooks/useAsync.js";
import { useApp } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import ItemForm from "../components/ItemForm.jsx";
import { EmptyState, ErrorBox, Loader, LoginPrompt } from "../components/States.jsx";

export default function EditItem() {
  const { id } = useParams();
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const { data: item, loading, error, reload } = useAsync((signal) => api.item(id, signal), [id]);

  if (!user) {
    return (
      <div className="page page-narrow">
        <Header title="Edit Barang" back />
        <LoginPrompt text="Masuk untuk mengedit barangmu." />
      </div>
    );
  }
  if (loading && !item) {
    return (
      <div className="page page-narrow">
        <Loader text="Memuat data barang…" />
      </div>
    );
  }
  if (error && !item) {
    return (
      <div className="page page-narrow">
        <Header title="Edit Barang" back />
        <ErrorBox message={error} onRetry={reload} />
      </div>
    );
  }
  if (item.seller_id !== user.id) {
    return (
      <div className="page page-narrow">
        <Header title="Edit Barang" back />
        <EmptyState
          title="Bukan barangmu"
          text="Kamu hanya bisa mengedit barang yang kamu jual sendiri."
          action={
            <Link to="/" className="btn btn-primary btn-sm">
              Ke Beranda
            </Link>
          }
        />
      </div>
    );
  }

  async function save(payload, intent) {
    await api.updateItem(id, payload);
    if (intent === "draft") {
      notify("Draf disimpan");
      navigate("/profil?tab=draf", { replace: true });
    } else {
      notify(intent === "publish" ? "Barang diterbitkan 🎉" : "Perubahan disimpan");
      navigate(`/barang/${id}`, { replace: true });
    }
  }

  return (
    <div className="page page-narrow">
      <Header title="Edit Barang" subtitle={item.title} back />
      <ItemForm mode="edit" item={item} sellerId={user.id} onSubmit={save} />
    </div>
  );
}
