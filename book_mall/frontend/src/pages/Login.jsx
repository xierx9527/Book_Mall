import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';  // 添加useNavigate
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAuthToken } from '../services/auth';

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();  // 新增导航钩子
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');  // 新增错误状态

    useEffect(() => {
        if (location.state?.success) {
            setSuccessMessage(location.state.success);
            if (location.state.registeredPhone) {
                setFormData(prev => ({ ...prev, phone: location.state.registeredPhone }));
            }
        }
    }, [location]);

    const [formData, setFormData] = useState({
        phone: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8080/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: formData.phone,
                    password: formData.password
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || '登录失败');
            }

            const data = await response.json();
            // 存储token到localStorage
            localStorage.setItem('token', data.token);
            // 手动触发storage事件（解决同一标签页不更新的问题）
            window.dispatchEvent(new Event('storage'));
            // 导航路径为首页
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}
            {error && (  // 新增错误提示
                <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}
            <h1 className="login-title">用户登录</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>手机号</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        pattern="[0-9]{11}"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">密码</label>
                    <input
                        type="password"
                        className="form-input"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>
                <button type="submit" className="btn">
                    登录
                </button>
            </form>
            <div className="text-center mt-4">
                <span className="link-text">还没有账号？</span>
                <Link to="/register" className="link ml-1">
                    立即注册
                </Link>
            </div>
        </div>
    );
}
