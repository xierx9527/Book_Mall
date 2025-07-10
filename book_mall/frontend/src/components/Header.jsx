import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuthToken, logout } from '../services/auth';  // 导入认证服务
import "../Header.css"
function Header() {
    // 从localStorage获取token判断登录状态（替代硬编码的useState）
    const [isLoggedIn, setIsLoggedIn] = useState(!!getAuthToken());
    const [userRole, setUserRole] = useState(null);

    // 监听token变化（如退出登录后更新状态）
    useEffect(() => {
        const checkLoginStatus = () => {
            const token = getAuthToken();
            setIsLoggedIn(!!token);
            if (token) {
                try {
                    // 更安全的token解析方式
                    const base64Url = token.split('.')[1];
                    if (!base64Url) {
                        throw new Error('无效的token格式');
                    }
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(decodeURIComponent(escape(
                        atob(base64)
                    )));
                    setUserRole(payload.role);
                } catch (err) {
                    console.error('解析token失败:', err);
                    logout();
                    setIsLoggedIn(false);
                }
            }
        };
        checkLoginStatus();
        // 监听localStorage变化（退出登录时触发）
        window.addEventListener('storage', checkLoginStatus);
        return () => window.removeEventListener('storage', checkLoginStatus);
    }, []);

    const handleLogout = () => {
        logout();  // 调用认证服务清除token
        setIsLoggedIn(false);
        // 跳转到首页
        window.location.href = '/';
    };

    return (
        <header className="header-container">
            <div className="nav-container">
                <Link to="/" className="brand-logo">
                    图书商城
                </Link>

                <nav className="nav-links">
                    <Link to="/books" className="nav-link">
                        所有图书
                    </Link>
                    {isLoggedIn && (
                        <>
                            {userRole === 'manager' ? (
                                <>
                                    <Link to="/admin/books" className="nav-link">
                                        管理图书
                                    </Link>
                                    <Link to="/admin/orders" className="nav-link">
                                        商品订单
                                    </Link>
                                </>
                            ) : (
                                <Link to="/orders" className="nav-link">
                                    我的订单
                                </Link>
                            )}
                            <Link to="/user/profile" className="nav-link">
                                个人中心
                            </Link>
                        </>
                    )}

                    {isLoggedIn ? (
                        <button
                            onClick={handleLogout}
                            className="auth-button logout-btn"
                        >
                            退出登录
                        </button>
                    ) : (
                        <div className="auth-buttons">
                            <Link
                                to="/login"
                                className="auth-button login-btn"
                            >
                                登录
                            </Link>
                            <Link
                                to="/register"
                                className="auth-button register-btn"
                            >
                                注册
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;