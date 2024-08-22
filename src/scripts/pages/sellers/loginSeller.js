import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import '../../../styles/loginSeller.css';
import firebaseConfig from '../../common/config';
import backIcon from "../../../public/icons/back-icon.svg";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

const renderLoginSeller = (container) => {
  document.body.style.backgroundColor = '#00258c';

  container.innerHTML = `
    <main id="loginSellerPage">
      <header>
        <div class="mainHeader">
          <button id="backButton" class="backButton" type="button">
            <img src=${backIcon} alt="Back Icon"/>
          </button>
        </div>
      </header>

      <section class="mainArea">
        <div class="loginSeller" id="loginSeller">
          <h1>Masukkan Akun Anda</h1>
          <form class="loginForm" id="loginForm">
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
                  Tampilkan Password
                </label>
              </div>
            </div>
            <button type="submit" class="blueButton" id="submitSeller">Masuk</button>
          </form>
          <div class="loginContainer">
            <p>
              Belum punya akun? <a href="/registerSeller">Daftar Disini!</a>
            </p>
          </div>
        </div>

        <div class="headlineContainer">
          <div class="loginHeadline">
            <h1>Mulai kembangkan dan promosikan usaha anda sekarang!</h1>
            <p>
              Selamat datang kembali! Mencatat dengan mudah, mengevaluasi dengan
              cepat, dan mempromosikan dengan lebih luas. Akses langsung ke
              pengelolaan bisnis Anda dengan login yang aman dan efisien. Mari
              lanjutkan perjalanan menuju kesuksesan bersama kami!
            </p>
          </div>
        </div>
      </section>
    </main>
  `;

  const backButton = container.querySelector('#backButton');
  const passwordInput = container.querySelector('#sellerPassword');
  const showPasswordCheck = container.querySelector('#showPassword');

  showPasswordCheck.addEventListener('change', () => {
    const type = showPasswordCheck.checked ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
  });

  backButton.addEventListener('click', () => {
    window.history.pushState(null, null, '/');
    window.location.href = '/';
  });

  const loginForm = container.querySelector('#loginForm');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const sellerEmail = document.getElementById('sellerEmail').value;
    const sellerPassword = document.getElementById('sellerPassword').value;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        sellerEmail,
        sellerPassword,
      );

      const userDocRef = doc(firestore, 'sellers', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        console.log('Login berhasil dilakukan:', userCredential);
        handleLoginSuccess(userCredential);
      } else {
        throw new Error("Anda tidak terdaftar sebagai seller.");
      }
    } catch (error) {
      console.error("Login gagal dilakukan:", error.message);
      handleLoginError(error);
    }
  });

  const handleLoginSuccess = (userCredential) => {
    const { user } = userCredential;
    if (user) {
      window.location.href = '/dashboardSeller';
    } else {
      console.error('Pengguna tidak terautentikasi');
    }
  };

  const handleLoginError = (error) => {
    let errorMessage;
    switch (error.code) {
      case 'auth/invalid-credential':
        errorMessage = "Email dan password tidak sesuai";
        break;
      case 'auth/network-request-failed':
        errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
        break;
      default:
        errorMessage = error.message;
        break;
    }
    alert(errorMessage);
  };
};

export default renderLoginSeller;
