import "../../../styles/productManagement.css";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import firebaseConfig from "../../common/config";
import profileIcon from "../../../public/icons/profile-icon.svg";
import menuIcon from "../../../public/icons/menu-icon.svg";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const auth = getAuth(firebaseApp);

const renderProductManagementPage = (container) => {
  container.innerHTML = `
    <main id="productManagementPage">
        <header>
            <div class="headerBar">
                <div class="headerTitle">
                    <button class="sellerButton" id="profilePage">
                      <img src="${profileIcon || "../../../public/images/dummyImage.jpg"}" alt="Profile Icon" />
                    </button>
                    <h1 id="marketName">BantuLokal</h1>
                </div>
                <div class="headerButton" id="navigationButton">
                    <button class="whiteButton" id="stockPage">
                        <a href="/stockManagement"></a>Stok
                    </button>
                    <button class="whiteButton" id="reportsPage">
                        <a href="/transactionReports"></a>Laporan
                    </button>
                    <button class="whiteButton" id="dashboardPage">
                        <a href="/dashboardSeller"></a>Beranda
                    </button>
                </div>
                <div class="headerButton" id="productMenu">
                    <button class="sellerButton" id="productNavigation">
                      <img src="${menuIcon || "../../../public/images/dummyImage.jpg"}" alt="Menu Icon" />
                    </button>
                </div>
            </div>
        </header>

        <div class="mainContent">
            <section class="productDevelopmentArea">
                <div class="productDevelopment" id="addProductArea">
                    <h1>Tambah Produk</h1>
                    <div class="file-input-container">
                        <label for="productImage" class="custom-file-label"
                              id="productImageName">Gambar Produk</label>
                        <input type="file" id="productImage" name="productImage"
                              accept="image/*" class="input file-input"
                              placeholder="Gambar Produk" required />
                    </div>
                    <input type="text" id="productName" name="productName"
                          class="input" placeholder="Nama Produk" required />
                    <input type="text" id="productBuyPrice" name="productBuyPrice"
                          class="input" placeholder="Harga Modal" required />
                    <input type="text" id="productSellPrice" name="productSellPrice"
                          class="input" placeholder="Harga Jual" required />
                    <button class="blueButton" id="addProduct">Tambah</button>
                </div>

                <div class="productDevelopment" id="updateProductArea">
                    <h1>Perbarui Produk</h1>
                    <div class="file-input-container">
                        <label for="updateProductImage" class="custom-file-label"
                              id="updateProductImageName">Gambar Produk</label>
                        <input type="file" id="updateProductImage"
                              name="updateProductImage" accept="image/*"
                              class="input file-input" placeholder="Gambar Produk" />
                    </div>
                    <input type="text" id="updateProductName"
                          name="updateProductName" class="input"
                          placeholder="Nama Produk" required />
                    <input type="text" id="updateProductBuyPrice"
                          name="updateProductBuyPrice" class="input"
                          placeholder="Harga Modal" required />
                    <input type="text" id="updateProductSellPrice"
                          name="updateProductSellPrice" class="input"
                          placeholder="Harga Jual" required />
                    <button class="blueButton" id="updateProduct"
                            data-product-id="">Perbarui</button>
                </div>
            </section>

            <section class="home">
                <div class="productSearchArea">
                    <h1>Kelola Produk Anda</h1>
                    <input type="text" id="searchProduct" name="searchProduct"
                      class="input" placeholder="Cari Produk">
                    <button class="blueButton" id="searchButton">Cari</button>
                </div>
                <div class="productCatalog" id="productCatalog">
                    <!-- Product details will be appended here dynamically -->
                </div>
            </section>
        </div>
    </main>
    <footer>
        <div class="footerBar">
            <h1>Platform Pendukung Usaha Lokal Indonesia</h1>
        </div>
    </footer>
  `;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchMarketName(user);

      const addProductButton = document.getElementById("addProduct");
      const updateProductButton = document.getElementById("updateProduct");
      const searchButton = document.getElementById("searchButton");

      addProductButton.addEventListener("click", async () => {
        const productName = document.getElementById("productName").value.trim();
        const productBuyPrice = document.getElementById("productBuyPrice").value.trim();
        const productSellPrice = document.getElementById("productSellPrice").value.trim();
        const productImage = document.getElementById("productImage").files[0];
        if (!productName || !productBuyPrice || !productSellPrice || !productImage) {
          alert("Mohon lengkapi semua input dan unggah gambar produk untuk menambahkan produk.");
          return;
        }

        await addProductToFirestore(
          user,
          productName,
          productBuyPrice,
          productSellPrice,
          productImage,
        );
        renderProducts(user);
      });

      document.getElementById("productImage").addEventListener("change", handleFileInputChange);
      document.getElementById("updateProductImage").addEventListener("change", handleFileInputChange);

      const productCatalog = document.querySelector("#productCatalog");

      productCatalog.addEventListener("click", (event) => {
        if (event.target.classList.contains("editProduct")) {
          handleEditProductClick(event);
        } else if (event.target.classList.contains("deleteProduct")) {
          handleDeleteProductClick(event);
        }
      });

      document.getElementById('productNavigation').addEventListener('click', () => {
        const navigationButton = document.getElementById('navigationButton');
        if (navigationButton.style.display === 'flex') {
          navigationButton.style.display = 'none';
        } else {
          navigationButton.style.display = 'flex';
        }
      });

      container.querySelector("#dashboardPage").addEventListener("click", () => {
        window.location.href = "/dashboardSeller";
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

      updateProductButton.addEventListener("click", async (event) => {
        await handleUpdateProductClick(event);
      });

      searchButton.addEventListener("click", async () => {
        await handleSearchProduct();
      });

      renderProducts(user);
    } else {
      console.error("Terjadi kesalahan:");
    }
  });
};

const fetchMarketName = async (user) => {
  const userDocRef = doc(db, "sellers", user.uid);
  try {
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const { marketName } = userDoc.data();
      document.getElementById("marketName").textContent = marketName;
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat memuat nama usaha:", error);
  }
};

const renderProducts = async (user) => {
  const productCatalog = document.querySelector(".productCatalog");
  productCatalog.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, `sellers/${user.uid}/products`));

    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    products.sort((a, b) => a.name.localeCompare(b.name));

    products.forEach((product) => {
      const productDetail = `
        <div class="productDetail" data-id="${product.id}">
          <img src="${product.imageUrl || "../../../public/images/dummyImage.jpg"}" alt="${product.name}" />
          <h1>${product.name}</h1>
          <h2 id="productBuyPrice">${product.buyPrice}</h2>
          <h2>${product.sellPrice}</h2>
          <h2>Stok : ${product.stock}</h2>
          <div class="productButton">
            <button class="blueButton editProduct" id="editProduct">Perbarui</button>
            <button class="whiteButton deleteProduct" id="deleteProduct">Hapus</button>
          </div>
        </div>
      `;
      productCatalog.innerHTML += productDetail;
    });
  } catch (error) {
    console.error("Terjadi kesalahan dalam merender produk:", error);
  }
};

const addProductToFirestore = async (
  user,
  productName,
  productBuyPrice,
  productSellPrice,
  productImage,
) => {
  try {
    const uniqueImageId = uuidv4();
    const imageRef = ref(storage, `products/${user.uid}/${uniqueImageId}-${productImage.name}`);

    await uploadBytes(imageRef, productImage);
    const imageUrl = await getDownloadURL(imageRef);

    await addDoc(collection(db, `sellers/${user.uid}/products`), {
      name: productName,
      buyPrice: parseFloat(productBuyPrice),
      sellPrice: parseFloat(productSellPrice),
      imageUrl,
      stock: 0,
      createdAt: new Date(),
    });
    alert("Produk berhasil ditambahkan");
    clearAddProductForm();
  } catch (error) {
    console.error("Terjadi kesalahan dalam menambahkan produk : ", error);
  }
};

const handleUpdateForm = (product) => {
  document.getElementById("updateProductName").value = product.name;
  document.getElementById("updateProductBuyPrice").value = product.buyPrice;
  document.getElementById("updateProductSellPrice").value = product.sellPrice;
  const imageLabel = document.getElementById("updateProductImageName");
  imageLabel.textContent = `Gambar ${product.name}`;
};

const handleEditProductClick = async (event) => {
  const user = auth.currentUser;
  const productId = event.target.closest(".productDetail").dataset.id;
  const productRef = doc(db, `sellers/${user.uid}/products`, productId);
  try {
    const productDoc = await getDoc(productRef);
    if (productDoc.exists()) {
      handleUpdateForm(productDoc.data());
      document.getElementById("updateProduct").dataset.productId = productId;
      document.getElementById("updateProductArea").scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil produk: ", error);
  }
};

const handleUpdateProductClick = async (event) => {
  const user = auth.currentUser;
  const { productId } = event.target.dataset;
  const productName = document.getElementById("updateProductName").value;
  const productBuyPrice = document.getElementById("updateProductBuyPrice").value;
  const productSellPrice = document.getElementById("updateProductSellPrice").value;
  const productImage = document.getElementById("updateProductImage").files[0];
  const productRef = doc(db, `sellers/${user.uid}/products`, productId);

  try {
    let imageUrl = null;
    if (productImage) {
      const uniqueImageId = uuidv4();
      const storageRef = ref(
        storage,
        `products/${user.uid}/${uniqueImageId}-${productImage.name}`,
      );
      await uploadBytes(storageRef, productImage);
      imageUrl = await getDownloadURL(storageRef);
    }

    const updatedData = {
      name: productName,
      buyPrice: parseFloat(productBuyPrice),
      sellPrice: parseFloat(productSellPrice),
      ...(imageUrl && { imageUrl }),
      updatedAt: new Date(),
    };

    await updateDoc(productRef, updatedData);

    alert("Produk berhasil diperbarui");

    const productDetailElement = document.querySelector(`.productDetail[data-id="${productId}"]`);
    if (productDetailElement) {
      productDetailElement.querySelector("h1").textContent = updatedData.name;
      productDetailElement.querySelector("#productBuyPrice").textContent = updatedData.buyPrice;
      productDetailElement.querySelector("h2:nth-child(4)").textContent = updatedData.sellPrice;
      if (updatedData.imageUrl) {
        productDetailElement.querySelector("img").src = updatedData.imageUrl;
      }
    }
    clearUpdateProductForm();
  } catch (error) {
    console.error("Terjadi kesalahan dalam memperbarui produk:", error);
  }
};

const handleDeleteProductClick = async (event) => {
  const user = auth.currentUser;
  const productId = event.target.closest(".productDetail").dataset.id;
  const productRef = doc(db, `sellers/${user.uid}/products`, productId);

  try {
    await deleteDoc(productRef);
    alert("Produk berhasil dihapus");
    renderProducts(user);
  } catch (error) {
    console.error("Terjadi kesalahan dalam menghapus produk: ", error);
  }
};

const handleFileInputChange = (event) => {
  const fileInput = event.target;
  const label = fileInput.previousElementSibling;
  if (fileInput.files.length > 0) {
    label.textContent = fileInput.files[0].name;
  } else {
    label.textContent = "Gambar Produk";
  }
};

const handleSearchProduct = async () => {
  const user = auth.currentUser;
  const searchKeyword = document.getElementById("searchProduct").value.trim().toLowerCase();
  const productCatalog = document.querySelector(".productCatalog");
  productCatalog.innerHTML = "";

  try {
    const productsRef = collection(db, `sellers/${user.uid}/products`);
    const querySnapshot = await getDocs(productsRef);

    let hasResults = false;

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const productName = product.name.toLowerCase();

      if (productName.includes(searchKeyword)) {
        hasResults = true;
        const productDetail = `
          <div class="productDetail" data-id="${doc.id}">
            <img src="${product.imageUrl || "../../../public/images/dummyImage.jpg"}" alt="${product.name}" />
            <h1>${product.name}</h1>
            <h2 id="productBuyPrice">${product.buyPrice}</h2>
            <h2>${product.sellPrice}</h2>
            <div class="productButton">
              <button class="blueButton editProduct" id="editProduct">Perbarui</button>
              <button class="whiteButton deleteProduct" id="deleteProduct">Hapus</button>
            </div>
          </div>
        `;
        productCatalog.innerHTML += productDetail;
      }
    });

    if (!hasResults) {
      productCatalog.innerHTML = "<p>Tidak ada produk yang sesuai dengan pencarian.</p>";
    }
    document.getElementById("searchProduct").value = "";
  } catch (error) {
    console.error("Terjadi kesalahan saat mencari produk:", error);
  }
};

const clearAddProductForm = () => {
  document.getElementById("productName").value = "";
  document.getElementById("productBuyPrice").value = "";
  document.getElementById("productSellPrice").value = "";
  document.getElementById("productImage").value = "";
  document.getElementById("productImageName").textContent = "Gambar Produk";
};

const clearUpdateProductForm = () => {
  document.getElementById("updateProductName").value = "";
  document.getElementById("updateProductBuyPrice").value = "";
  document.getElementById("updateProductSellPrice").value = "";
  document.getElementById("updateProductImage").value = "";
  document.getElementById("updateProductImageName").textContent = "Gambar Produk";
  document.getElementById("upda teProduct").dataset.productId = "";
};

export default renderProductManagementPage;
