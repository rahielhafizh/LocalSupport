import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore, doc, getDoc, updateDoc,
} from "firebase/firestore";
import "../../../styles/profileCustomer.css";
import firebaseConfig from "../../common/config";

// Importing image and icon assets for profile seller page
import backIcon from "../../../public/icons/back-icon.svg";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const renderProfileCustomer = (container) => {
  document.body.style.backgroundColor = "#00258c";

  container.innerHTML = `
  <main id="profileCustomerPage">
      <header>
        <div class="mainHeader">
          <button id="backButton" class="backButton" type="button">
            <img src=${backIcon} alt="Back Icon"/>
          </button>
        </div>
      </header>

      <section class="profileManagementSection" id="profileManagementSection">
        <div class="profileManagementArea" id="profileManagementArea">
          <h1>Perbarui Data Profil Anda</h1>
          <form class="profileManagementForm" id="profileManagementForm">
            <div class="formLabel">
              <label for="customerName">Nama Lengkap</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                class="input"
                required />
            </div>

            <div class="updateProfileButton">
              <button class="blueButton" id="updateProfileData">Simpan</button>
            </div>
          </form>
        </div>
      </section>
    </main>
    `;

  container.querySelector("#backButton").addEventListener("click", () => {
    window.location.href = "/dashboardCustomer";
  });

  const profileForm = document.getElementById("profileManagementForm");

  const populateForm = async (userId) => {
    try {
      const customerDocRef = doc(db, `customers/${userId}`);
      const customerDocSnap = await getDoc(customerDocRef);

      if (customerDocSnap.exists()) {
        const customerData = customerDocSnap.data();
        const {
          customerName,
        } = customerData;

        profileForm.customerName.value = customerName || "";
      } else {
        console.error("Dokumen pelanggan tidak ditemukan");
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat memuat informasi pelanggan:", error);
    }
  };

  const updateProfileData = async (userId) => {
    try {
      const customerDocRef = doc(db, `customers/${userId}`);
      const updatedData = {
        customerName: profileForm.customerName.value,
      };
      await updateDoc(customerDocRef, updatedData);
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Terjadi kesalahan saat memperbarui profil:", error);
      alert("Gagal memperbarui profil. Silakan coba lagi.");
    }
  };

  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const userId = auth.currentUser.uid;
    updateProfileData(userId);
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userId = user.uid;
      populateForm(userId);
    } else {
      console.error("Pengguna tidak terautentikasi");
    }
  });
};

export default renderProfileCustomer;
