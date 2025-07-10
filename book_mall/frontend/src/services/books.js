const API_BASE_URL = 'http://localhost:8080';

export const getAllBooks = async () => {
    const response = await fetch(`${API_BASE_URL}/books`);
    if (!response.ok) {
        throw new Error('获取图书列表失败');
    }
    return await response.json();
};

export const getBookById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/books/${id}`);
    if (!response.ok) {
        throw new Error('获取图书详情失败');
    }
    return await response.json();
};

export const addComment = async (bookId, userId, username, content) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/bookcomments/${bookId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        // 修改请求体字段命名（保持与后端一致）
        body: JSON.stringify({
            content: content,
            user_id: userId,   // 将驼峰式改为下划线式
            username: username
        })
    });

    if (!response.ok) {
        throw new Error('添加评论失败');
    }
    return await response.json();
};
// 获取推荐图书
export const getFeaturedBooks = async () => {
    const response = await fetch(`${API_BASE_URL}/books`);
    if (!response.ok) {
        throw new Error('获取推荐图书失败');
    }
    return await response.json();
};

// 获取用户订单
// export const getUserOrders = async (userId) => {
//     const token = localStorage.getItem('token');
//     const response = await fetch(`${API_BASE_URL}/orders/${userId}`, {
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     });

//     if (!response.ok) {
//         throw new Error('获取用户订单失败');
//     }
//     return await response.json();
// };

// 更新订单状态
export const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });

    if (!response.ok) {
        throw new Error('更新订单状态失败');
    }
    return await response.json();
};

// 删除订单
export const deleteOrder = async (orderId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('删除订单失败');
    }
    return await response.json();
};

// 新增订单创建API
export const createOrder = async (orderData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            ...orderData,
            receiver: encodeURIComponent(orderData.receiver),
            address: encodeURIComponent(orderData.address)
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '创建订单失败');
    }
    return await response.json();
};

export const getCurrentUserOrders = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '获取订单失败');
    }
    return await response.json();
};

export const getAllAdminOrders = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '获取订单失败');
    }
    const data = await response.json();
    return data.orders || data; // 兼容不同返回格式
};

export const getAdminOrders = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '获取订单失败');
    }
    return await response.json();
};