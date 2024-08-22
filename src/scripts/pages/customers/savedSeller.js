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
import "../../../styles/savedSeller.css";
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

const renderSavedSellerPage = async (container) => {
  document.body.style.backgroundColor = "#f7f9ff";

  container.innerHTML = `
  <main id="savedSellerPage">
    <header>
      <div class="headerBar">
        <div class="headerTitle">
          <button class="sellersButton" id="profilePage">
            <img src=${profileIcon} alt="Profile Icon" />
          </button>
          <h1 id="customerName">BantuLokal</h1>
        </div>
        <div class="headerButton">
          <button class="whiteButton" id="dashboardCustomer">
            <a href="/dashboardCustomer"></a>Beranda
          </button>
        </div>
      </div>
    </header>

    <section class="savedSellerList" id="savedSellerList">
      <div class="savedSellerListHeader" id="savedSellerListHeader">
        <h1>Usaha Lokal yang Anda Simpan</h1>
      </div>

      <div class="sellerInformationArea">
        <div class="sellerProductCatalog" id="sellerProductCatalog" style="display: none;">
          <div class="sellerCatalogHeader" id="sellerCatalogHeader">
            <h1 id="catalogMarketName">Nama Usaha</h1>
            <div class="closeCatalog">
              <button class="sellersButton" id="closeCatalogButton">
                <img src=${closeIcon} alt="Back Icon" />
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
                <img src=${closeIcon} alt="Back Icon" />
              </button>
            </div>
          </div>
          <div class="sellerReviewList" id="sellerReviewList">
            <!-- Seller Reviews will be populated here -->
          </div>
          <div class="sellerReviewPost" id="sellerReviewPost">
            <textarea
              type="text"
              id="reviewInput"
              name="sellerReviewPost"
              class="sellerReviewInput"
              placeholder="Bagikan pengalaman anda"></textarea>
            <button class="blueButton" id="sellerReviewSubmit">Kirim</button>
          </div>
        </div>
      </div>

      <div class="savedSellerListArea" id="savedSellerListArea">
        <!-- Saved Seller Area will be populated here -->
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
      const customerDocRef = doc(db, "customers", userId);
      const customerDoc = await getDoc(customerDocRef);
      const customerName = customerDoc.exists() ? customerDoc.data().customerName : "User";
      document.getElementById("customerName").textContent = customerName;
      const savedSellersRef = collection(
        db,
        "customers",
        userId,
        "savedSeller",
      );
      const savedSellersSnapshot = await getDocs(savedSellersRef);
      const sellerListArea = document.getElementById("savedSellerListArea");

      const savedSellerIds = savedSellersSnapshot.docs.map((doc) => doc.id);

      const sellersRef = collection(db, "sellers");
      const sellersSnapshot = await getDocs(sellersRef);

      const sortedSellers = sellersSnapshot.docs
        .filter((doc) => savedSellerIds.includes(doc.id))
        .sort((a, b) => {
          const aName = a.data().marketName.toLowerCase();
          const bName = b.data().marketName.toLowerCase();
          return aName.localeCompare(bName);
        });

      sortedSellers.forEach((doc) => {
        const sellerData = doc.data();
        const sellerDiv = document.createElement("div");
        sellerDiv.className = "savedSellerArea";
        sellerDiv.id = doc.id;

        sellerDiv.innerHTML = `
          <div class="savedSellerDetail" id="savedSellerDetail">
            <h1 id="marketName">${sellerData.marketName}</h1>
            <button class="bookmarkButton bookmarkSeller" id="${doc.id}">
              <img src=${bookmarkIcon} alt="Bookmark Seller"/>
            </button>      
          </div>
          <div class="sellerLocation" id="sellerLocation">
            <h2 id="sellerPlace">${sellerData.sellerPlace}</h2>
          </div>
          <div class="sellerButtonArea">
            <button class="sellersButton showAllProduct" id="${doc.id}">
              <img src=${catalogIcon} alt="Seller Product"/>
            </button>
            <button class="sellersButton showMap" id="${doc.id}">
              <img src=${locationIcon} alt="Visit Seller"/>
            </button>
            <button class="sellersButton callSeller" id="${doc.id}">
              <img src=${phoneIcon} alt="Call Seller"/>
            </button>
            <button class="sellersButton showReviewArea" id="${doc.id}">
              <img src=${reviewIcon} alt="Review Seller"/>
            </button>
          </div>
        `;
        sellerListArea.appendChild(sellerDiv);
      });

      await loadSavedSellers();

      document.querySelectorAll(".showAllProduct").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const sellerId = event.currentTarget.id;
          await displaySellerProducts(sellerId);
        });
      });

      document.querySelectorAll(".showReviewArea").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const sellerId = event.currentTarget.id;
          document.querySelectorAll(".showReviewArea").forEach((btn) => {
            btn.classList.remove("active");
          });
          event.currentTarget.classList.add("active");
          await displaySellerReviews(sellerId);
        });
      });

      const openMapForSeller = (sellerPlace) => {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sellerPlace)}`;
        const appleMapsUrl = `maps://maps.apple.com/?q=${encodeURIComponent(sellerPlace)}`;

        const newWindow = window.open(googleMapsUrl, "_blank");
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.open(appleMapsUrl, "_blank");
        }
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
          const sellerId = event.currentTarget.id;
          const sellerDocRef = doc(db, "sellers", sellerId);
          const sellerDoc = await getDoc(sellerDocRef);
          const sellerData = sellerDoc.data();
          const { sellerNumber } = sellerData;
          window.location.href = `tel:${sellerNumber}`;
        });
      });

      document.querySelectorAll(".bookmarkSeller").forEach((button) => {
        button.addEventListener("click", async (event) => {
          const sellerId = event.currentTarget.id;
          await toggleBookmarkSeller(sellerId);
        });
      });

      document
        .getElementById("closeCatalogButton")
        .addEventListener("click", () => {
          document.getElementById("sellerProductCatalog").style.display = "none";
        });

      document
        .getElementById("closeReviewButton")
        .addEventListener("click", () => {
          document.getElementById("sellerReviewArea").style.display = "none";
        });

      document.getElementById("dashboardCustomer").addEventListener("click", () => {
        window.location.href = "/dashboardCustomer";
      });

      document.getElementById("profilePage").addEventListener("click", () => {
        window.location.href = "/profileCustomer";
      });

      document
        .getElementById("sellerReviewSubmit")
        .addEventListener("click", async () => {
          const reviewText = document.getElementById("reviewInput").value;
          const activeButton = document.querySelector(".showReviewArea.active");
          const sellerId = activeButton ? activeButton.id : null;
          const userId = auth.currentUser.uid;

          if (sellerId && reviewText.trim() !== "") {
            const customerDocRef = doc(db, "customers", userId);
            const customerDoc = await getDoc(customerDocRef);
            const { customerName } = customerDoc.data();

            const reviewData = {
              customerName,
              review: reviewText,
              timestamp: new Date(),
            };

            const reviewRef = doc(
              db,
              "sellers",
              sellerId,
              "customerReview",
              userId,
            );
            await setDoc(reviewRef, reviewData);

            document.getElementById("reviewInput").value = "";
            await displaySellerReviews(sellerId);
          }
        });
    } else {
      console.log("User is not authenticated");
      container.innerHTML = "<p>Please log in to view your saved sellers.</p>";
    }
  });
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
  if (productsSnapshot.empty) {
    const noProductMessage = document.createElement("div");
    noProductMessage.className = "noProductMessage";
    noProductMessage.innerHTML = `<p id="errormessage">Saat ini belum ada produk yang tersedia. Silahkan menghubungi penjual untuk menanyakan produk atau kebutuhan Anda.</p>`;
    productList.appendChild(noProductMessage);
  } else {
    const sortedProducts = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })).sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      return nameA.localeCompare(nameB);
    });

    sortedProducts.forEach((productData) => {
      const productDiv = document.createElement("div");
      productDiv.className = "sellerProduct";

      productDiv.innerHTML = `
        <img src="${productData.imageUrl}" alt="Product Image" />
        <h1 id="name">${productData.name}</h1>
        <h2 id="sellPrice">${productData.sellPrice}</h2>
      `;
      productList.appendChild(productDiv);
    });
  }

  const productCatalogSection = document.getElementById("sellerProductCatalog");
  document.getElementById("sellerProductCatalog").style.display = "block";
  productCatalogSection.scrollIntoView({ behavior: "smooth" });
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
  if (reviewsSnapshot.empty) {
    const noReviewMessage = document.createElement("div");
    noReviewMessage.className = "noReviewMessage";
    noReviewMessage.innerHTML = `<p id="errormessage">Belum ada ulasan untuk usaha ini. Bagikan pengalaman anda dengan memberikan ulasan!</p>`;
    reviewList.appendChild(noReviewMessage);
  } else {
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
  }

  const reviewAreaSection = document.getElementById("sellerReviewArea");
  reviewAreaSection.style.display = "block";
  reviewAreaSection.scrollIntoView({ behavior: "smooth" });
};

const toggleBookmarkSeller = async (sellerId) => {
  const user = auth.currentUser;
  if (user) {
    const customerId = user.uid;
    const customerDocRef = doc(db, "customers", customerId);
    const savedSellerRef = doc(customerDocRef, "savedSeller", sellerId);

    const savedSellerDoc = await getDoc(savedSellerRef);

    const bookmarkButton = document
      .getElementById(sellerId)
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

const loadSavedSellers = async () => {
  const user = auth.currentUser;
  if (user) {
    const customerId = user.uid;
    const savedSellersRef = collection(db, "customers", customerId, "savedSeller");
    const savedSellersSnapshot = await getDocs(savedSellersRef);
    savedSellersSnapshot.forEach((doc) => {
      const sellerId = doc.id;
      const bookmarkButton = document.getElementById(sellerId).querySelector("img");
      if (bookmarkButton) {
        bookmarkButton.src = bookmarkedIcon;
      }
    });
  }
};

export default renderSavedSellerPage;
