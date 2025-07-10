import { useEffect, useState } from 'react';
import OrderCard from '../components/OrderCard';
import '../adminorders.css';
import { getAllAdminOrders } from '../services/books';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getAllAdminOrders();
                // 确保orders是一个数组
                setOrders(data.orders || data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) return <div className="loading">加载中...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="admin-orders-container">
            <h1>商品订单</h1>
            <div className="orders-list">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                        />
                    ))
                ) : (
                    <p>暂无订单数据</p>
                )}
            </div>
        </div>
    );
}
