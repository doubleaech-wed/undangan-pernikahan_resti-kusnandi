// ========================================
// NAMA TAMU DARI URL
// Contoh:
// index.html?to=Haikal%20Harki
// ========================================

const params = new URLSearchParams(window.location.search);
const guest = (params.get("to") || "").trim();

const guestBox = document.getElementById("guestBox");
const guestName = document.getElementById("guestName");

if (guest) {
  guestName.textContent = guest;
  guestBox.hidden = false;
}
// Jika ?to= kosong atau tidak ada, guestBox tetap tersembunyi.


// ========================================
// OPEN INVITATION + MUSIC
// ========================================

const opening = document.getElementById("opening");
const openInvitation = document.getElementById("openInvitation");
const navbar = document.getElementById("navbar");
const musicControl = document.getElementById("musicControl");
const weddingMusic = document.getElementById("weddingMusic");

let musicPlaying = false;

openInvitation.addEventListener("click", async () => {
  opening.classList.add("hide");
  document.body.classList.remove("locked");
  navbar.classList.add("show");
  musicControl.hidden = false;

  try {
    await weddingMusic.play();
    musicPlaying = true;
    musicControl.textContent = "♫";
  } catch (error) {
    // Musik belum tersedia / browser menolak audio.
    musicPlaying = false;
  }
});

musicControl.addEventListener("click", async () => {
  if (musicPlaying) {
    weddingMusic.pause();
    musicPlaying = false;
    musicControl.textContent = "♪";
    return;
  }

  try {
    await weddingMusic.play();
    musicPlaying = true;
    musicControl.textContent = "♫";
  } catch (error) {
    console.log("");
  }
});


// ========================================
// COUNTDOWN
// 23 AGUSTUS 2026 - 09:00 WIB
//
// Jam masih placeholder karena klien belum
// memberikan jam akad.
// ========================================

const weddingDate = new Date("2026-08-23T09:00:00+07:00").getTime();

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const countdownMessage = document.getElementById("countdownMessage");

function updateCountdown() {
  const now = Date.now();
  const distance = weddingDate - now;

  if (distance <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    countdownMessage.textContent = "Acara sedang berlangsung ❤️";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (distance % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor(
    (distance % (1000 * 60)) / 1000
  );

  daysEl.textContent = String(days).padStart(2, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);


// ========================================
// SCROLL REVEAL
// ========================================

const revealElements = document.querySelectorAll(".reveal-on-scroll");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealElements.forEach((element) => observer.observe(element));


// ========================================
// GALLERY LIGHTBOX
// ========================================

const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");

galleryItems.forEach((item) => {
  item.addEventListener("click", () => {
    const image = item.querySelector("img");

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;

    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
  });
});

function closeLightbox() {
  lightbox.classList.remove("show");
  lightbox.setAttribute("aria-hidden", "true");

  if (opening.classList.contains("hide")) {
    document.body.classList.remove("locked");
  }
}

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  }
});


// ========================================
// COPY REKENING
// ========================================

const copyButtons = document.querySelectorAll(".copy-btn");

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const account = button.dataset.account;
    const originalText = button.dataset.default || "Salin Rekening";

    try {
      await navigator.clipboard.writeText(account);

      button.textContent = "✓ Berhasil Disalin";
      button.classList.add("copied");

      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("copied");
      }, 1800);

    } catch (error) {
      // Fallback sederhana untuk browser yang tidak mendukung Clipboard API.
      const textarea = document.createElement("textarea");
      textarea.value = account;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      button.textContent = "✓ Berhasil Disalin";

      setTimeout(() => {
        button.textContent = originalText;
      }, 1800);
    }
  });
});

// =========================
// UCAPAN & DOA
// =========================
const API_URL = "https://script.google.com/macros/s/AKfycbxU_Nr17IloM5DXIJZKM4DE-EKtnYk9o24R9qRvCcHR7VB3acOsvYHrKe1q6657UHEi/exec";

let allWishes = [];
const INITIAL_WISHES = 5;

// ================================
// AMBIL UCAPAN DARI GOOGLE SHEETS
// ================================
async function loadWishes() {
    const wishesContainer = document.getElementById("wishesContainer");

    if (!wishesContainer) return;

    try {
        wishesContainer.innerHTML = `
            <div class="wishes-loading">
                Memuat ucapan...
            </div>
        `;

        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data.success || !data.wishes) {
            throw new Error("Data ucapan tidak tersedia");
        }

        // Simpan semua ucapan
        allWishes = data.wishes;

        // Terbaru berada di atas
        allWishes.reverse();

        renderWishes();

    } catch (error) {
        console.error("Gagal mengambil ucapan:", error);

        wishesContainer.innerHTML = `
            <div class="wishes-empty">
                Belum ada ucapan.
            </div>
        `;
    }
}


// ================================
// TAMPILKAN UCAPAN
// ================================
function renderWishes(showAll = false) {
    const wishesContainer = document.getElementById("wishesContainer");

    if (!wishesContainer) return;

    if (allWishes.length === 0) {
        wishesContainer.innerHTML = `
            <div class="wishes-empty">
                Belum ada ucapan dan doa.
            </div>
        `;
        return;
    }

    const wishesToShow = showAll
        ? allWishes
        : allWishes.slice(0, INITIAL_WISHES);

    wishesContainer.innerHTML = wishesToShow.map(wish => `
        <div class="wish-card">
            <div class="wish-name">
                ${escapeHTML(wish.name)}
            </div>

            <div class="wish-message">
                ${escapeHTML(wish.message)}
            </div>
        </div>
    `).join("");

    // Tombol lihat lainnya
    if (!showAll && allWishes.length > INITIAL_WISHES) {

        const remaining = allWishes.length - INITIAL_WISHES;

        const button = document.createElement("button");

        button.className = "show-more-wishes";
        button.textContent = `Lihat Ucapan Lainnya ↓`;

        button.addEventListener("click", () => {
            renderWishes(true);
        });

        wishesContainer.appendChild(button);
    }
}


// ================================
// KIRIM UCAPAN
// ================================
async function submitWish(name, message) {

    const loading = document.getElementById("wishLoading");
    const submitButton = document.getElementById("submitWishButton");

    // Validasi
    if (!name.trim() || !message.trim()) {
        alert("Nama dan ucapan wajib diisi.");
        return;
    }

    /*
     * ================================
     * LANGSUNG TAMPILKAN LOADING
     * ================================
     */

    loading.classList.add("active");

    submitButton.disabled = true;
    submitButton.textContent = "Mengirim...";
    submitButton.style.opacity = "0.6";
    submitButton.style.cursor = "not-allowed";


    /*
     * ================================
     * BERIKAN WAKTU BROWSER
     * UNTUK MENAMPILKAN LOADING
     * SEBELUM FETCH
     * ================================
     */

    await new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });


    /*
     * ================================
     * KIRIM KE GOOGLE SHEETS
     * ================================
     */

    try {

        const response = await fetch(API_URL, {
            method: "POST",

            body: JSON.stringify({
                name: name.trim(),
                message: message.trim()
            })
        });


        const result = await response.json();


        if (!result.success) {
            throw new Error(
                result.message || "Gagal menyimpan ucapan"
            );
        }


        /*
         * ================================
         * BERHASIL
         * ================================
         */

        loading.classList.remove("active");

        submitButton.disabled = false;
        submitButton.textContent = "Kirim Ucapan";
        submitButton.style.opacity = "1";
        submitButton.style.cursor = "pointer";


        // Kosongkan form
        document.getElementById("wishName").value = "";
        document.getElementById("wishMessage").value = "";


        // Tampilkan ucapan terbaru
        await loadWishes();


        // Pesan berhasil
        alert("Terima kasih atas ucapan dan doanya 🤍");


    } catch (error) {

        console.error("Gagal mengirim ucapan:", error);


        /*
         * ================================
         * JIKA GAGAL
         * ================================
         */

        loading.classList.remove("active");

        submitButton.disabled = false;
        submitButton.textContent = "Kirim Ucapan";
        submitButton.style.opacity = "1";
        submitButton.style.cursor = "pointer";


        alert(
            "Maaf, ucapan belum berhasil dikirim. Silakan coba lagi."
        );
    }
}

// ================================
// KEAMANAN TEXT
// ================================
// Supaya isi ucapan tidak bisa memasukkan HTML/Script
function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

document.getElementById("wishForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("wishName").value;
    const message = document.getElementById("wishMessage").value;

    submitWish(name, message);

});
// ================================
// JALANKAN SAAT WEBSITE DIBUKA
// ================================
document.addEventListener("DOMContentLoaded", () => {

    loadWishes();

});
// ========================================
// SMOOTH NAVIGATION
// ========================================

document.querySelectorAll(".navbar a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const target = document.querySelector(link.getAttribute("href"));

    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
