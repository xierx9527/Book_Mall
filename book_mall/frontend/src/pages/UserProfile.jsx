import { useEffect, useState } from 'react';
import { getAuthToken } from '../services/auth';  // 导入认证服务
import '../styles.css';

export default function UserProfile() {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = getAuthToken();
                if (!token) {
                    setError('请先登录');
                    setIsLoading(false);
                    return;
                }

                const response = await fetch('http://localhost:8080/user/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.msg || '获取用户信息失败');
                }

                const data = await response.json();
                // 关键修改1：后端返回的是data.profile，而非data.user
                setUserInfo(data.profile);  // 修正为data.profile
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (isLoading) return <div className="container mx-auto px-4 py-8">加载中...</div>;
    if (error) return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;

    return (
        <div className="center-container">
            <h1 className="title">个人中心</h1>
            <div className="profile-card">
                <div className="user-info">
                    <div className="info-item">
                        <span className="info-label">用户名</span>
                        <span className="info-value">{userInfo?.username}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">手机号</span>
                        <span className="info-value">{userInfo?.phone}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">邮箱</span>
                        <span className="info-value">{userInfo?.email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
