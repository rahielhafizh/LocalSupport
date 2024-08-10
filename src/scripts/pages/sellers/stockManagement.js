// Import styles and Firebase modules
import "../../../styles/stockManagement.css";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import firebaseConfig from "../../common/config";

// Importing image and icon assets for stock management page
import profileIcon from "../../../public/icons/profile-icon.svg";
import cartIcon from "../../../public/icons/cart-icon.svg";
import menuIcon from "../../../public/icons/menu-icon.svg";

// Initialize Firebase app and services
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Function to render the seller's restock page
const renderStockManagementPage = (container) => {
  // Set the HTML structure for the restock page
  container.innerHTML = `
    <main id="stockManagementPage">
        <header>
            <div class="headerBar">
                <div class="headerTitle">
                    <button class="sellerButton" id="profilePage">
                        <img src=${profileIcon} alt="Profile Icon" />
                    </button>
                    <h1 id="marketName">Loading</h1>
                </div>
                <div class="headerButton" id="navigationButton">
                    <button class="whiteButton" id="productPage">Produk</button>
                    <button class="whiteButton" id="reportsPage">Laporan</button>
                    <button class="whiteButton" id="dashboardPage">Beranda</button>
                </div>
                <div class="headerButton" id="controlButton">
                    <button class="sellerButton" id="openCartButton">
                        <img src=${cartIcon} alt="Cart Icon" />
                    </button>
                    <button class="sellerButton" id="openNavigation">
                        <img src=${menuIcon} alt="Menu Icon" />
                    </button>
                </div>
            </div>
        </header>

        <section class="mainControlArea">
            <div class="mainDevelopment">
                <div class="dateDevelopmentArea">
                    <label for="restockDate" class="titleControlArea">Tanggal</label>
                    <input type="date" id="restockDate" name="restockDate"
                          class="stockInput" />
                    <button class="blueButton" id="updateRestockDate">Simpan</button>
                </div>

                <div class="searchProductArea">
                    <label for="searchProduct" class="titleControlArea">Cari</label>
                    <input type="text" id="searchProduct" name="searchProduct"
                          class="stockInput" placeholder="Cari Produk"/>
                    <button class="blueButton" id="searchProductButton">Cari</button>
                </div>
            </div>
        </section>

        <section class="productListArea" id="productListArea">
            <!-- Products will be dynamically added here -->
        </section>

        <section class="restockCartArea" id="restockCartArea" style="display: none;">
            <div class="restockCartTitle">
                <h1>Tambahkan Stok Produk Anda</h1>
            </div>
            <div id="restockCartProduct" class="cartProductContainer">
                <!-- Cart products will be dynamically added here -->
            </div>
            <div class="restockCartFooter">
                <div class="restockCartCalculation">
                    <div class="restockCartTotal">
                        <h1>Total Harga :</h1>
                        <h1 id="restockCartTotalPrice">0</h1>
                    </div>
                    <div class="restockCartTotal">
                        <h1>Total Produk :</h1>
                        <h1 id="restockCartTotalProduct">0</h1>
                    </div>
                </div>
                <div class="restockCartButton">
                    <button class="blueButton" id="confirmRestock">Konfirmasi</button>
                    <button class="whiteButton" id="resetCart">Reset</button>
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

  // Initialize empty arrays to hold products and cart items
  let products = [];
  let cart = {};

  // Function to load seller products from Firestore
  const loadSellerProducts = async (userId) => {
    try {
      const products = [];
      const querySnapshot = await getDocs(
        collection(db, `sellers/${userId}/products`),
      );
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      return products;
    } catch (error) {
      console.error("Terjadi kesalahan saat memuat produk:", error);
      return [];
    }
  };

  // Function to display products on the restock
  const displayProducts = (products) => {
    const productListArea = container.querySelector("#productListArea");
    productListArea.innerHTML = "";

    // Sort products by name A-Z
    products.sort((a, b) => a.name.localeCompare(b.name));

    products.forEach((product) => {
      const productHTML = `
        <div class="productSelection" data-product-id="${product.id}">
            <img id="imagePreview" src="${product.imageUrl || "/src/Dummy Photos.png"}" alt="Preview Gambar" />
                <h1 id="productName">${product.name}</h1>
                <h2 id="productBuyPrice">${product.buyPrice}</h2>
                <div class="stockAmount">
                    <h1>Stok :</h1>
                    <h1 id="stockAmount">${product.stock}</h1>
                </div>
                <div class="productButton">
                    <button class="blueButton addRestockCartProduct">Tambah</button>
                    <button class="whiteButton reduceRestockCartProduct">Hapus</button>
                </div>
            </div>
      `;
      productListArea.insertAdjacentHTML("beforeend", productHTML);

      // Mark product with zero stock
      if (product.stock === 0) {
        const productElement = productListArea.querySelector(`.productSelection[data-product-id="${product.id}"]`);
        const stockAmountElement = productElement.querySelector("#stockAmount");
        stockAmountElement.textContent = "HABIS";
        stockAmountElement.style.color = "red";
      }
    });

    // Add event listeners for "Tambah" and "Hapus" buttons
    productListArea
      .querySelectorAll(".addRestockCartProduct")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          const { productId } = e.target.closest(".productSelection").dataset;
          addProductToCart(productId);
          showCart();
        });
      });
    productListArea
      .querySelectorAll(".reduceRestockCartProduct")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          const { productId } = e.target.closest(".productSelection").dataset;
          reduceProductFromCart(productId);
          showCart();
        });
      });
  };

  const showCart = () => {
    const restockCartArea = container.querySelector("#restockCartArea");
    restockCartArea.style.display = "block";
  };

  document.getElementById('openNavigation').addEventListener('click', () => {
    const navigationButton = document.getElementById('navigationButton');
    if (navigationButton.style.display === 'flex') {
      navigationButton.style.display = 'none';
    } else {
      navigationButton.style.display = 'flex';
    }
  });

  // Function to add a product to the cart
  const addProductToCart = (productId) => {
    if (!cart[productId]) {
      const product = products.find((p) => p.id === productId);
      cart[productId] = {
        quantity: 1,
        sellPrice: product.sellPrice,
        buyPrice: product.buyPrice,
        name: product.name,
      };
    } else {
      cart[productId].quantity += 1;
    }
    updateCartDisplay();
    showCart();
  };

  // Function to reduce a product from the cart
  const reduceProductFromCart = (productId) => {
    if (cart[productId]) {
      cart[productId].quantity -= 1;
      if (cart[productId].quantity <= 0) {
        delete cart[productId];
      }
    }
    updateCartDisplay();
    showCart();
  };

  // Function to update the cart display on the Restock Page
  const updateCartDisplay = () => {
    const restockCartProducts = container.querySelector("#restockCartProduct");
    const restockCartTotalPrice = container.querySelector(
      "#restockCartTotalPrice",
    );
    const restockCartTotalProduct = container.querySelector(
      "#restockCartTotalProduct",
    );
    restockCartProducts.innerHTML = "";
    let totalPrice = 0;
    let totalProducts = 0;

    // Iterate over cart items to update total price and product count
    Object.keys(cart).forEach((productId) => {
      const product = products.find((p) => p.id === productId);
      const productQuantity = cart[productId].quantity;
      const productTotalPrice = product.sellPrice * productQuantity;
      totalPrice += productTotalPrice;
      totalProducts += productQuantity;

      // Add cart items to the display
      const cartProductHTML = `
        <div class="restockCartProduct">
            <img src="${product.imageUrl || "../../../public/images/dummyImage.jpg"}" alt="${product.name}" />
                <div class="restockCartProductDetail">
                <h1>${product.name}</h1>
                <h2>${product.buyPrice}</h2>
                </div>
                <div class="restockCartProductAmount">
                    <h1>Jumlah :</h1>
                <h1>${productQuantity}</h1>
                </div>
            </div>
      `;
      restockCartProducts.insertAdjacentHTML("beforeend", cartProductHTML);
    });

    // Update total price and product count in the cart display
    restockCartTotalPrice.textContent = totalPrice;
    restockCartTotalProduct.textContent = totalProducts;
  };

  // Function to reset the cart
  const resetCart = () => {
    cart = {};
    updateCartDisplay();
  };

  // Function to confirm the cart and save the transaction to Firestore
  const confirmCart = async (userId) => {
    const restockDate = container.querySelector("#restockDate").value;
    const formattedDate = restockDate.split("-").reverse().join("-");
    try {
      const transactionsRef = doc(
        db,
        `sellers/${userId}/transactionsOutcome`,
        formattedDate,
      );
      const transactionsSnap = await getDoc(transactionsRef);

      let transactionsOutcome = [];

      // Check if there are existing transactions for the given date
      if (transactionsSnap.exists() && transactionsSnap.data().transactionsOutcomeProducts) {
        transactionsOutcome = transactionsSnap.data().transactionsOutcomeProducts;
      }

      // Iterate over cart items and add them to transactionsOutcome
      Object.keys(cart).forEach((productId) => {
        const cartItem = cart[productId];
        const existingTransactionIndex = transactionsOutcome.findIndex(
          (transaction) => transaction.productId === productId,
        );
        if (existingTransactionIndex >= 0) {
          // If product already exists in transactionsOutcome, update its quantity
          transactionsOutcome[existingTransactionIndex].quantity += cartItem.quantity;
        } else {
          // If product does not exist, add it to transactionsOutcome
          transactionsOutcome.push({
            productId,
            quantity: cartItem.quantity,
            sellPrice: cartItem.sellPrice,
            buyPrice: cartItem.buyPrice,
            name: cartItem.name,
          });
        }
      });

      // Update stock in Firestore
      await Promise.all(Object.keys(cart).map(async (productId) => {
        const productRef = doc(db, `sellers/${userId}/products`, productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const currentStock = productSnap.data().stock;
          const updatedStock = currentStock + cart[productId].quantity;
          await setDoc(productRef, { stock: updatedStock }, { merge: true });
          updateProductDisplay(productId, updatedStock);
        }
      }));

      // Save updated transactionsOutcome back to Firestore
      await setDoc(transactionsRef, { transactionsOutcomeProducts: transactionsOutcome });
      alert("Pembelian berhasil dikonfirmasi!");
      resetCart();
    } catch (error) {
      console.error("Terjadi kesalahan saat mengonfirmasi belanja:", error);
    }
  };

  const updateProductDisplay = (productId, updatedStock) => {
    const productElement = container.querySelector(`.productSelection[data-product-id="${productId}"]`);
    if (productElement) {
      const stockAmountElement = productElement.querySelector("#stockAmount");
      stockAmountElement.textContent = updatedStock;
    }
  };

  // Function to load and display products for the seller
  const loadAndDisplayProducts = async (userId) => {
    products = await loadSellerProducts(userId);
    displayProducts(products);
  };

  // Function to load and display market name
  const loadAndDisplayMarketName = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, "sellers", userId));
      if (userDoc.exists()) {
        const { marketName } = userDoc.data();
        container.querySelector("#marketName").textContent = marketName;
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat memuat nama usaha:", error);
    }
  };

  // Function to update the restock date and save it to Firestore
  const handleUpdateRestockDate = async (userId) => {
    const restockDate = container.querySelector("#restockDate").value;
    const formattedDate = restockDate.split("-").reverse().join("-");
    try {
      const docRef = doc(
        db,
        `sellers/${userId}/transactionsOutcome`,
        formattedDate,
      );
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, { transactionsOutcomeProducts: [] });
      }

      alert("Tanggal belanja berhasil diperbarui!");
    } catch (error) {
      console.error("Terjadi kesalahan saat memperbarui tanggal belanja:", error);
    }
  };

  // Function to save today's date if it does not exist in Firestore
  const saveTodayDateIfNotExists = async (userId) => {
    const today = new Date().toISOString().split("T")[0];
    const formattedDate = today.split("-").reverse().join("-");
    try {
      const docRef = doc(
        db,
        `sellers/${userId}/transactionsOutcome`,
        formattedDate,
      );
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, { transactionsOutcomeProducts: [] });
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat menetapkan tanggal hari ini:", error);
    }
  };

  // Function to search for products by name
  const searchProduct = () => {
    const searchProductInput = container
      .querySelector("#searchProduct")
      .value.toLowerCase();
    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchProductInput));
    displayProducts(filteredProducts);
  };

  container
    .querySelector("#searchProductButton")
    .addEventListener("click", searchProduct);

  // Function to handle navigation
  const navigateTo = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // Add event listeners for update restock date buttons
  container.querySelector("#updateRestockDate").addEventListener("click", async () => {
    const userId = auth.currentUser.uid;
    await handleUpdateRestockDate(userId);
  });

  // Add event listeners for open restock cart buttons
  container.querySelector("#openCartButton").addEventListener("click", () => {
    const restockCartArea = container.querySelector("#restockCartArea");
    restockCartArea.style.display = restockCartArea.style.display === "none" ? "block" : "none";
  });

  container.querySelector("#resetCart").addEventListener("click", resetCart);

  container
    .querySelector("#confirmRestock")
    .addEventListener("click", async () => {
      const userId = auth.currentUser.uid;
      await confirmCart(userId);
    });

  container.querySelector("#productPage").addEventListener("click", () => {
    window.location.href = "/productManagement";
  });

  container.querySelector("#dashboardPage").addEventListener("click", () => {
    window.location.href = "/dashboardSeller";
  });

  container.querySelector("#reportsPage").addEventListener("click", () => {
    window.location.href = "/transactionReport";
  });

  container.querySelector("#profilePage").addEventListener("click", () => {
    window.location.href = "/profileSeller";
  });

  // Listen for authentication state changes and load data accordingly
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userId = user.uid;
      const today = new Date().toISOString().split("T")[0];
      container.querySelector("#restockDate").value = today;
      loadAndDisplayMarketName(userId);
      saveTodayDateIfNotExists(userId);
      loadAndDisplayProducts(userId);
    }
  });
};

export default renderStockManagementPage;
