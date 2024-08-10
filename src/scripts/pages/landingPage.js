import "../../styles/landing.css";

import introLogo from "../../public/images/introLogo.jpg";
import productIcon from "../../public/icons/product-icon.svg";
import shopIcon from "../../public/icons/shop-icon.svg";
import noteIcon from "../../public/icons/note-icon.svg";
import chartIcon from "../../public/icons/chart-icon.svg";

document.body.style.backgroundColor = "#ffffff";

// Defining a function to render the landing page
const renderLandingPage = (container) => {
  container.innerHTML = `
    <main id="landingPage">
      <header>
        <div class="headerBar">
          <div class="headerTitle">
            <h1>LocalSupport</h1>
          </div>
          <div class="headerButtonArea">
            <button class="whiteButton" id="loginCustomer">
            Pembeli
            </button>
            <button class="whiteButton" id="loginSeller">
            Penjual
            </button>
          </div>
        </div>
      </header>

      <section class="introductionSectionArea" id="introductionSellerArea">
        <div class="introductionGreeting">
          <h1>Platform Pendukung Usaha Lokal Indonesia</h1>
          <h2>
            Temukan kebutuhan sehari-hari sekaligus dukung usaha-usaha lokal
            terbaik di platform kami. Jelajahi berbagai UMKM yang menyediakan
            produk dan layanan berkualitas tinggi, semuanya dalam satu tempat.
            Di sini, Anda membantu memperkuat ekonomi lokal dan sekaligus
            memenuhi kebutuhan anda!
          </h2>
        </div>

        <div class="introductionImage">
          <img src=${introLogo} alt="Market Logo" />
        </div>
      </section>

      <section class="featureSectionArea" id="featureSectionArea">
        <div class="featureHeader">
          <h1>Layanan Terbaik Untuk Pelanggan dan Penjual</h1>
        </div>
        <div class="featureCardList" id="featureCardList">
          <div class="featureCard">
            <div class="featureDescription">
              <img src=${shopIcon} alt="Intro Logo" />
              <h1>Temukan Kebutuhan Anda</h1>
              <h2>
                Kami menyediakan informasi lengkap tentang usaha lokal yang
                dibutuhkan pelanggan, termasuk nama usaha, alamat, dan nomor
                penjual. Mudah, terpercaya, dan tepat sasaran untuk semua
                kebutuhan Anda sehari-hari!
              </h2>
            </div>
          </div>

          <div class="featureCard">
            <div class="featureDescription">
              <img src=${productIcon} alt="Intro Logo" />
              <h1>Manajemen Inventaris Digital</h1>
              <h2>
                Kami menyediakan efisiensi bagi penjual untuk melakukan
                pengelolaan produk dan stok yang dimiliki termasuk pemantauan,
                pengaturan, dan pengendalian jumlah barang yang tersedia untuk
                dijual atau digunakan.
              </h2>
            </div>
          </div>

          <div class="featureCard">
            <div class="featureDescription">
              <img src=${noteIcon} alt="Intro Logo" />
              <h1>Pencatatan Transaksi Digital</h1>
              <h2>
                Kami menyediakan efisiensi bagi penjual untuk mencatat transaksi
                mereka dengan cepat dan akurat. Proses pencatatan yang
                terdigitalisasi memastikan setiap detail tercatat dengan cepat,
                tepat, dan akurat!
              </h2>
            </div>
          </div>

          <div class="featureCard">
            <div class="featureDescription">
              <img src=${chartIcon} alt="Intro Logo" />
              <h1>Analisa Catatan Transaksi</h1>
              <h2>
                Kami menyediakan solusi bagi penjual untuk menganalisis
                transaksi dalam rentang waktu yang diinginkan. Evaluasi
                memberikan analisa keuntungan dan saran produk yang sesuai
                dengan kebutuhan utama pelanggan untuk meningkatkan penjualan.
              </h2>
            </div>
          </div>
        </div>
      </section>
    </main>
    <footer>
        <div class="footerBar">
            <h1>Platform Pendukung Usaha Lokal Indonesia</h1>
        </div>
    </footer>
    `;

  // Selecting elements for event handling
  const loginCustomerButton = container.querySelector("#loginCustomer");
  const loginSellerButton = container.querySelector("#loginSeller");

  // Adding event listener to redirect to the login buyer page when clicking the button
  if (loginCustomerButton) {
    loginCustomerButton.addEventListener("click", () => {
      window.location.href = "/loginCustomer";
    });
  }

  // Adding event listener to redirect to the login seller page when clicking the button
  if (loginSellerButton) {
    loginSellerButton.addEventListener("click", () => {
      window.location.href = "/loginSeller";
    });
  }
};

// Exporting the renderLandingPage function as default
export default renderLandingPage;
