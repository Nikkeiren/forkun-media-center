import { saveMedia, getMedia, deleteMedia } from "./storage.js";

const $ = (selector) => document.querySelector(selector);
const views = ["overview", "library", "collections", "import", "vault"];
const labels = { overview: "Ringkasan", library: "Perpustakaan", collections: "Koleksi", import: "Impor media", vault: "Private Vault" };
let mediaItems = [];

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function navigate(view) {
  if (!views.includes(view)) return;
  views.forEach((name) => $(`#view-${name}`).classList.toggle("active", name === view));
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  $("#page-name").textContent = labels[view];
  $("#sidebar").classList.remove("open");
  if (view === "library") renderLibrary();
}

function cardTemplate(item) {
  const preview = item.type === "image"
    ? `<img src="${URL.createObjectURL(item.blob)}" alt="">`
    : `<video src="${URL.createObjectURL(item.blob)}" muted playsinline preload="metadata"></video>`;
  return `<article class="media-card">
    <div class="media-preview">${preview}</div>
    <div class="media-meta"><button class="media-remove" data-delete="${item.id}" aria-label="Hapus ${escapeHtml(item.name)}">Hapus</button><div class="media-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div><div class="media-size">${formatBytes(item.size)} · ${item.type === "image" ? "Foto" : "Video"}</div></div>
  </article>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function renderCards(target, items) {
  if (!items.length) {
    target.innerHTML = `<div class="empty-state"><div class="empty-symbol">▧</div><strong>Belum ada media</strong><p>Impor foto atau video untuk mulai mengisi perpustakaanmu.</p><button class="secondary-btn" data-go="import">Impor media</button></div>`;
    return;
  }
  target.innerHTML = items.map(cardTemplate).join("");
}

function renderLibrary() {
  const query = ($("#search-input")?.value || "").toLowerCase().trim();
  const type = $("#type-filter")?.value || "all";
  const filtered = mediaItems.filter((item) => item.name.toLowerCase().includes(query) && (type === "all" || item.type === type));
  renderCards($("#library-grid"), filtered);
}

function render() {
  const photos = mediaItems.filter((item) => item.type === "image").length;
  const videos = mediaItems.length - photos;
  const totalSize = mediaItems.reduce((sum, item) => sum + item.size, 0);
  $("#stat-total").textContent = mediaItems.length;
  $("#stat-photos").textContent = photos;
  $("#stat-videos").textContent = videos;
  $("#stat-size").textContent = formatBytes(totalSize);
  $("#media-count").textContent = `${mediaItems.length} item`;
  $("#storage-caption").textContent = `${mediaItems.length} file · ${formatBytes(totalSize)}`;
  renderCards($("#recent-grid"), mediaItems.slice(0, 4));
  renderLibrary();
}

async function refresh() {
  try {
    mediaItems = await getMedia();
    render();
  } catch (error) {
    console.error(error);
    $("#import-status").textContent = "Penyimpanan browser tidak dapat dibuka. Coba gunakan browser biasa, bukan mode privat.";
  }
}

document.addEventListener("click", async (event) => {
  const nav = event.target.closest("[data-view]");
  const go = event.target.closest("[data-go]");
  const remove = event.target.closest("[data-delete]");
  if (nav) navigate(nav.dataset.view);
  if (go) navigate(go.dataset.go);
  if (remove) {
    if (confirm("Hapus file ini dari perpustakaan Forkun di perangkat ini?")) {
      await deleteMedia(remove.dataset.delete);
      await refresh();
    }
  }
});

$("#menu-toggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#search-input").addEventListener("input", renderLibrary);
$("#type-filter").addEventListener("change", renderLibrary);

async function importFiles(fileList) {
  const files = [...fileList].filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
  if (!files.length) {
    $("#import-status").textContent = "Pilih file foto atau video yang didukung.";
    return;
  }
  let saved = 0;
  $("#import-status").textContent = "Sedang menyimpan media…";
  for (const file of files) {
    try {
      await saveMedia(file);
      saved++;
    } catch (error) {
      console.error(error);
      $("#import-status").textContent = `Gagal menyimpan ${file.name}. Ruang penyimpanan browser mungkin tidak cukup.`;
    }
  }
  await refresh();
  if (saved) $("#import-status").textContent = `${saved} file berhasil diimpor ke perangkat ini.`;
  $("#file-input").value = "";
}

$("#file-input").addEventListener("change", (event) => importFiles(event.target.files));
const dropzone = $("#dropzone");
["dragenter", "dragover"].forEach((name) => dropzone.addEventListener(name, (event) => {
  event.preventDefault();
  dropzone.style.borderColor = "#b7a5ff";
}));
["dragleave", "drop"].forEach((name) => dropzone.addEventListener(name, (event) => {
  event.preventDefault();
  dropzone.style.borderColor = "";
}));
dropzone.addEventListener("drop", (event) => importFiles(event.dataTransfer.files));

$("#check-url").addEventListener("click", () => {
  const field = $("#source-url");
  const message = $("#url-message");
  try {
    const url = new URL(field.value);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("protocol");
    message.textContent = "Format tautan valid. Pengunduhan belum tersedia; integrasi platform harus memakai metode resmi dan izin yang sesuai.";
  } catch {
    message.textContent = "Masukkan tautan lengkap yang valid, diawali https://";
  }
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch((error) => console.info("PWA offline belum aktif:", error)));
}

refresh();
