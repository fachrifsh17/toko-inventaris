"use client";

import React, { useState, useRef, useEffect } from "react";

type Product = { id: number; nama_produk: string; harga_jual?: number };

export default function SearchSelect({
  products,
  name = "produk_id",
  placeholder = "Cari produk...",
  onSelect,
}: {
  products: Product[];
  name?: string;
  placeholder?: string;
  onSelect?: (p: Product | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<Product[]>(products || []);
  const [selectedId, setSelectedId] = useState<string>("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => setFiltered(products), [products]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) return setFiltered(products);
    setFiltered(
      products.filter(
        (p) => `${p.id}`.includes(q) || p.nama_produk.toLowerCase().includes(q),
      ),
    );
  }, [query, products]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const handleSelect = (p: Product) => {
    setQuery(`${p.nama_produk}`);
    setSelectedId(String(p.id));
    setOpen(false);
    if (onSelect) onSelect(p);
  };

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setSelectedId("");
          if (onSelect) onSelect(null);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <input type="hidden" name={name} value={selectedId} />

      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto">
          {filtered.map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => handleSelect(p)}
              className="w-full text-left px-3 py-2 hover:bg-slate-100"
            >
              <div className="text-sm font-medium">{p.nama_produk}</div>
              <div className="text-xs text-slate-400">
                ID: {p.id}
                {p.harga_jual
                  ? ` • ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p.harga_jual)}`
                  : ""}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
