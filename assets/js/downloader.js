const SOCIAL_HOSTS = [
  { name: "TikTok", hosts: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"] },
  { name: "Instagram", hosts: ["instagram.com", "www.instagram.com"] },
  { name: "X", hosts: ["x.com", "www.x.com", "twitter.com", "www.twitter.com", "t.co"] }
];
const MEDIA_EXTENSIONS = /\.(?:jpe?g|png|gif|webp|avif|mp4|webm|mov|m4v)(?:$|[?#])/i;
const MAX_DOWNLOAD_BYTES = 200 * 1024 * 1024;

export function inspectMediaLink(raw) {
  if (!raw) throw new Error("Masukkan tautan terlebih dahulu.");
  let url;
  try { url = new URL(raw); } catch { throw new Error("Masukkan tautan lengkap yang diawali https://"); }
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("Protokol tautan tidak didukung.");
  if (url.username || url.password) throw new Error("Tautan dengan informasi login tidak diizinkan.");
  const host = url.hostname.toLowerCase();
  const platform = SOCIAL_HOSTS.find((item) => item.hosts.includes(host) || item.hosts.some((domain) => host.endsWith("." + domain)));
  if (platform) {
    return {
      kind: "social",
      platform: platform.name,
      url,
      message: `Tautan ${platform.name} terdeteksi. Forkun belum dapat mengambil file langsung dari postingan ini. Gunakan opsi unduh resmi yang tersedia pada platform, lalu impor file hasilnya melalui menu Impor media. Jangan gunakan konten privat atau yang tidak kamu punya izin untuk simpan.`
    };
  }
  if (!MEDIA_EXTENSIONS.test(url.href)) {
    throw new Error("Tautan dikenali, tetapi bukan tautan file foto/video langsung. Untuk saat ini gunakan URL berakhiran JPG, PNG, WEBP, MP4, atau format media umum lainnya.");
  }
  return { kind: "direct", url };
}

export async function downloadDirectMedia(url, save) {
  let response;
  try {
    response = await fetch(url.href, { method: "GET", mode: "cors", credentials: "omit", redirect: "follow" });
  } catch {
    throw new Error("Server sumber menolak akses dari browser (CORS atau jaringan). Coba unduh file melalui sumber aslinya, lalu impor dari perangkat.");
  }
  if (!response.ok) throw new Error(`Server sumber merespons ${response.status}. File tidak dapat diambil.`);
  const blob = await response.blob();
  if (!blob.size) throw new Error("File yang diterima kosong.");
  if (blob.size > MAX_DOWNLOAD_BYTES) throw new Error("Ukuran file melebihi batas impor tautan 200 MB.");
  const mime = blob.type.split(";")[0].toLowerCase();
  if (!(mime.startsWith("image/") || mime.startsWith("video/"))) {
    throw new Error("Respons server bukan file foto atau video yang dikenali.");
  }
  const extension = mime.split("/")[1]?.replace("jpeg", "jpg").replace("quicktime", "mov") || "bin";
  const pathName = decodeURIComponent(url.pathname.split("/").pop() || "");
  const safeName = pathName && /\.[a-z0-9]{2,5}$/i.test(pathName)
    ? pathName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100)
    : `forkun-${Date.now()}.${extension}`;
  const file = new File([blob], safeName, { type: mime, lastModified: Date.now() });
  const record = await save(file);
  return { name: record.name, size: record.size, type: record.type };
}
