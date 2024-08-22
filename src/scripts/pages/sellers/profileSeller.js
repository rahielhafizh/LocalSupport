import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore, doc, getDoc, updateDoc,
} from "firebase/firestore";
import "../../../styles/profileSeller.css";
import firebaseConfig from "../../common/config";
import backIcon from "../../../public/icons/back-icon.svg";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const renderProfileSeller = (container) => {
  document.body.style.backgroundColor = "#00258c";

  container.innerHTML = `
  <main id="profileSellerPage">
      <header>
        <div class="mainHeader">
          <button id="backButton" class="backButton" type="button">
            <img src=${backIcon} alt="Back Icon"/>
          </button>
        </div>
      </header>

      <section class="profileManagementSection" id="profileManagementSection">
        <div class="profileManagementArea" id="profileManagementArea">
          <h1>Perbarui Data Usaha Anda</h1>
          <form class="profileManagementForm" id="profileManagementForm">
            <div class="formLabel">
              <label for="ownerName">Nama Pemilik</label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                class="input"
                required />
            </div>

            <div class="formLabel">
              <label for="marketName">Nama Usaha</label>
              <input
                type="text"
                id="marketName"
                name="marketName"
                class="input"
                required />
            </div>

            <div class="formLabel">
              <label for="sellerNumber">Nomor Telepon</label>
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

            <div class="updateProfileButton">
              <button class="blueButton" id="updateProfileData">Simpan</button>
            </div>
          </form>
        </div>
      </section>
    </main>
    `;

  container.querySelector("#backButton").addEventListener("click", () => {
    window.location.href = "/dashboardSeller";
  });

  const profileForm = document.getElementById("profileManagementForm");

  const populateForm = async (userId) => {
    try {
      const sellerDocRef = doc(db, `sellers/${userId}`);
      const sellerDocSnap = await getDoc(sellerDocRef);

      if (sellerDocSnap.exists()) {
        const sellerData = sellerDocSnap.data();
        const {
          ownerName, marketName, sellerNumber, sellerPlace,
        } = sellerData;

        profileForm.ownerName.value = ownerName || "";
        profileForm.marketName.value = marketName || "";
        profileForm.sellerNumber.value = sellerNumber || "";
        profileForm.sellerPlace.value = sellerPlace || "";
      } else {
        console.error("Dokumen penjual tidak ditemukan");
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat memuat informasi penjual:", error);
    }
  };

  const updateProfileData = async (userId) => {
    try {
      const sellerDocRef = doc(db, `sellers/${userId}`);
      const updatedData = {
        ownerName: profileForm.ownerName.value,
        marketName: profileForm.marketName.value,
        sellerNumber: profileForm.sellerNumber.value,
        sellerPlace: profileForm.sellerPlace.value,
      };
      await updateDoc(sellerDocRef, updatedData);
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Kesalahan saat memperbarui data profil:", error);
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

export default renderProfileSeller;
