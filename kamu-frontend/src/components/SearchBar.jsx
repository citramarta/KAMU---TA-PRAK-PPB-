import { Link } from "react-router-dom";
import { IconSearch, IconSliders } from "./Icons.jsx";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Cari buku, laptop, perlengkapan kos…",
  filterTo,
}) {
  return (
    <form
      className="searchbar"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
    >
      <label className="search-field">
        <IconSearch size={20} />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Cari barang"
        />
      </label>
      {filterTo && (
        <Link to={filterTo} className="filter-btn" aria-label="Buka filter">
          <IconSliders size={20} />
        </Link>
      )}
    </form>
  );
}
