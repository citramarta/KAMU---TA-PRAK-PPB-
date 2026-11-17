import ProductCard from "./ProductCard.jsx";

// variant "grid" = 2 kolom, "row" = baris yang bisa digeser ke samping
export default function ProductGrid({ items, variant = "grid", className = "" }) {
  if (variant === "row") {
    return (
      <div className={`product-row ${className}`}>
        {items.map((item) => (
          <ProductCard key={item.id} item={item} compact />
        ))}
      </div>
    );
  }
  return (
    <div className={`product-grid ${className}`}>
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
}
