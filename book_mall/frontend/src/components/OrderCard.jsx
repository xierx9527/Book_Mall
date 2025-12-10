import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteOrder } from '../services/books';
import '../ordercard.css';

function OrderCard({ order, onDelete }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm('确定要删除此订单吗？')) return;
        setIsDeleting(true);
        try {
            await deleteOrder(order.id);
            onDelete && onDelete();
        } catch (err) {
            alert('删除订单失败: ' + err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const statusClass = order.status === '已完成' ? 'status-completed' :
        order.status === '已取消' ? 'status-cancelled' :
            'status-default';

    const items = order.items || [];
    const orderDate = order.created_at || order.createdAt;
    const totalAmount = order.total_price || order.totalAmount;
    const shippingAddress = order.address || order.shippingAddress;

    // 调试用
    console.log('订单详情:', {
        items,
        orderDate,
        totalAmount,
        shippingAddress
    });

    return (
        <div className="order-card">
            <div className="order-header">
                <h3 className="order-title">订单号: {order.id}</h3>
                <span className={`order-status ${statusClass}`}>
                    {order.status}
                </span>
            </div>

            <div className="order-grid">
                <div>
                    <p className="order-meta-label">下单时间</p>
                    <p>{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div>
                    <p className="order-meta-label">总金额</p>
                    <p className="order-amount">¥{order.total_price.toFixed(2)}</p>
                </div>
                <div>
                    <p className="order-meta-label">收货人</p>
                    <p>{order.receiver}</p>
                </div>
                <div>
                    <p className="order-meta-label">收货地址</p>
                    <p>{order.address}</p>
                </div>
            </div>
            <div className="order-items">
                <h4 className="order-items-title">订单商品</h4>
                {order.book ? (
                    <div className="order-item">
                        <img
                            src={order.book.cover_image ? `http://localhost:8080/static/${order.book.cover_image}?t=${Date.now()}` : 'https://via.placeholder.com/50'}
                            alt={order.book.title || '商品图片'}
                            className="order-item-image"
                        />
                        <div className="order-item-details">
                            <p>{order.book.title || '未知商品'}</p>
                            <p className="order-item-price">
                                ¥{order.book.price || 0} × {order.quantity}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p>暂无商品信息</p>
                )}
            </div>
            <div className="order-actions">
                <span
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="order-delete-link"
                >
                    {isDeleting ? '删除中...' : '删除订单'}
                </span>
            </div>
        </div>
    );
}

export default OrderCard;