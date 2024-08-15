import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import "../../../styles/dashboardCustomer.css";
import firebaseConfig from "../../common/config";
import profileIcon from "../../../public/icons/profile-icon.svg";
import closeIcon from "../../../public/icons/close-icon.svg";
import catalogIcon from "../../../public/icons/catalog-icon.svg";
import reviewIcon from "../../../public/icons/comment-icon.svg";
import locationIcon from "../../../public/icons/location-icon.svg";
import bookmarkIcon from "../../../public/icons/bookmark-icon.svg";
import bookmarkedIcon from "../../../public/icons/bookmarked-icon.svg";
import phoneIcon from "../../../public/icons/phone-icon.svg";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const renderDashboardCustomerPage = async (container) => {
  document.body.style.backgroundColor = "#f7f9ff";
  container.innerHTML = `
    <main id="dashboardCustomerPage">
      <header>
        <div class="headerBar">
          <div class="headerTitle">
            <button class="sellersButton" id="profilePage">
              <img src="${profileIcon}" alt="Profile Icon" />
            </button>
            <h1 id="customerName">BantuLokal</h1>
          </div>
          <div class="headerButton">
            <button class="whiteButton" id="savedPage">
              <a href="/savedSeller"></a>Disimpan
            </button>
          </div>
        </div>
      </header>

      <section class="sellerList" id="sellerList">
        <div class="searchSellerArea" id="searchSellerArea">
          <div class="searchSeller">
            <input
              type="text"
              id="searchSeller"
              name="searchSeller"
              class="searchSellerInput"
              placeholder="Temukan yang anda butuhkan" />
            <button class="blueButton" id="searchSellerButton">Cari</button>
          </div>
          <div class="sortArea" id="sortArea">
            <label for="dropdown">Urutkan Penjual Berdasarkan</label>
            <select id="sortListOption" name="dropdown" class="dropdownButton">
              <option value="ascending" id="ascending">A-Z</option>
              <option value="descending" id="descending">Z-A</option>
            </select>
            <button class="whiteButton" id="sortList">Urutkan</button>
          </div>
        </div>

        <div class="sellerListHeader" id="sellerListHeader">
          <h1>Daftar Usaha Lokal</h1>
        </div>

        <div class="sellerInformationArea">
          <div class="sellerProductCatalog" id="sellerProductCatalog" style="display: none;">
            <div class="sellerCatalogHeader" id="sellerCatalogHeader">
              <h1 id="catalogMarketName">Nama Usaha</h1>
              <div class="closeCatalog">
                <button class="sellersButton" id="closeCatalogButton">
                  <img src="${closeIcon}" alt="Back Icon"/>
                </button>
              </div>
            </div>
            <div class="sellerProductList" id="sellerProductList">
              <!-- Seller Products will be populated here -->
            </div>
          </div>

          <div class="sellerReviewArea" id="sellerReviewArea" style="display: none;">
            <div class="sellerReviewHeader" id="sellerReviewHeader">
              <h1 id="reviewMarketName">Nama Usaha</h1>
              <div class="closeCatalog">
                <button class="sellersButton" id="closeReviewButton">
                  <img src="${closeIcon}" alt="Back Icon"/>
                </button>
              </div>
            </div>
            <div class="sellerReviewList" id="sellerReviewList">
              <!-- Seller Reviews will be populated here -->
            </div>
            <div class="sellerReviewPost" id="sellerReviewPost">
              <textarea
                id="reviewInput"
                name="sellerReviewPost"
                class="sellerReviewInput"
                placeholder="Bagikan penilaian anda"></textarea>
              <button class="blueButton" id="sellerReviewSubmit">Kirim</button>
            </div>
          </div>
        </div>

        <div class="sellerListArea" id="sellerListArea">
          <!-- Seller Area will be populated here -->
        </div>
      </section>
    </main>
    <footer>
      <div class="footerBar">
        <h1>Platform Pendukung Usaha Lokal Indonesia</h1>
      </div>
    </footer>
  `;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userId = user.uid;
      try {
        const customerDocRef = doc(db, `customers/${userId}`);
        const customerDocSnap = await getDoc(customerDocRef);

        if (customerDocSnap.exists()) {
          const customerData = customerDocSnap.data();
          const { customerName } = customerData;
          document.getElementById('customerName').innerText = customerName || "LocalSupport";
        } else {
          console.error("Dokumen pelanggan tidak ditemukan");
        }
      } catch (error) {
        console.error("Terjadi kesalahan saat memuat informasi pelanggan:", error);
      }
    } else {
      console.error("Pengguna tidak terautentikasi");
    }
  });

  const sellersRef = collection(db, "sellers");
  const sellersSnapshot = await getDocs(sellersRef);
  const sellerListArea = document.getElementById("sellerListArea");
  const sellerPromises = sellersSnapshot.docs.map(async (doc) => {
    const sellerData = { id: doc.id, ...doc.data() };
    const productsRef = collection(db, "sellers", sellerData.id, "products");
    const productsSnapshot = await getDocs(productsRef);
    sellerData.products = productsSnapshot.docs.map((productDoc) => ({
      id: productDoc.id,
      ...productDoc.data(),
    }));
    return sellerData;
  });

  const sellersData = await Promise.all(sellerPromises);

  const displaySellers = (sellers) => {
    sellerListArea.innerHTML = "";
    sellers.forEach((sellerData) => {
      const sellerDiv = document.createElement("div");
      sellerDiv.className = "sellerArea";
      sellerDiv.id = `seller-${sellerData.id}`;

      sellerDiv.innerHTML = `
      <div class="sellerDetail">
        <h1 id="marketName-${sellerData.id}">
          ${sellerData.marketName}
        </h1>
        <button class="bookmarkButton bookmarkSeller"
                id="bookmark-${sellerData.id}">
          <img src="${bookmarkIcon}"alt="Bookmark Seller"/>
        </button>
      </div>
      <div class="sellerLocation">
        <h2 id="sellerPlace-${sellerData.id}">
          ${sellerData.sellerPlace}
        </h2>
      </div>
      <div class="sellerButtonArea">
        <button class="sellersButton showAllProduct"
                id="showAllProduct-${sellerData.id}">
          <img src="${catalogIcon}" alt="Seller Product" />
        </button>
        <button class="sellersButton showMap"
                id="showMap-${sellerData.id}">
          <img src="${locationIcon}" alt="Visit Seller" />
        </button>
        <button class="sellersButton callSeller"
                id="callSeller-${sellerData.id}">
          <img src="${phoneIcon}" alt="Call Seller" />
        </button>
        <button class="sellersButton showReviewArea"
                id="showReviewArea-${sellerData.id}">
          <img src="${reviewIcon}" alt="Show Reviews" />
        </button>
      </div>
    `;
      sellerListArea.appendChild(sellerDiv);
    });

    document.querySelectorAll(".showAllProduct").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const sellerId = event.currentTarget.id.split('-')[1];
        await displaySellerProducts(sellerId);
      });
    });

    document.querySelectorAll(".showReviewArea").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const sellerId = event.currentTarget.id.split('-')[1];
        document.querySelectorAll(".showReviewArea").forEach((btn) => {
          btn.classList.remove("active");
        });
        event.currentTarget.classList.add("active");
        await displaySellerReviews(sellerId);
      });
    });

    const openMapForSeller = (sellerPlace) => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const mapsUrl = isIOS
        ? `maps://maps.apple.com/?q=${encodeURIComponent(sellerPlace)}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sellerPlace)}`;

      window.open(mapsUrl, "_blank");
    };

    document.querySelectorAll(".showMap").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const sellerId = event.currentTarget.id.split('-')[1];
        const sellerDocRef = doc(db, "sellers", sellerId);
        const sellerDoc = await getDoc(sellerDocRef);
        const sellerData = sellerDoc.data();
        const { sellerPlace } = sellerData;

        openMapForSeller(sellerPlace);
      });
    });

    document.querySelectorAll(".callSeller").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const sellerId = event.currentTarget.id.split('-')[1];
        const sellerDocRef = doc(db, "sellers", sellerId);
        const sellerDoc = await getDoc(sellerDocRef);
        const sellerData = sellerDoc.data();
        const { sellerNumber } = sellerData;
        window.location.href = `tel:${sellerNumber}`;
      });
    });

    document.querySelectorAll(".bookmarkSeller").forEach((button) => {
      button.addEventListener("click", async (event) => {
        const sellerId = event.currentTarget.id.split('-')[1];
        await toggleBookmarkSeller(sellerId);
      });
    });

    loadSavedSellers();
  };

  displaySellers(sellersData);

  document.getElementById("sortList").addEventListener("click", () => {
    const sortOption = document.getElementById("sortListOption").value;
    const sortedSellers = sellersData.sort((a, b) => {
      const nameA = a.marketName.toUpperCase();
      const nameB = b.marketName.toUpperCase();
      if (sortOption === "ascending") {
        return nameA.localeCompare(nameB);
      }
      return nameB.localeCompare(nameA);
    });
    displaySellers(sortedSellers);
  });

  document.getElementById("searchSellerButton").addEventListener("click", () => {
    const searchValue = document.getElementById("searchSeller").value.toLowerCase();
    const filteredSellers = sellersData.filter((seller) =>
      seller.marketName.toLowerCase().includes(searchValue)
      || seller.products.some((product) => product.name.toLowerCase().includes(searchValue)));
    displaySellers(filteredSellers);
    document.getElementById("searchSeller").value = "";
  });

  document.getElementById("closeCatalogButton").addEventListener("click", () => {
    document.getElementById("sellerProductCatalog").style.display = "none";
  });

  document.getElementById("closeReviewButton").addEventListener("click", () => {
    document.getElementById("sellerReviewArea").style.display = "none";
  });

  document.getElementById("savedPage").addEventListener("click", () => {
    window.location.href = "/savedSeller";
  });

  document.getElementById("profilePage").addEventListener("click", () => {
    window.location.href = "/profileCustomer";
  });

  document.getElementById("sellerReviewSubmit").addEventListener("click", async () => {
    const reviewText = document.getElementById("reviewInput").value;
    const activeButton = document.querySelector(".showReviewArea.active");
    const sellerId = activeButton ? activeButton.id.split('-')[1] : null;
    const userId = auth.currentUser.uid;

    if (sellerId && reviewText.trim() !== "") {
      const customerDocRef = doc(db, "customers", userId);
      const customerDoc = await getDoc(customerDocRef);
      const { customerName } = customerDoc.data();

      const newReviewRef = doc(collection(db, "sellers", sellerId, "customerReview"));

      await setDoc(newReviewRef, {
        customerName,
        review: reviewText,
      });

      document.getElementById("reviewInput").value = "";
      await displaySellerReviews(sellerId);
    }
  });
};

const loadSavedSellers = async () => {
  const user = auth.currentUser;
  if (user) {
    const customerId = user.uid;
    const savedSellersRef = collection(db, "customers", customerId, "savedSeller");
    const savedSellersSnapshot = await getDocs(savedSellersRef);

    savedSellersSnapshot.forEach((doc) => {
      const sellerId = doc.id;
      const bookmarkButton = document
        .getElementById(`bookmark-${sellerId}`)
        .querySelector("img");
      if (bookmarkButton) {
        bookmarkButton.src = bookmarkedIcon;
      }
    });
  }
};

const displaySellerProducts = async (sellerId) => {
  const sellerDocRef = doc(db, "sellers", sellerId);
  const sellerDoc = await getDoc(sellerDocRef);
  const sellerData = sellerDoc.data();

  const catalogHeader = document.getElementById("catalogMarketName");
  catalogHeader.textContent = sellerData.marketName;

  const productsRef = collection(db, "sellers", sellerId, "products");
  const productsSnapshot = await getDocs(productsRef);
  const productList = document.getElementById("sellerProductList");

  productList.innerHTML = "";
  productsSnapshot.forEach((doc) => {
    const productData = doc.data();
    const productDiv = document.createElement("div");
    productDiv.className = "sellerProduct";

    productDiv.innerHTML = `
      <img src="${productData.imageUrl}" alt="Product Image" />
      <h1 id="name">${productData.name}</h1>
      <h2 id="sellPrice">${productData.sellPrice}</h2>
    `;
    productList.appendChild(productDiv);
  });

  document.getElementById("sellerProductCatalog").style.display = "block";
};

const displaySellerReviews = async (sellerId) => {
  const sellerDocRef = doc(db, "sellers", sellerId);
  const sellerDoc = await getDoc(sellerDocRef);
  const sellerData = sellerDoc.data();

  const reviewHeader = document.getElementById("reviewMarketName");
  reviewHeader.textContent = sellerData.marketName;

  const reviewsRef = collection(db, "sellers", sellerId, "customerReview");
  const reviewsSnapshot = await getDocs(reviewsRef);
  const reviewList = document.getElementById("sellerReviewList");

  reviewList.innerHTML = "";
  reviewsSnapshot.forEach((doc) => {
    const reviewData = doc.data();
    const reviewDiv = document.createElement("div");
    reviewDiv.className = "sellerReview";

    reviewDiv.innerHTML = `
      <h1 id="customerName">${reviewData.customerName}</h1>
      <h2 id="customerReview">${reviewData.review}</h2>
    `;
    reviewList.appendChild(reviewDiv);
  });

  document.getElementById("sellerReviewArea").style.display = "block";
};

const toggleBookmarkSeller = async (sellerId) => {
  const user = auth.currentUser;
  if (user) {
    const customerId = user.uid;
    const customerDocRef = doc(db, "customers", customerId);
    const savedSellerRef = doc(customerDocRef, "savedSeller", sellerId);

    const savedSellerDoc = await getDoc(savedSellerRef);

    const bookmarkButton = document
      .getElementById(`bookmark-${sellerId}`)
      .querySelector("img");

    if (savedSellerDoc.exists()) {
      await deleteDoc(savedSellerRef);
      bookmarkButton.src = bookmarkIcon;
    } else {
      await setDoc(savedSellerRef, { sellerId });
      bookmarkButton.src = bookmarkedIcon;
    }
  }
};

export default renderDashboardCustomerPage;
