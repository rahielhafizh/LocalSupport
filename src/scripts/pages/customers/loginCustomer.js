import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import '../../../styles/loginCustomer.css';
import firebaseConfig from '../../common/config';
import backIcon from "../../../public/icons/back-icon.svg";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

const renderLoginCustomer = (container) => {
  document.body.style.backgroundColor = '#00258c';

  container.innerHTML = `
  <main id="loginCustomerPage">
      <header>
        <div class="mainHeader">
          <button id="backButton" class="backButton" type="button">
            <img src=${backIcon} alt="Back Icon"/>
          </button>
        </div>
      </header>

      <section class="mainArea">
        <div class="loginCustomer" id="loginCustomer">
          <h1>Masukkan Akun Anda</h1>
          <form class="loginForm" id="loginForm">
            <div class="formLabel">
              <label for="customerEmail">Email</label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                class="input"
                required />
            </div>

            <div class="formLabel">
              <label for="customerPassword">Password</label>
              <input
                type="password"
                id="customerPassword"
                name="customerPassword"
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
            <button type="submit" class="blueButton">Masuk</button>
          </form>
          <div class="loginContainer">
            <p>
              Belum punya akun? <a href="/registerCustomer">Daftar Disini!</a>
            </p>
          </div>
        </div>

        <div class="headlineContainer">
          <div class="loginHeadline">
            <h1>Selamat datang kembali! </h1>
            <p>
            Masuk untuk mengakses berbagai penjual dan penyedia jasa lokal. Temukan kebutuhan anda, hubungi penjual, dan nikmati kemudahan menemukan lokasi penjual. Bersama kita mendukung pertumbuhan usaha lokal dan menciptakan pengalaman belanja yang lebih berarti.
          </div>
        </div>
      </section>
    </main>
    `;

  const backButton = container.querySelector('#backButton');
  const passwordInput = container.querySelector('#customerPassword');
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

    const customerEmail = document.getElementById('customerEmail').value;
    const customerPassword = document.getElementById('customerPassword').value;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        customerEmail,
        customerPassword,
      );
      console.log('Login berhasil dilakukan:', userCredential);

      handleLoginSuccess(userCredential);
    } catch (error) {
      console.error('Login gagal:', error.message);
      const errorMessage = document.querySelector('.error-message');
      errorMessage.textContent = error.message;
      handleLoginError(error);
    }
  });

  const handleLoginSuccess = (userCredential) => {
    const { user } = userCredential;
    if (user) {
      window.location.href = '/dashboardCustomer';
    } else {
      console.error('Pengguna tidak terautentikasi');
    }
  };

  const handleLoginError = (error) => {
    console.error('Login gagal :', error.message);
    const errorMessage = document.querySelector('.error-message');
    errorMessage.textContent = error.message;
  };
};

export default renderLoginCustomer;
