import "../../../styles/registerSeller.css";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import firebaseConfig from "../../common/config";

import backIcon from "../../../public/icons/back-icon.svg";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

const renderRegisterSeller = (container) => {
  document.body.style.backgroundColor = "#00258c";

  container.innerHTML = `
  <main id="registerSellerPage">
      <header>
        <div class="mainHeader">
          <button id="backButton" class="backButton" type="button">
            <img src=${backIcon} alt="Back Icon"/>
          </button>
        </div>
      </header>

      <section class="mainArea">
        <div class="registerSeller" id="registerSeller">
          <h1>Daftarkan Usaha Anda</h1>
          <form class="registerForm" id="registerForm">
            <div class="formLabel">
              <label for="ownerName">Nama Pemilik</label>
              <input type="text" id="ownerName" name="ownerName" class="input" required />
            </div>

            <div class="formLabel">
              <label for="marketName">Nama Usaha</label>
              <input type="text" id="marketName" name="marketName" class="input" required />
            </div>

            <div class="formLabel">
              <label for="sellerNumber">Nomor Handphone</label>
              <input
                type="text"
                id="sellerNumber"
                name="sellerNumber"
                class="input"
                required />
            </div>

            <div class="formLabel">
              <label for="sellerPlace">Lokasi Usaha</label>
                <textarea
                id="sellerPlace"
                name="sellerPlace"
                class="locationInput"
                required></textarea>
            </div>

            <div class="formLabel">
              <label for="sellerEmail">Email</label>
              <input
                type="email"
                id="sellerEmail"
                name="sellerEmail"
                class="input"
                required />
            </div>

            <div class="formLabel">
              <label for="sellerPassword">Password</label>
              <input
                type="password"
                id="sellerPassword"
                name="sellerPassword"
                class="input"
                required />
              <div class="inputContainer">
                <label for="showPassword">
                  <input
                    type="checkbox"
                    class="passwordCheckbox"
                    id="showPassword" />
                  Tampilkan Password</label
                >
              </div>
            </div>
            <button type="submit" class="blueButton">Daftar</button>
          </form>
          <div class="loginContainer">
            <p>Sudah punya akun? <a href="/loginSeller">Masuk Disini!</a></p>
          </div>
        </div>

        <div class="headlineContainer">
          <div class="registerHeadline">
            <h1>Mulai kembangkan dan promosikan usaha anda sekarang</h1>
            <p>
              Platform kami menyediakan layanan pengelolaan stok dan produk
              dengan pencatatan transaksi yang akurat serta evaluasi yang
              mendalam. Sekaligus media promosi yang efektif, kami dapat
              memperluas jangkauan pasar dan meningkatkan visibilitas produk
              Anda. Bergabunglah sekarang untuk mengoptimalkan operasional
              bisnis Anda dan meraih keuntungan maksimal!
            </p>
          </div>
        </div>
      </section>
    </main>
`;

  const backButton = document.querySelector("#backButton");
  const showPasswordCheck = document.querySelector("#showPassword");
  const registerForm = document.querySelector("#registerForm");

  showPasswordCheck.addEventListener("change", () => {
    const passwordInput = document.getElementById("sellerPassword");
    const type = showPasswordCheck.checked ? "text" : "password";
    passwordInput.setAttribute("type", type);
  });

  backButton.addEventListener("click", () => {
    window.history.replaceState(null, null, "/");
    window.location.href = "/";
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const ownerName = document.getElementById("ownerName").value;
    const marketName = document.getElementById("marketName").value;
    const sellerNumber = document.getElementById("sellerNumber").value;
    const sellerPlace = document.getElementById("sellerPlace").value;
    const sellerEmail = document.getElementById("sellerEmail").value;
    const sellerPassword = document.getElementById("sellerPassword").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        sellerEmail,
        sellerPassword,
      );

      await createUserProfile(
        userCredential.user.uid,
        ownerName,
        marketName,
        sellerNumber,
        sellerPlace,
      );

      console.log("Akun berhasil didaftarkan :", userCredential);
      handleSignupSuccess(userCredential);
    } catch (error) {
      console.error("Pendaftaran gagal dilakukan :", error.message);
      handleSignupError(error);
    }
  });

  const createUserProfile = async (
    userId,
    ownerName,
    marketName,
    sellerNumber,
    sellerPlace,
  ) => {
    try {
      const userProfile = {
        ownerName,
        marketName,
        sellerNumber,
        sellerPlace,
      };

      console.log("Membuat profil pengguna menggunakan data:", userProfile);
      await setDoc(doc(firestore, "sellers", userId), userProfile);
      console.log("Profil pengguna berhasil dibuat");
    } catch (error) {
      console.error("Terjadi kesalahan saat membuat profil pengguna:", error);
      throw error;
    }
  };

  function handleSignupSuccess(userCredential) {
    const { user } = userCredential;
    redirectToLogin();
  }

  function handleSignupError(error) {
    let errorMessage;
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "Email sudah terdaftar. Gunakan email lain atau coba untuk login.";
        break;
      case 'auth/invalid-email':
        errorMessage = "Email yang Anda masukkan tidak valid.";
        break;
      case 'auth/operation-not-allowed':
        errorMessage = "Pendaftaran tidak diizinkan. Silakan coba lagi nanti.";
        break;
      case 'auth/weak-password':
        errorMessage = "Kata sandi terlalu lemah. Silakan gunakan kata sandi yang lebih kuat.";
        break;
      default:
        errorMessage = "Pendaftaran gagal. Silakan coba lagi.";
        break;
    }
    alert(errorMessage);
  }

  function redirectToLogin() {
    window.location.href = "/loginSeller";
  }
};

export default renderRegisterSeller;
