
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, resolveImage } from "../services/api.js";
import { useAsync } from "../hooks/useAsync.js";
import { useApp } from "../context/AppContext.jsx";
import Header from "../components/Header.jsx";
import { ProductImage } from "../components/ProductCard.jsx";
import { EmptyState, ErrorBox } from "../components/States.jsx";
import {
  IconBag,
  IconChevronRight,
  IconDownload,
  IconInfo,
  IconLogout,
  IconTrash,
} from "../components/Icons.jsx";
import { formatRupiah, initials } from "../utils/format.js";

const TABS = [
  {
    key: "aktif",
    label: "Aktif",
    status: "available",
    empty: ["Belum ada barang aktif", "Yuk jual barang pertamamu."],
  },
  {
    key: "draf",
    label: "Draf",
    status: "draft",
    empty: ["Belum ada draf", "Barang yang belum lengkap bisa disimpan dulu sebagai draf."],
  },
  {
    key: "terjual",
    label: "Terjual",
    status: "sold",
    empty: ["Belum ada barang terjual", "Barang yang kamu tandai terjual akan muncul di sini."],
  },
  {
    key: "arsip",
    label: "Arsip",
    status: "archived",
    empty: ["Arsip kosong", "Arsipkan barang yang ingin disembunyikan sementara dari katalog."],
  },
];

const STATUS_LABEL = {
  available: "Aktif",
  draft: "Draf",
  sold: "Terjual",
  archived: "Diarsipkan",
};

// Mengompres foto menjadi JPEG agar ukuran request tidak terlalu besar.
async function compressImage(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }

  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Foto tidak dapat dibaca."));
      image.src = reader.result;
    };

    reader.onerror = () => reject(new Error("Foto gagal dibaca."));
    reader.readAsDataURL(file);
  });

  const maxSize = 500;
  const ratio = Math.min(
    1,
    maxSize / Math.max(source.width, source.height)
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * ratio);
  canvas.height = Math.round(source.height * ratio);

  const context = canvas.getContext("2d");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);

  let quality = 0.75;
  let result = canvas.toDataURL("image/jpeg", quality);

  while (result.length > 1_350_000 && quality > 0.4) {
    quality -= 0.1;
    result = canvas.toDataURL("image/jpeg", quality);
  }

  if (result.length > 1_350_000) {
    throw new Error("Ukuran foto masih terlalu besar. Coba pilih foto lain.");
  }

  return result;
}

function MenuItem({ icon, label, to, onClick, danger }) {
  const body = (
    <>
      <span className={`menu-icon${danger ? " danger" : ""}`}>
        {icon}
      </span>
      <span className="menu-label">{label}</span>
      <IconChevronRight size={18} />
    </>
  );

  return to ? (
    <Link to={to} className="menu-item">
      {body}
    </Link>
  ) : (
    <button type="button" className="menu-item" onClick={onClick}>
      {body}
    </button>
  );
}

export default function Profile() {
  const {
    user,
    logout,
    notify,
    canInstall,
    installed,
    install,
    updateProfile,
  } = useApp();

  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    faculty: user?.faculty || "",
    whatsapp: user?.whatsapp || "",
    email: user?.email || "",
  });

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      faculty: user?.faculty || "",
      whatsapp: user?.whatsapp || "",
      email: user?.email || "",
    });
  }, [user]);

  const tabKey = TABS.some((t) => t.key === params.get("tab"))
    ? params.get("tab")
    : "aktif";

  const tab = TABS.find((t) => t.key === tabKey);

  const mine = useAsync(
    (signal) =>
      user
        ? api.items({ seller_id: user.id }, signal)
        : Promise.resolve([]),
    [user?.id]
  );

  const items = mine.data || [];
  const count = (status) =>
    items.filter((i) => i.status === status).length;
  const visible = items.filter((i) => i.status === tab.status);

  function changeProfileField(event) {
    const { name, value } = event.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function selectAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify("Pilih file gambar yang valid.");
      event.target.value = "";
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function cancelProfileEdit() {
    setProfileForm({
      name: user?.name || "",
      faculty: user?.faculty || "",
      whatsapp: user?.whatsapp || "",
      email: user?.email || "",
    });

    setAvatarFile(null);
    setAvatarPreview("");
    setEditingProfile(false);
  }

  async function saveProfile(event) {
    event.preventDefault();

    if (!profileForm.name.trim()) {
      notify("Nama tidak boleh kosong.");
      return;
    }

    setSavingProfile(true);

    try {
      const data = {
        name: profileForm.name.trim(),
        faculty: profileForm.faculty.trim(),
        whatsapp: profileForm.whatsapp.trim(),
        email: profileForm.email.trim(),
      };

      if (avatarFile) {
        data.avatar_url = await compressImage(avatarFile);
      }

      await updateProfile(data);

      setAvatarFile(null);
      setAvatarPreview("");
      setEditingProfile(false);
      notify("Profil berhasil diperbarui!");
    } catch (err) {
      notify(err.message || "Gagal memperbarui profil.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changeStatus(item, status, message) {
    try {
      await api.updateItem(item.id, {
        status,
        seller_id: user.id,
      });

      notify(message);
      mine.reload();
    } catch (err) {
      if (status === "available") {
        notify(`Lengkapi dulu datanya. ${err.message}`);
        navigate(`/barang/${item.id}/edit`);
      } else {
        notify(err.message);
      }
    }
  }

  async function remove(item) {
    if (!window.confirm(`Hapus "${item.title}" secara permanen?`)) {
      return;
    }

    try {
      await api.deleteItem(item.id, user.id);
      notify("Barang dihapus");
      mine.reload();
    } catch (err) {
      notify(err.message);
    }
  }

  function doLogout() {
    logout();
    notify("Kamu telah keluar");
    navigate("/");
  }

  // Tampilan jika pengguna belum login.
  if (!user) {
    return (
      <div className="page page-narrow">
        <Header
          title="Profil"
          subtitle="Masuk untuk mulai berjualan."
        />

        <div className="guest-card">
          <img src="/logo.svg" alt="" width="64" height="64" />
          <h2>Selamat datang di KAMU</h2>
          <p>
            Masuk dengan NIM-mu untuk menjual barang dan menyimpan favorit.
          </p>

          <div className="state-actions">
            <Link to="/login" className="btn btn-primary">
              Masuk
            </Link>

            <Link to="/daftar" className="btn btn-ghost">
              Daftar
            </Link>
          </div>
        </div>

        <div className="menu">
          <MenuItem
            icon={<IconInfo size={18} />}
            label="FAQ"
            to="/faq"
          />

          <MenuItem
            icon={<IconInfo size={18} />}
            label="Tentang Aplikasi"
            to="/tentang"
          />

          {canInstall && !installed && (
            <MenuItem
              icon={<IconDownload size={18} />}
              label="Pasang Aplikasi"
              onClick={install}
            />
          )}
        </div>
      </div>
    );
  }

  const avatarSource = avatarPreview || user.avatar_url;

  const Edit = ({ item, children = "Edit" }) => (
    <Link
      to={`/barang/${item.id}/edit`}
      className="btn btn-ghost btn-xs"
    >
      {children}
    </Link>
  );

  const Act = ({
    item,
    status,
    message,
    children,
    variant = "btn-ghost",
  }) => (
    <button
      className={`btn ${variant} btn-xs`}
      onClick={() => changeStatus(item, status, message)}
    >
      {children}
    </button>
  );

  return (
    <div className="page page-profile">
      <Header title="Profil" />

      <section className="profile-card">
        {avatarSource ? (
          <img
            className="avatar avatar-lg profile-avatar-image"
            src={resolveImage(avatarSource)}
            alt={`Foto profil ${user.name}`}
          />
        ) : (
          <span className="avatar avatar-lg">
            {initials(user.name)}
          </span>
        )}

        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>NIM {user.nim}</p>
          {user.faculty && <p>{user.faculty}</p>}
          {user.whatsapp && <p>{user.whatsapp}</p>}
          {user.email && <p>{user.email}</p>}
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-xs profile-edit-button"
          onClick={() =>
            setEditingProfile((prev) => !prev)
          }
        >
          {editingProfile ? "Tutup" : "Edit Profil"}
        </button>
      </section>

      {editingProfile && (
        <section className="profile-edit-panel">
          <h2>Edit Profil</h2>

          <p className="profile-edit-description">
            Perbarui informasi dan foto profil akunmu.
          </p>

          <form onSubmit={saveProfile}>
            <div className="profile-photo-edit">
              {avatarSource ? (
                <img
                  src={resolveImage(avatarSource)}
                  alt="Pratinjau foto profil"
                  className="profile-photo-preview"
                />
              ) : (
                <span className="avatar avatar-lg">
                  {initials(profileForm.name || user.name)}
                </span>
              )}

              <label className="btn btn-ghost btn-sm profile-photo-label">
                Pilih Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={selectAvatar}
                  hidden
                />
              </label>

              <span className="profile-photo-hint">
                Format gambar, foto akan dikompres otomatis.
              </span>
            </div>

            <label className="profile-form-field">
              <span>Nama lengkap</span>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={changeProfileField}
                placeholder="Nama lengkap"
                required
              />
            </label>

            <label className="profile-form-field">
              <span>NIM</span>
              <input
                type="text"
                value={user.nim}
                disabled
              />
              <small>NIM tidak dapat diubah.</small>
            </label>

            <label className="profile-form-field">
              <span>Fakultas</span>
              <input
                type="text"
                name="faculty"
                value={profileForm.faculty}
                onChange={changeProfileField}
                placeholder="Fakultas"
              />
            </label>

            <label className="profile-form-field">
              <span>Nomor WhatsApp</span>
              <input
                type="tel"
                name="whatsapp"
                value={profileForm.whatsapp}
                onChange={changeProfileField}
                placeholder="Contoh: 081234567890"
              />
            </label>

            <label className="profile-form-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={changeProfileField}
                placeholder="nama@email.com"
              />
            </label>

            <div className="profile-form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={cancelProfileEdit}
                disabled={savingProfile}
              >
                Batal
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile}
              >
                {savingProfile
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Barang Saya</h2>
          <Link to="/jual">+ Tambah</Link>
        </div>

        <div
          className="profile-tabs"
          role="tablist"
          aria-label="Status barang"
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              className="tab"
              aria-selected={t.key === tabKey}
              onClick={() =>
                setParams(
                  t.key === "aktif" ? {} : { tab: t.key },
                  { replace: true }
                )
              }
            >
              {t.label}
              <span className="tab-count">
                {count(t.status)}
              </span>
            </button>
          ))}
        </div>

        {mine.loading && !mine.data ? (
          <p className="muted">Memuat…</p>
        ) : mine.error && !mine.data ? (
          <ErrorBox
            message={mine.error}
            onRetry={mine.reload}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<IconBag size={28} />}
            title={tab.empty[0]}
            text={tab.empty[1]}
            action={
              tab.key === "aktif" || tab.key === "draf" ? (
                <Link
                  to="/jual"
                  className="btn btn-primary btn-sm"
                >
                  Jual Barang
                </Link>
              ) : null
            }
          />
        ) : (
          <ul className="my-items">
            {visible.map((item) => (
              <li key={item.id} className="my-item">
                <Link
                  to={`/barang/${item.id}`}
                  className="my-thumb"
                >
                  <ProductImage
                    src={item.image_url}
                    alt={item.title}
                  />
                </Link>

                <div className="my-body">
                  <Link
                    to={`/barang/${item.id}`}
                    className="my-title"
                  >
                    {item.title}
                  </Link>

                  <p className="my-price">
                    {Number(item.price) > 0
                      ? formatRupiah(item.price)
                      : "Harga belum diisi"}

                    <span className={`status status-${item.status}`}>
                      {STATUS_LABEL[item.status]}
                    </span>
                  </p>

                  <div className="my-actions">
                    {item.status === "available" && (
                      <>
                        <Edit item={item} />

                        <Act
                          item={item}
                          status="sold"
                          message="Ditandai terjual"
                        >
                          Tandai terjual
                        </Act>

                        <Act
                          item={item}
                          status="archived"
                          message="Barang diarsipkan"
                        >
                          Arsipkan
                        </Act>
                      </>
                    )}

                    {item.status === "draft" && (
                      <>
                        <Edit item={item}>
                          Lanjutkan edit
                        </Edit>

                        <Act
                          item={item}
                          status="available"
                          message="Barang diterbitkan 🎉"
                          variant="btn-primary"
                        >
                          Terbitkan
                        </Act>
                      </>
                    )}

                    {item.status === "sold" && (
                      <>
                        <Act
                          item={item}
                          status="available"
                          message="Barang aktif kembali"
                        >
                          Aktifkan lagi
                        </Act>

                        <Act
                          item={item}
                          status="archived"
                          message="Barang diarsipkan"
                        >
                          Arsipkan
                        </Act>
                      </>
                    )}

                    {item.status === "archived" && (
                      <>
                        <Edit item={item} />

                        <Act
                          item={item}
                          status="available"
                          message="Barang aktif kembali"
                        >
                          Aktifkan
                        </Act>
                      </>
                    )}

                    <button
                      className="btn btn-danger btn-xs"
                      onClick={() => remove(item)}
                      aria-label={`Hapus ${item.title}`}
                    >
                      <IconTrash size={14} /> Hapus
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="menu">
        <MenuItem
          icon={<IconInfo size={18} />}
          label="FAQ"
          to="/faq"
        />

        <MenuItem
          icon={<IconInfo size={18} />}
          label="Tentang Aplikasi"
          to="/tentang"
        />

        {canInstall && !installed && (
          <MenuItem
            icon={<IconDownload size={18} />}
            label="Pasang Aplikasi"
            onClick={install}
          />
        )}

        <MenuItem
          icon={<IconLogout size={18} />}
          label="Keluar"
          onClick={doLogout}
          danger
        />
      </div>
    </div>
  );
}
