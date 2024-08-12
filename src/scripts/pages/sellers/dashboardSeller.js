import "../../../styles/dashboardSeller.css";
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
import firebaseConfig from "../../common/config";

import profileIcon from "../../../public/icons/profile-icon.svg";
import cartIcon from "../../../public/icons/cart-icon.svg";
import menuIcon from "../../../public/icons/menu-icon.svg";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const renderDashboardSellerPage = (container) => {
  container.innerHTML = `
    <main id="dashboardSellerPage">
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
            <button class="whiteButton" id="stockPage">Stok</button>
            <button class="whiteButton" id="reportsPage">Laporan</button>
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
            <label for="checkoutDate" class="titleControlArea">Tanggal</label>
            <input type="date" id="checkoutDate"
                  name="checkoutDate" class="dashboardInput" />
            <button class="blueButton" id="updateDashboardDate">Simpan</button>
          </div>

          <div class="searchProductArea">
            <label for="searchProduct" class="titleControlArea">Cari</label>
            <input type="text" id="searchProduct"
                  name="searchProduct" class="dashboardInput"
                  placeholder="Cari Produk" />
            <button class="blueButton" id="searchProductButton">Cari</button>
          </div>
        </div>
      </section>

      <section class="productListArea" id="productListArea">
        <!-- Products will be dynamically added here -->
      </section>

      <section class="dashboardCartArea" id="dashboardCartArea"
              style="display: none;">
        <div class="dashboardCartTitle">
          <h1>Konfirmasi Transaksi Penjualan</h1>
        </div>
        <div id="dashboardCartProducts" class="cartProductContainer">
          <!-- Cart products will be dynamically added here -->
        </div>
        <div class="dashboardCartFooter">
          <div class="dashboardCartCalculation">
            <div class="dashboardCartTotal">
              <h1>Total Harga :</h1>
              <h1 id="dashboardCartTotalPrice">0</h1>
            </div>
            <div class="dashboardCartTotal">
              <h1>Total Produk :</h1>
              <h1 id="dashboardCartTotalProduct">0</h1>
            </div>
          </div>
          <div class="dashboardCartButton">
            <button class="blueButton" id="confirmTransaction">Konfirmasi</button>
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

  let products = [];
  let cart = {};

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
      console.error("Terjadi kesalahan dalam memuat produk:", error);
      return [];
    }
  };

  const displayProducts = (products) => {
    const productListArea = container.querySelector("#productListArea");
    productListArea.innerHTML = "";

    products.sort((a, b) => a.name.localeCompare(b.name));

    products.forEach((product) => {
      const productHTML = `
        <div class="productSelection" data-product-id="${product.id}">
            <img id="imagePreview" src="${product.imageUrl || "../../../public/images/dummyImage.jpg"}" alt="${product.name}" />
            <h1 id="productName">${product.name}</h1>
            <h2 id="productSellPrice">${product.sellPrice}</h2>
            <div class="stockAmount">
                <h1>Stok :</h1>
                <h1 id="stockAmount">${product.stock}</h1>
            </div>
            <div class="productButton">
                <button class="blueButton addDashboardCartProduct" ${product.stock === 0 ? "disabled" : ""}>Tambah</button>
                <button class="whiteButton reduceDashboardCartProduct">Hapus</button>
            </div>
        </div>
      `;
      productListArea.insertAdjacentHTML("beforeend", productHTML);

      if (product.stock === 0) {
        const productElement = productListArea.querySelector(
          `.productSelection[data-product-id="${product.id}"]`,
        );
        const stockAmountElement = productElement.querySelector("#stockAmount");
        stockAmountElement.textContent = "HABIS";
        stockAmountElement.style.color = "red";
      }
    });

    productListArea
      .querySelectorAll(".addDashboardCartProduct")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          const { productId } = e.target.closest(".productSelection").dataset;
          const product = products.find((p) => p.id === productId);
          if (product.stock > 0) {
            addProductToCart(productId);
            showCart();
          }
        });
      });

    productListArea
      .querySelectorAll(".reduceDashboardCartProduct")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          const { productId } = e.target.closest(".productSelection").dataset;
          reduceProductFromCart(productId);
          showCart();
        });
      });
  };

  const showCart = () => {
    const dashboardCartArea = container.querySelector("#dashboardCartArea");
    dashboardCartArea.style.display = "block";
  };

  document.getElementById("openNavigation").addEventListener("click", () => {
    const navigationButton = document.getElementById("navigationButton");
    if (navigationButton.style.display === "flex") {
      navigationButton.style.display = "none";
    } else {
      navigationButton.style.display = "flex";
    }
  });

  const addProductToCart = (productId) => {
    const product = products.find((p) => p.id === productId);
    if (!cart[productId]) {
      cart[productId] = {
        quantity: 1,
        sellPrice: product.sellPrice,
        buyPrice: product.buyPrice,
        name: product.name,
      };
    } else {
      if (cart[productId].quantity < product.stock) {
        cart[productId].quantity += 1;
      } else {
        alert(
          `Jumlah produk "${product.name}" di keranjang sudah mencapai stok yang tersedia.`,
        );
      }
    }

    updateCartDisplay();
    showCart();
  };

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

  const updateCartDisplay = () => {
    const dashboardCartProducts = container.querySelector(
      "#dashboardCartProducts",
    );
    const dashboardCartTotalPrice = container.querySelector(
      "#dashboardCartTotalPrice",
    );
    const dashboardCartTotalProduct = container.querySelector(
      "#dashboardCartTotalProduct",
    );
    dashboardCartProducts.innerHTML = "";
    let totalPrice = 0;
    let totalProducts = 0;

    Object.keys(cart).forEach((productId) => {
      const product = products.find((p) => p.id === productId);
      const productQuantity = cart[productId].quantity;
      const productTotalPrice = product.sellPrice * productQuantity;

      totalPrice += productTotalPrice;
      totalProducts += productQuantity;

      const cartProductHTML = `
        <div class="dashboardCartProduct">
            <img src="${product.imageUrl || "../../../public/images/dummyImage.jpg"}" alt="${product.name}" />
            <div class="dashboardCartProductDetail">
                <h1>${product.name}</h1>
                <h2>${product.sellPrice}</h2>
            </div>
            <div class="dashboardCartProductAmount">
                <h1>Jumlah :</h1>
                <h1>${productQuantity}</h1>
            </div>
        </div>
      `;
      dashboardCartProducts.insertAdjacentHTML("beforeend", cartProductHTML);
    });

    dashboardCartTotalPrice.textContent = totalPrice;
    dashboardCartTotalProduct.textContent = totalProducts;
  };

  const resetCart = () => {
    cart = {};
    updateCartDisplay();
  };

  const confirmCart = async (userId) => {
    const checkoutDate = container.querySelector("#checkoutDate").value;
    const formattedDate = checkoutDate.split("-").reverse().join("-");
    try {
      const transactionsRef = doc(
        db,
        `sellers/${userId}/transactionsIncome`,
        formattedDate,
      );
      const transactionsSnap = await getDoc(transactionsRef);

      let transactionsIncome = [];

      if (
        transactionsSnap.exists()
        && transactionsSnap.data().transactionsIncomeProducts
      ) {
        transactionsIncome = transactionsSnap.data().transactionsIncomeProducts;
      }

      Object.keys(cart).forEach((productId) => {
        const cartItem = cart[productId];
        const existingTransactionIndex = transactionsIncome.findIndex(
          (transaction) => transaction.productId === productId,
        );
        if (existingTransactionIndex >= 0) {
          transactionsIncome[existingTransactionIndex].quantity
            += cartItem.quantity;
        } else {
          transactionsIncome.push({
            productId,
            quantity: cartItem.quantity,
            sellPrice: cartItem.sellPrice,
            buyPrice: cartItem.buyPrice,
            name: cartItem.name,
          });
        }
      });

      await Promise.all(
        Object.keys(cart).map(async (productId) => {
          const productRef = doc(db, `sellers/${userId}/products`, productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock;
            const updatedStock = currentStock - cart[productId].quantity;
            await setDoc(productRef, { stock: updatedStock }, { merge: true });
            updateProductStockDisplay(productId, updatedStock);
          }
        }),
      );

      await setDoc(transactionsRef, {
        transactionsIncomeProducts: transactionsIncome,
      });
      alert("Penjualan berhasil dikonfirmasi!");
      resetCart();
    } catch (error) {
      console.error("Terjadi kesalahan saat mengonfirmasi penjualan:", error);
    }
  };

  const updateProductStockDisplay = (productId, updatedStock) => {
    const productElement = container.querySelector(
      `.productSelection[data-product-id="${productId}"]`,
    );
    if (productElement) {
      const stockAmountElement = productElement.querySelector("#stockAmount");
      stockAmountElement.textContent = updatedStock;
    }
  };

  const loadAndDisplayProducts = async (userId) => {
    products = await loadSellerProducts(userId);
    displayProducts(products);
  };

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

  const handleUpdateDashboardDate = async (userId) => {
    const checkoutDate = container.querySelector("#checkoutDate").value;
    const formattedDate = checkoutDate.split("-").reverse().join("-");
    try {
      const docRef = doc(
        db,
        `sellers/${userId}/transactionsIncome`,
        formattedDate,
      );
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, { transactionsIncomeProducts: [] });
      }
      alert("Tanggal berhasil diperbarui!");
    } catch (error) {
      console.error(
        "Terjadi kesalahan saat memperbarui tanggal penjualan:",
        error,
      );
    }
  };

  const saveTodayDateIfNotExists = async (userId) => {
    const today = new Date().toISOString().split("T")[0];
    const formattedDate = today.split("-").reverse().join("-");
    try {
      const docRef = doc(
        db,
        `sellers/${userId}/transactionsIncome`,
        formattedDate,
      );
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, { transactionsIncomeProducts: [] });
      }
    } catch (error) {
      console.error(
        "Terjadi kesalahan saat menetapkan tanggal hari ini:",
        error,
      );
    }
  };

  const searchProduct = () => {
    const searchProductInput = container
      .querySelector("#searchProduct")
      .value.toLowerCase();
    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchProductInput));
    displayProducts(filteredProducts);
  };

  container
    .querySelector("#updateDashboardDate")
    .addEventListener("click", async () => {
      const userId = auth.currentUser.uid;
      await handleUpdateDashboardDate(userId);
    });

  container
    .querySelector("#searchProductButton")
    .addEventListener("click", searchProduct);

  container.querySelector("#openCartButton").addEventListener("click", () => {
    const dashboardCartArea = container.querySelector("#dashboardCartArea");
    dashboardCartArea.style.display = dashboardCartArea.style.display === "none" ? "block" : "none";
  });

  container.querySelector("#resetCart").addEventListener("click", resetCart);

  container
    .querySelector("#confirmTransaction")
    .addEventListener("click", async () => {
      const userId = auth.currentUser.uid;
      await confirmCart(userId);
    });

  container.querySelector("#productPage").addEventListener("click", () => {
    window.location.href = "/productManagement";
  });

  container.querySelector("#stockPage").addEventListener("click", () => {
    window.location.href = "/stockManagement";
  });

  container.querySelector("#reportsPage").addEventListener("click", () => {
    window.location.href = "/transactionReport";
  });

  container.querySelector("#profilePage").addEventListener("click", () => {
    window.location.href = "/profileSeller";
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userId = user.uid;
      const today = new Date().toISOString().split("T")[0];
      container.querySelector("#checkoutDate").value = today;
      loadAndDisplayMarketName(userId);
      saveTodayDateIfNotExists(userId);
      loadAndDisplayProducts(userId);
    }
  });
};

export default renderDashboardSellerPage;
