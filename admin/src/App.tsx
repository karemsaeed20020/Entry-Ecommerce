import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './components/layouts/DashboardLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import RegisterPage from './pages/auth/RegisterPage'
import LoginPage from './pages/auth/LoginPage'
import UsersPage from './pages/dashboard/UsersPage'
import { PermissionsProvider } from './hooks/PermissionsProvider'
import BrandsPage from './pages/dashboard/BrandsPage'
import CategoriesPage from './pages/dashboard/CategoriesPage'
import ProductBannersPage from './pages/dashboard/ProductBannersPage'
import ProductTypesPage from './pages/dashboard/ProductTypesPage'
import ProductsPage from './pages/dashboard/ProductsPage'
import BannersPageNew from './pages/dashboard/BannersPageNew'
import AdsBannersPage from './pages/dashboard/AdsBannersPage'
import AddressesPage from './pages/dashboard/AddressesPage'
import BaseConfigPage from './pages/dashboard/BaseConfigPage'
import ComponentTypesPage from './pages/dashboard/ComponentTypesPage'
import SearchPage from './pages/dashboard/SearchPage'
import PermissionsPage from './pages/dashboard/PermissionsPage'
import RolesPage from './pages/dashboard/RolesPage'
import SalariesPage from './pages/dashboard/SalariesPage'
import EmployeesPage from './pages/dashboard/EmployeesPage'
import OrdersPage from './pages/dashboard/Orders';
import ReviewsPage from './pages/dashboard/ReviewsPage';
import CouponsPage from './pages/dashboard/CouponsPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import WebsiteIcons from './pages/WebsiteIcons'
import OrderDetailPage from './pages/dashboard/OrderDetailPage';
import InvoicesPage from './pages/dashboard/InvoicesPage';
import InvoiceDetailPage from './pages/dashboard/InvoiceDetailPage';
import ContactMessagesPage from './pages/dashboard/ContactMessagesPage';
import AccountPage from './pages/dashboard/AccountPage';

const App = () => {
  return (
   <PermissionsProvider>
    <Routes>
      {/* Auth Routes  */}
      <Route path='/register' element={<RegisterPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/dashboard' element={<DashboardLayout />}>
        <Route index element={<DashboardPage />}  />
        <Route path='users' element={<UsersPage />} />
        <Route path='brands' element={<BrandsPage />} />
        <Route path='categories' element={<CategoriesPage />} />
        <Route path="product-banners" element={<ProductBannersPage />} />
        <Route path="product-types" element={<ProductTypesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="banners" element={<BannersPageNew />} />
        <Route path="ads-banners" element={<AdsBannersPage />} />
        <Route path="addresses" element={<AddressesPage />} />
        <Route path="base-config" element={<BaseConfigPage />} />
        <Route path="component-types" element={<ComponentTypesPage />} />
        <Route path='search' element={<SearchPage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="salaries" element={<SalariesPage />} />
         <Route path="employees" element={<EmployeesPage />} />
         <Route path="orders" element={<OrdersPage />} />
         <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="contact" element={<ContactMessagesPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="coupons" element={<CouponsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="website-icons" element={<WebsiteIcons />} />
      </Route>
         {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
   </PermissionsProvider>
  )
}

export default App