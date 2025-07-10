import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles.css'; // 移除axios导入

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 验证必填字段
        if (!formData.username || !formData.phone || !formData.password || !formData.confirmPassword) {
            setError('请填写所有必填字段');
            return;
        }

        // 验证手机号格式
        if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
            setError('请输入有效的11位手机号码');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:8080/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 移除错误的credentials头配置
                },
                // 将credentials移到顶层配置（关键修改）
                credentials: 'include',
                body: JSON.stringify({
                    username: formData.username,
                    phone: formData.phone,
                    email: formData.email || '',
                    password: formData.password
                })
            });

            // 处理非2xx响应（包括409冲突）
            if (!response.ok) {
                const errorData = await response.json();
                // 关键修改：显示后端返回的具体错误信息
                if (response.status === 409) {
                    setError('该手机号已注册');
                } else {
                    setError(errorData.error || errorData.msg || '注册失败');  // 显示后端返回的error字段
                }
                return;
            }

            const data = await response.json();
            if (data.code === 201) {
                navigate('/login', {
                    state: {
                        success: data.msg || '注册成功，请登录',
                        registeredPhone: formData.phone
                    }
                });
            } else {
                setError(data.msg || '注册失败');
            }
        } catch (err) {
            if (err.name === 'TypeError') {
                setError('网络连接失败，请检查网络');
            } else {
                setError(err.message || '注册失败');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-form">
                    <h1>用户注册</h1>
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>用户名 <span className="required">*</span></label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>电话 <span className="required">*</span></label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                                pattern="[0-9]{11}"
                                title="请输入11位手机号码"
                            />
                        </div>

                        <div className="form-group">
                            <label>邮箱</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>密码 <span className="required">*</span></label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>确认密码 <span className="required">*</span></label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? '注册中...' : '注册'}
                        </button>
                    </form>

                    <div className="login-link">
                        <span>已有账号？</span>
                        <Link to="/login">立即登录</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
