const API_BASE_URL = 'http://localhost:8080';

// 新增：JWT存储方法
export const setAuthToken = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify({
        id: userData.id,
        username: userData.username
    }));
};

// 新增：JWT获取方法
export const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        // 验证token格式
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('无效的token格式');
        }
        return token;
    } catch (err) {
        console.error('无效的token:', err);
        logout(); // 自动清除无效token
        return null;
    }
};

// 新增：退出登录方法（移除token）
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo'); // 新增这行
};

export const login = async (phone, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, password })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || errorData.error || '登录失败');
    }

    const data = await response.json();
    setAuthToken(data.token, data.user); // 修改这里
    return data;
};

export const register = async (phone, username, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, username, password })
    });

    if (!response.ok) {
        const errorData = await response.json();
        // 优化错误提示：优先使用后端返回的msg字段
        throw new Error(errorData.msg || errorData.error || '注册失败');
    }

    return await response.json();
};