import { useEffect, useState } from 'react';
import OrderCard from '../components/OrderCard';
import '../myorders.css';

import { getCurrentUserOrders } from '../services/books';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 修改fetchOrders函数
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('请先登录');
                }

                const data = await getCurrentUserOrders();
                console.log('订单数据:', data);
                setOrders(data.orders || data || []); // 确保总是数组
            } catch (err) {
                console.error('获取订单错误:', err);
                setError(err.message.includes('401') ? '请先登录' :
                    err.message.includes('500') ? '服务器错误，请稍后再试' :
                        err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleOrderUpdate = async () => {
        // 重新获取订单数据
        try {
            const userId = localStorage.getItem('userId');
            const data = await getUserOrders(userId);
            setOrders(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleOrderDelete = (deletedOrderId) => {
        setOrders(orders.filter(order => order.id !== deletedOrderId));
    };

    if (loading) return <div className="loading">加载中...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="my-orders-container">
            <h1 className="my-orders-title">我的订单</h1>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <p className="no-orders-text">您还没有任何订单</p>
                    <a href="/books" className="shop-link">
                        去选购图书
                    </a>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onUpdate={handleOrderUpdate}
                            onDelete={handleOrderDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyOrders;