// Memperkecil foto di browser sebelum diunggah (hemat kuota & penyimpanan).
// Hasilnya JPEG dengan sisi terpanjang <= maxSide dan ukuran kira-kira <= maxBytes.

async function loadImage(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file); // otomatis mengikuti orientasi EXIF
    } catch {
      /* lanjut ke cara lama */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Foto tidak bisa dibaca. Coba pilih foto lain."));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function compressImage(file, { maxSide = 1000, quality = 0.82, maxBytes = 380 * 1024 } = {}) {
  if (!file?.type?.startsWith("image/")) throw new Error("File harus berupa gambar (JPG atau PNG).");

  const source = await loadImage(file);
  const width = source.width;
  const height = source.height;

  let side = maxSide;
  let q = quality;
  let dataUrl = "";

  // Turunkan kualitas / ukuran bertahap sampai cukup kecil
  for (let attempt = 0; attempt < 6; attempt++) {
    const scale = Math.min(1, side / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; // latar putih untuk PNG transparan
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    dataUrl = canvas.toDataURL("image/jpeg", q);

    const bytes = Math.round(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);
    if (bytes <= maxBytes) return { dataUrl, bytes };
    q = Math.max(0.5, q - 0.1);
    side = Math.round(side * 0.85);
  }

  const bytes = Math.round(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);
  return { dataUrl, bytes };
}

export const formatBytes = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
