import "../../../styles/transactionReport.css";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import firebaseConfig from "../../common/config";

import profileIcon from "../../../public/icons/profile-icon.svg";
import menuIcon from "../../../public/icons/menu-icon.svg";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const dateRange = { startDate: '', endDate: '' };

const renderTransactionReportPage = (container) => {
  container.innerHTML = `
  <main id="transactionReportPage">
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
                  <button class="whiteButton" id="dashboardPage">Beranda</button>
              </div>
              <div class="headerButton" id="transactionMenu">
                  <button class="sellerButton" id="transactionNavigation">
                      <img src=${menuIcon} alt="Menu Icon" />
                  </button>
              </div>
          </div>
      </header>

      <section class="transactionReportHome">
          <div class="reportsDateArea">
                <div class="inputLabelArea">
                    <h1>Tanggal Awal</h1>
                    <h1>-</h1>
                    <h1>Tanggal Akhir</h1>
                </div>
                <div class="inputDateArea">
                    <input
                        type="date" id="startDate"
                        name="startDate" class="inputDate"/>
                    <h1>-</h1>
                    <input
                        type="date" id="endDate"
                        name="endDate" class="inputDate"/>
                </div>
              <div class="dateButton" id="dateButton">
                  <button class="blueButton"
                    id="confirmDateRange">Terapkan</button>
                  <button class="whiteButton"
                    id="resetDateRange">Reset</button>
              </div>
          </div>

          <section class="transactionIncomeArea" id="transactionIncomeArea">
              <div class="sectionTitle">
                  <h1>Laporan Transaksi Pemasukan</h1>
              </div>
              <div class="transactionIncomeReportArea"
                    id="transactionIncomeReportArea">
                  <div class="transactionIncomeReportTitle"
                          id="transactionIncomeReportTitle">
                      <h1>Laporan Pemasukan</h1>
                  </div>
                  <table class="transactionIncomeReportTable"
                            id="transactionIncomeReportTable">
                      <thead id="transactionIncomeReportHeader">
                          <tr>
                              <th id="transactionDateHeader">Tanggal</th>
                              <th id="totalProductsHeader">Total Produk</th>
                              <th id="totalPriceHeader">Total Pemasukan</th>
                          </tr>
                      </thead>
                      <tbody class="transactionIncomeReportDetail"
                              id="transactionIncomeReportDetail">
                          <!-- Transaction rows will be populated here -->
                      </tbody>
                  </table>
              </div>

              <div class="transactionIncomeProductReportArea"
                      id="transactionIncomeProductReportArea">
                  <div class="transactionIncomeDailyTitle"
                          id="transactionIncomeDailyTitle">
                      <h1>Detail Pemasukan Harian</h1>
                  </div>
                  <table class="dailyReportTable" id="transactionIncomeDailyTable">
                      <thead id="transactionIncomeDailyHeader">
                          <tr>
                              <th id="productNameHeader">Nama Produk</th>
                              <th id="dailyTotalProductsHeader">Total Produk</th>
                              <th id="productSellPriceHeader">Harga Jual</th>
                              <th id="dailyTotalPriceHeader">Total Harga</th>
                          </tr>
                      </thead>
                      <tbody class="transactionDailyDetail"
                              id="transactionIncomeDailyDetail">
                          <!-- Daily transaction rows will be populated here -->
                      </tbody>
                  </table>
              </div>
          </section>

          <section class="transactionOutcomeArea" id="transactionOutcomeArea">
              <div class="sectionTitle">
                  <h1>Laporan Transaksi Pengeluaran</h1>
              </div>
              <div class="transactionOutcomeReportArea"
                      id="transactionOutcomeReportArea">
                  <div class="transactionOutcomeReportTitle"
                          id="transactionOutcomeReportTitle">
                      <h1>Laporan Pengeluaran</h1>
                  </div>
                  <table class="transactionOutcomeReportTable"
                            id="transactionOutcomeReportTable">
                      <thead id="transactionOutcomeReportHeader">
                          <tr>
                              <th id="transactionDateHeader">Tanggal</th>
                              <th id="totalProductsHeader">Total Produk</th>
                              <th id="totalPriceHeader">Total Pengeluaran</th>
                          </tr>
                      </thead>
                      <tbody class="transactionOutcomeReportDetail"
                              id="transactionOutcomeReportDetail">
                          <!-- Transaction rows will be populated here -->
                      </tbody>
                  </table>
              </div>

              <div class="transactionOutcomeProductReportArea"
                      id="transactionOutcomeProductReportArea">
                  <div class="transactionOutcomeDailyTitle"
                          id="transactionOutcomeDailyTitle">
                      <h1>Detail Pengeluaran Harian</h1>
                  </div>
                  <table class="dailyReportTable"
                            id="transactionOutcomeDailyTable">
                      <thead id="transactionOutcomeDailyHeader">
                          <tr>
                              <th id="productNameHeader">Nama Produk</th>
                              <th id="dailyTotalProductsHeader">Total Produk</th>
                              <th id="productSellPriceHeader">Harga Beli</th>
                              <th id="dailyTotalPriceHeader">Total Harga</th>
                          </tr>
                      </thead>
                      <tbody class="transactionDailyDetail"
                                id="transactionOutcomeDailyDetail">
                          <!-- Daily transaction rows will be populated here -->
                      </tbody>
                  </table>
              </div>
          </section>

          <section class="evaluationTransactionArea"
                      id="evaluationTransactionArea">
              <div class="sectionTitle">
                  <h1>Evaluasi Laporan Transaksi</h1>
              </div>
              <div class="evaluationHighestSalesContent"
                      id="evaluationHighestSalesContent">
                  <div class="evaluationHighestSalesTitle"
                          id="evaluationHighestSalesTitle">
                      <h1>Penjualan Tertinggi</h1>
                  </div>
                  <table class="evaluationHighestSalesTable"
                            id="evaluationHighestSalesTable">
                      <thead id="evaluationHighestSalesHeader">
                          <tr>
                              <th id="productNameHeader">Nama Produk</th>
                              <th id="totalProductsHeader">Total Produk</th>
                              <th id="totalPriceHeader">Total Harga</th>
                          </tr>
                      </thead>
                      <tbody class="evaluationHighestSalesDetail"
                                id="evaluationHighestSalesDetail">
                          <!-- Highest sales rows will be populated here -->
                      </tbody>
                  </table>
              </div>

              <div class="evaluationLowestSalesContent"
                      id="evaluationLowestSalesContent">
                  <div class="evaluationLowestSalesTitle"
                          id="evaluationLowestSalesTitle">
                      <h1>Penjualan Terendah</h1>
                  </div>
                  <table class="evaluationLowestSalesTable"
                            id="evaluationLowestSalesTable">
                      <thead id="evaluationLowestSalesHeader">
                          <tr>
                              <th id="productNameHeader">Nama Produk</th>
                              <th id="totalProductsHeader">Total Produk</th>
                              <th id="totalPriceHeader">Total Harga</th>
                          </tr>
                      </thead>
                      <tbody class="evaluationLowestSalesDetail"
                                id="evaluationLowestSalesDetail">
                          <!-- Lowest sales rows will be populated here -->
                      </tbody>
                  </table>
              </div>

              <div class="evaluationTotalRevenueContent"
                      id="evaluationTotalRevenueContent">
                  <div class="evaluationTotalRevenueTitle"
                          id="evaluationTotalRevenueTitle">
                      <h1>Detail Keuntungan</h1>
                  </div>
                  <table class="evaluationTotalRevenueTable"
                            id="evaluationTotalRevenueTable">
                      <thead id="evaluationTotalRevenueHeader">
                          <tr>
                              <th id="transactionDateHeader">Tanggal</th>
                              <th id="totalIncomeHeader">Pemasukan</th>
                              <th id="totalCapitalHeader">Modal</th>
                              <th id="totalRevenueHeader">Keuntungan</th>
                          </tr>
                      </thead>
                      <tbody class="evaluationTotalRevenueBody"
                                id="evaluationTotalRevenueBody">
                          <!-- Revenue rows will be populated here -->
                      </tbody>
                  </table>
              </div>
          </section>
      </section>
  </main>
  <footer>
      <div class="footerBar">
          <h1>Platform Pendukung Usaha Lokal Indonesia</h1>
      </div>
  </footer>
`;

  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchAndDisplayMarketName(user);
    } else {
      console.error("Tidak ada pengguna yang terautentikasi.");
    }
  });

  document.getElementById("confirmDateRange").addEventListener("click", applyDateRange);
  document.getElementById("resetDateRange").addEventListener("click", resetDateRange);

  document.getElementById("productPage").addEventListener("click", () => {
    window.location.href = '/productManagement';
  });
  document.getElementById("stockPage").addEventListener("click", () => {
    window.location.href = '/stockManagement';
  });
  document.getElementById("dashboardPage").addEventListener("click", () => {
    window.location.href = '/dashboardSeller';
  });
  container.querySelector("#profilePage").addEventListener("click", () => {
    window.location.href = "/profileSeller";
  });

  document.getElementById('transactionNavigation').addEventListener('click', () => {
    const navigationButton = document.getElementById('navigationButton');
    if (navigationButton.style.display === 'flex') {
      navigationButton.style.display = 'none';
    } else {
      navigationButton.style.display = 'flex';
    }
  });
};

const fetchAndDisplayMarketName = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const sellerDoc = await getDoc(doc(db, "sellers", user.uid));
      if (sellerDoc.exists()) {
        const sellerData = sellerDoc.data();
        const marketNameElement = document.getElementById("marketName");
        marketNameElement.textContent = sellerData.marketName;
      } else {
        console.error("Tidak ada dokumen yang ditemukan");
      }
    } else {
      console.error("Tidak ada pengguna yang terautentikasi.");
    }
  } catch (error) {
    console.error("Terjadi kesalahan saat memuat nama usaha:", error);
  }
};

const applyDateRange = async () => {
  const startDateElement = document.getElementById("startDate");
  const endDateElement = document.getElementById("endDate");

  const startDate = startDateElement.value;
  const endDate = endDateElement.value;

  if (!startDate || !endDate) {
    alert("Silakan pilih tanggal awal dan tanggal akhir sebelum melanjutkan.");
    return;
  }

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (startDateObj > endDateObj) {
    alert("Rentang tanggal yang dimasukkan tidak benar.");
    return;
  }

  dateRange.startDate = startDate;
  dateRange.endDate = endDate;

  await displayTransactionIncomeReports();
  await displayTransactionOutcomeReports();
  await evaluateSales();
  await evaluateTotalRevenue();
};

const displayTransactionIncomeReports = async () => {
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);

  const transactionIncomeCollection = collection(
    db,
    `sellers/${auth.currentUser.uid}/transactionsIncome`,
  );
  const querySnapshot = await getDocs(transactionIncomeCollection);

  const transactionIncomeReportDetail = document.getElementById("transactionIncomeReportDetail");
  transactionIncomeReportDetail.innerHTML = '';

  querySnapshot.forEach((doc) => {
    const docDate = doc.id.split('-').reverse().join('-');
    const transactionDate = new Date(docDate);

    if (transactionDate >= startDate && transactionDate <= endDate) {
      const docData = doc.data();
      const { transactionsIncomeProducts } = docData;

      if (Array.isArray(transactionsIncomeProducts)) {
        const totalProducts = transactionsIncomeProducts.reduce(
          (sum, product) => sum + product.quantity,
          0,
        );
        const totalPrice = transactionsIncomeProducts.reduce(
          (sum, product) => sum + (product.quantity * product.sellPrice),
          0,
        );

        const transactionRow = document.createElement("tr");
        transactionRow.className = "transactionIncomeReportProduct";
        transactionRow.innerHTML = `
          <td>${doc.id}</td>
          <td>${totalProducts}</td>
          <td>${totalPrice}</td>
        `;

        transactionRow.addEventListener("click", async () => {
          await displayTransactionIncomeDailyReport(doc.id);
          document.getElementById("transactionIncomeProductReportArea").style.display = 'block';
        });

        transactionIncomeReportDetail.appendChild(transactionRow);
      } else {
        console.error(
          `transactionsIncomeProducts is not an array in document ${doc.id}`,
          transactionsIncomeProducts,
        );
      }
    }
  });
};

const displayTransactionOutcomeReports = async () => {
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);

  const transactionOutcomeCollection = collection(
    db,
    `sellers/${auth.currentUser.uid}/transactionsOutcome`,
  );
  const querySnapshot = await getDocs(transactionOutcomeCollection);

  const transactionOutcomeReportDetail = document.getElementById("transactionOutcomeReportDetail");
  transactionOutcomeReportDetail.innerHTML = '';

  querySnapshot.forEach((doc) => {
    const docDate = doc.id.split('-').reverse().join('-');
    const transactionDate = new Date(docDate);

    if (transactionDate >= startDate && transactionDate <= endDate) {
      const { transactionsOutcomeProducts } = doc.data();

      if (Array.isArray(transactionsOutcomeProducts)) {
        const totalProducts = transactionsOutcomeProducts.reduce(
          (sum, product) => sum + product.quantity,
          0,
        );
        const totalPrice = transactionsOutcomeProducts.reduce(
          (sum, product) => sum + (product.quantity * product.buyPrice),
          0,
        );

        const transactionRow = document.createElement("tr");
        transactionRow.className = "transactionOutcomeReportProduct";
        transactionRow.innerHTML = `
          <td>${doc.id}</td>
          <td>${totalProducts}</td>
          <td>${totalPrice}</td>
        `;

        transactionRow.addEventListener("click", async () => {
          await displayTransactionOutcomeDailyReport(doc.id);
          document.getElementById("transactionOutcomeProductReportArea").style.display = 'block';
        });

        transactionOutcomeReportDetail.appendChild(transactionRow);
      } else {
        console.error(
          `transactionsOutcomeProducts is not an array in document ${doc.id}`,
          transactionsOutcomeProducts,
        );
      }
    }
  });
};

const displayTransactionIncomeDailyReport = async (docId) => {
  const transactionIncomeDoc = doc(
    db,
    `sellers/${auth.currentUser.uid}/transactionsIncome`,
    docId,
  );
  const transactionIncomeSnap = await getDoc(transactionIncomeDoc);
  const { transactionsIncomeProducts } = transactionIncomeSnap.data();

  const transactionIncomeDailyDetail = document.getElementById("transactionIncomeDailyDetail");
  transactionIncomeDailyDetail.innerHTML = '';

  transactionsIncomeProducts.forEach((product) => {
    const productRow = document.createElement("tr");
    productRow.className = "transactionIncomeDailyProduct";
    productRow.innerHTML = `
      <td>${product.name}</td>
      <td>${product.quantity}</td>
      <td>${product.sellPrice}</td>
      <td>${product.quantity * product.sellPrice}</td>
    `;
    transactionIncomeDailyDetail.appendChild(productRow);
  });
};

const displayTransactionOutcomeDailyReport = async (docId) => {
  const transactionOutcomeDoc = doc(
    db,
    `sellers/${auth.currentUser.uid}/transactionsOutcome`,
    docId,
  );
  const transactionOutcomeSnap = await getDoc(transactionOutcomeDoc);
  const { transactionsOutcomeProducts } = transactionOutcomeSnap.data();

  const transactionOutcomeDailyDetail = document.getElementById("transactionOutcomeDailyDetail");
  transactionOutcomeDailyDetail.innerHTML = '';

  transactionsOutcomeProducts.forEach((product) => {
    const productRow = document.createElement("tr");
    productRow.className = "transactionOutcomeDailyProduct";
    productRow.innerHTML = `
      <td>${product.name}</td>
      <td>${product.quantity}</td>
      <td>${product.buyPrice}</td>
      <td>${product.quantity * product.buyPrice}</td>
    `;
    transactionOutcomeDailyDetail.appendChild(productRow);
  });
};

const resetDateRange = () => {
  document.getElementById("startDate").value = '';
  document.getElementById("endDate").value = '';
  dateRange.startDate = '';
  dateRange.endDate = '';
  document.getElementById("transactionIncomeReportDetail").innerHTML = '';
  document.getElementById("transactionOutcomeReportDetail").innerHTML = '';
  document.getElementById("transactionIncomeDailyDetail").innerHTML = '';
  document.getElementById("transactionOutcomeDailyDetail").innerHTML = '';
  document.getElementById("transactionIncomeProductReportArea").style.display = 'none';
  document.getElementById("transactionOutcomeProductReportArea").style.display = 'none';
  document.getElementById("evaluationHighestSalesDetail").innerHTML = '';
  document.getElementById("evaluationLowestSalesDetail").innerHTML = '';
  document.getElementById("evaluationTotalRevenueBody").innerHTML = '';
};

const aggregateTransactionData = (transactions, isIncome) => {
  const productTotals = {};

  transactions.forEach((transaction) => {
    const products = isIncome
      ? transaction.data().transactionsIncomeProducts
      : transaction.data().transactionsOutcomeProducts;

    products.forEach((product) => {
      if (!productTotals[product.productId]) {
        productTotals[product.productId] = {
          name: product.name,
          quantity: 0,
          totalPrice: 0,
        };
      }

      productTotals[product.productId].quantity += product.quantity;
      productTotals[product.productId].totalPrice += product.quantity * (
        isIncome ? product.sellPrice : product.buyPrice
      );
    });
  });

  return Object.values(productTotals);
};

const evaluateSales = async () => {
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);

  const transactionIncomeCollection = collection(
    db,
    `sellers/${auth.currentUser.uid}/transactionsIncome`,
  );
  const querySnapshot = await getDocs(transactionIncomeCollection);

  const transactions = [];
  querySnapshot.forEach((doc) => {
    const docDate = doc.id.split('-').reverse().join('-');
    const transactionDate = new Date(docDate);

    if (transactionDate >= startDate && transactionDate <= endDate) {
      transactions.push(doc);
    }
  });

  const productTotals = aggregateTransactionData(transactions, true);

  const highestSalesProducts = [...productTotals].sort((a, b) => b.quantity - a.quantity);
  const lowestSalesProducts = [...productTotals].sort((a, b) => a.quantity - b.quantity);

  const highestSalesDetail = document.getElementById('evaluationHighestSalesDetail');
  highestSalesDetail.innerHTML = '';
  highestSalesProducts.forEach((product) => {
    const productRow = document.createElement('tr');
    productRow.className = 'evaluationHighestSalesProduct';
    productRow.innerHTML = `
      <td>${product.name}</td>
      <td>${product.quantity}</td>
      <td>${product.totalPrice}</td>
    `;
    highestSalesDetail.appendChild(productRow);
  });

  const lowestSalesDetail = document.getElementById('evaluationLowestSalesDetail');
  lowestSalesDetail.innerHTML = '';
  lowestSalesProducts.forEach((product) => {
    const productRow = document.createElement('tr');
    productRow.className = 'evaluationLowestSalesProduct';
    productRow.innerHTML = `
      <td>${product.name}</td>
      <td>${product.quantity}</td>
      <td>${product.totalPrice}</td>
    `;
    lowestSalesDetail.appendChild(productRow);
  });
};

const evaluateTotalRevenue = async () => {
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);

  const transactionIncomeCollection = collection(
    db,
    `sellers/${auth.currentUser.uid}/transactionsIncome`,
  );

  const incomeSnapshot = await getDocs(transactionIncomeCollection);
  const outcomeSnapshot = await getDocs(transactionIncomeCollection);

  const revenueDetails = {};

  incomeSnapshot.forEach((doc) => {
    const docDate = doc.id.split('-').reverse().join('-');
    const transactionDate = new Date(docDate);

    if (transactionDate >= startDate && transactionDate <= endDate) {
      const { transactionsIncomeProducts } = doc.data();
      let totalIncome = 0;
      transactionsIncomeProducts.forEach((product) => {
        totalIncome += product.quantity * product.sellPrice;
      });

      if (!revenueDetails[doc.id]) {
        revenueDetails[doc.id] = { totalIncome: 0, totalCapital: 0 };
      }
      revenueDetails[doc.id].totalIncome += totalIncome;
    }
  });

  outcomeSnapshot.forEach((doc) => {
    const docDate = doc.id.split('-').reverse().join('-');
    const transactionDate = new Date(docDate);

    if (transactionDate >= startDate && transactionDate <= endDate) {
      const { transactionsIncomeProducts } = doc.data();
      let totalCapital = 0;
      transactionsIncomeProducts.forEach((product) => {
        totalCapital += product.quantity * product.buyPrice;
      });

      if (!revenueDetails[doc.id]) {
        revenueDetails[doc.id] = { totalIncome: 0, totalCapital: 0 };
      }
      revenueDetails[doc.id].totalCapital += totalCapital;
    }
  });

  const revenueDetailBody = document.getElementById('evaluationTotalRevenueBody');
  revenueDetailBody.innerHTML = '';

  Object.keys(revenueDetails).forEach((date) => {
    const { totalIncome, totalCapital } = revenueDetails[date];
    const totalRevenue = totalIncome - totalCapital;
    const revenueRow = document.createElement('tr');
    revenueRow.className = 'evaluationTotalRevenueProduct';
    revenueRow.innerHTML = `
      <td>${date}</td>
      <td>${totalIncome}</td>
      <td>${totalCapital}</td>
      <td>${totalRevenue}</td>
    `;
    revenueDetailBody.appendChild(revenueRow);
  });
};

export default renderTransactionReportPage;
