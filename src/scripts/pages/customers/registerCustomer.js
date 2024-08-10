import "../../../styles/registerCustomer.css";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import firebaseConfig from "../../common/config";
import backIcon from "../../../public/icons/back-icon.svg";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

const renderRegisterCustomer = (container) => {
  document.body.style.backgroundColor = "#00258c";

  container.innerHTML = `
  <main id="registerCustomerPage">
  <header>
    <div class="mainHeader">
      <button id="backButton" class="backButton" 
      type="button">
        <img src=${backIcon} alt="Back Icon"/>
      </button>
    </div>
  </header>

  <section class="mainArea">
    <div class="registerCustomer" id="registerCustomer">
      <h1>Daftarkan Akun Anda</h1>
      <form class="registerForm" id="registerForm">
        <div class="formLabel">
          <label for="customerName">Nama Lengkap</label>
          <input type="text" id="customerName"
            name="customerName" class="input" required />
        </div>

        <div class="formLabel">
          <label for="customerEmail">Email</label>
          <input type="email" id="customerEmail"
            name="customerEmail" class="input" required />
        </div>

        <div class="formLabel">
          <label for="customerPassword">Password</label>
          <input type="password" id="customerPassword"
            name="customerPassword" class="input" required />
          <div class="inputContainer">
            <label for="showPassword">
              <input type="checkbox" class="passwordCheckbox"
                id="showPassword" />
              Tampilkan Password
            </label>
          </div>
        </div>
        <button type="submit"  class="blueButton">
          Daftar
        </button>
      </form>
      <div class="loginContainer">
        <p>
          Sudah punya akun?
          <a href="/loginCustomer">Masuk Disini!</a>
        </p>
      </div>
    </div>

    <div class="headlineContainer">
      <div class="registerHeadline">
        <h1>
          Dukung Usaha Lokal Di Sekitar Anda Mulai Hari Ini!
        </h1>
        <p>
          Bergabung bersama kami akan memberi anda akses langsung ke
          berbagai usaha dan jasa lokal. Anda dapat menemukan beragam penjual
          untuk memenuhi kebutuhan anda, hubungi penjual secara langsung,
          temukan lokasi usaha dengan mudah, dan jelajahi semua produk untuk
          membuat keputusan belanja yang lebih tepat!
        </p>
      </div>
    </div>
  </section>
</main>
`;

  const backButton = document.querySelector("#backButton");
  const showPasswordCheck = document.querySelector("#showPassword");

  showPasswordCheck.addEventListener("change", () => {
    const passwordInput = document.getElementById("customerPassword");
    const type = showPasswordCheck.checked ? "text" : "password";
    passwordInput.setAttribute("type", type);
  });

  backButton.addEventListener("click", () => {
    window.history.replaceState(null, null, "/");
    window.location.href = "/";
  });

  const registerForm = document.querySelector("#registerForm");
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const customerName = document.getElementById("customerName").value;
    const customerEmail = document.getElementById("customerEmail").value;
    const customerPassword = document.getElementById("customerPassword").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        customerEmail,
        customerPassword,
      );

      await createUserProfile(
        userCredential.user.uid,
        customerName,
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
    customerName,
  ) => {
    try {
      const userProfile = {
        customerName,
      };

      console.log("Membuat profil pengguna menggunakan data:", userProfile);

      await setDoc(doc(firestore, "customers", userId), userProfile);

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
    console.log(error.message);
    alert("Pendaftaran gagal. Silakan coba lagi.");
  }

  function redirectToLogin() {
    window.location.href = "/loginCustomer";
  }
};

export default renderRegisterCustomer;
