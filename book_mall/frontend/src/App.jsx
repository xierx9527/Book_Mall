import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import BookList from './pages/BookList';
import BookDetail from './pages/BookDetail';
import MyOrders from './pages/MyOrders';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminOrders from './pages/AdminOrders';
import AdminBookManagement from './pages/AdminBookManagement';

// 添加订单创建路由
import OrderCreate from './pages/OrderCreate';

function App() {
    return (
        <Router>
            <div className="app">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/books" element={<BookList />} />
                        <Route path="/books/:id" element={<BookDetail />} />
                        <Route path="/orders" element={<MyOrders />} />
                        <Route path="/admin/orders" element={<AdminOrders />} />
                        <Route path="/admin/books" element={<AdminBookManagement />} />
                        <Route path="/user/profile" element={<UserProfile />} />  {/* 新增用户页面路由 */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/order/create" element={<OrderCreate />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;