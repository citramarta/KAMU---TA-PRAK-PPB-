import { Link, useLocation } from "react-router-dom";
import { IconHeart, IconImage, IconUser } from "./Icons.jsx";

export function Loader({ text = "Memuat…" }) {
  return (
    <div className="state" role="status">
      <span className="spinner" />
      <p>{text}</p>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="product-card skeleton-card" key={i}>
          <div className="skeleton skeleton-thumb" />
          <div className="product-info">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <span className="state-icon">
        <IconImage size={28} />
      </span>
      <h3>Ups, ada masalah</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary btn-sm" onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = <IconImage size={28} />, title, text, action }) {
  return (
    <div className="state">
      <span className="state-icon">{icon}</span>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

// Ditampilkan di halaman yang butuh akun (Jual, Favorit)
export function LoginPrompt({ title = "Masuk dulu yuk", text }) {
  const location = useLocation();
  const from = location.pathname + location.search;
  return (
    <EmptyState
      icon={<IconUser size={28} />}
      title={title}
      text={text || "Masuk dengan NIM-mu untuk memakai fitur ini."}
      action={
        <div className="state-actions">
          <Link to="/login" state={{ from }} className="btn btn-primary">
            Masuk
          </Link>
          <Link to="/daftar" state={{ from }} className="btn btn-ghost">
            Daftar
          </Link>
        </div>
      }
    />
  );
}

export { IconHeart };
