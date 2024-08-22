import { getAuth } from 'firebase/auth';
import renderLandingPage from '../scripts/pages/landingPage';
import renderRegisterSeller from '../scripts/pages/sellers/registerSeller';
import renderLoginSeller from '../scripts/pages/sellers/loginSeller';
import renderDashboardSellerPage from '../scripts/pages/sellers/dashboardSeller';
import renderDashboardCustomerPage from '../scripts/pages/customers/dashboardCustomer';
import renderSavedSellerPage from '../scripts/pages/customers/savedSeller';
import renderProfileCustomer from '../scripts/pages/customers/profileCustomer';
import renderProductManagementPage from '../scripts/pages/sellers/productManagement';
import renderStockManagementPage from '../scripts/pages/sellers/stockManagement';
import renderTransactionReportPage from '../scripts/pages/sellers/transactionReport';
import renderProfileSellerPage from '../scripts/pages/sellers/profileSeller';
import renderRegisterCustomer from '../scripts/pages/customers/registerCustomer';
import renderLoginCustomer from '../scripts/pages/customers/loginCustomer';

const renderPage = () => {
  const appContainer = document.querySelector('#app');
  const path = window.location.pathname;
  const auth = getAuth();

  switch (path) {
    case '/registerSeller':
      renderRegisterSeller(appContainer);
      break;

    case '/loginSeller':
      renderLoginSeller(appContainer);
      break;

    case '/registerCustomer':
      renderRegisterCustomer(appContainer);
      break;

    case '/loginCustomer':
      renderLoginCustomer(appContainer);
      break;

    case '/dashboardSeller':
      renderDashboardSellerPage(appContainer);
      break;

    case '/dashboardCustomer':
      renderDashboardCustomerPage(appContainer);
      break;

    case '/savedSeller':
      renderSavedSellerPage(appContainer);
      break;

    case '/productManagement':
      renderProductManagementPage(appContainer);
      break;

    case '/stockManagement':
      renderStockManagementPage(appContainer);
      break;

    case '/transactionReport':
      renderTransactionReportPage(appContainer);
      break;

    case '/profileSeller':
      renderProfileSellerPage(appContainer);
      break;

    case '/profileCustomer':
      renderProfileCustomer(appContainer);
      break;

    default:
      renderLandingPage(appContainer);
  }
};

export default renderPage;
