import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useApp } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import ItemForm from "../components/ItemForm.jsx";
import { LoginPrompt } from "../components/States.jsx";

export default function Sell() {
  const { user, notify } = useApp();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="page page-narrow">
        <Header title="Jual Barang" subtitle="Posting barangmu ke sesama mahasiswa." />
        <LoginPrompt text="Masuk dengan NIM-mu untuk mulai menjual barang." />
      </div>
    );
  }

  async function save(payload, intent) {
    const created = await api.createItem(payload);
    if (intent === "draft") {
      notify("Draf tersimpan. Lengkapi lalu terbitkan kapan saja.");
      navigate("/profil?tab=draf", { replace: true });
    } else {
      notify("Barang berhasil diposting 🎉");
      navigate(`/barang/${created.id}`, { replace: true });
    }
  }

  return (
    <div className="page page-narrow">
      <Header title="Jual Barang" subtitle="Posting barangmu ke sesama mahasiswa." />
      <ItemForm mode="create" sellerId={user.id} onSubmit={save} />
    </div>
  );
}
