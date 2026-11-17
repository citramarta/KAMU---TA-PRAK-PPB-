import { NavLink } from "react-router-dom";
import { IconGrid, IconHeart, IconHome, IconPlus, IconUser } from "./Icons.jsx";

const TABS = [
  { to: "/", label: "Beranda", Icon: IconHome, end: true },
  { to: "/jelajah", label: "Jelajahi", Icon: IconGrid },
  { to: "/jual", label: "Jual", Icon: IconPlus, sell: true },
  { to: "/favorit", label: "Favorit", Icon: IconHeart },
  { to: "/profil", label: "Profil", Icon: IconUser },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {TABS.map(({ to, label, Icon, end, sell }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `nav-item${sell ? " nav-sell" : ""}${isActive ? " active" : ""}`
          }
        >
          {sell ? (
            <span className="nav-sell-icon">
              <Icon size={24} />
            </span>
          ) : (
            <Icon size={22} />
          )}
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
