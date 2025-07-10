import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../services/books';
import '../ordercreate.css';

export default function OrderCreate() {
    const location = useLocation();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [error, setError] = useState(null); // 添加错误状态
    const [formData, setFormData] = useState({
        quantity: 1,
        address: '',
        receiver: '',
        totalPrice: 0 // 新增总价字段
    });

    useEffect(() => {
        if (location.state?.book) {
            setBook(location.state.book);
            // 初始化总价
            setFormData(prev => ({
                ...prev,
                totalPrice: location.state.book.price
            }));
        } else {
            navigate('/books');
        }
    }, [location, navigate]);

    // 计算总价
    useEffect(() => {
        if (book && formData.quantity) {
            const total = book.price * formData.quantity;
            setFormData(prev => ({ ...prev, totalPrice: total }));
        }
    }, [formData.quantity, book]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 从localStorage获取用户ID
            const token = localStorage.getItem('token');
            const userData = JSON.parse(atob(token.split('.')[1]));

            const order = {
                book_id: book.id,
                user_id: userData.user_id, // 添加用户ID
                quantity: Number(formData.quantity),
                total_price: formData.totalPrice,
                status: 'pending',
                address: formData.address,
                receiver: formData.receiver
            };
            await createOrder(order);
            navigate('/orders', { state: { success: '订单创建成功!' } });
        } catch (err) {
            setError(err.message || '创建订单失败');
        }
    };

    if (!book) return <div>加载中...</div>;

    return (
        <div className="order-create-container">
            <h1>确认订单信息</h1>
            {error && <div className="error-message">{error}</div>}
            <div className="book-info">
                <img
                    src={book.cover_image ? `http://localhost:8080/static/${book.cover_image}` : 'https://placehold.co/300x400'}
                    alt={book.title}
                />
                <div>
                    <h2>{book.title}</h2>
                    <p>单价：¥{book.price}</p>
                    <p>库存：{book.stock}本</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>购买数量 (库存: {book.stock})</label>
                    <input
                        type="number"
                        min="1"
                        max={book.stock}
                        value={formData.quantity}
                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>总价</label>
                    <p>¥{formData.totalPrice.toFixed(2)}</p>
                </div>

                <div className="form-group">
                    <label>收货地址</label>
                    <input
                        type="text"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>收货人</label>
                    <input
                        type="text"
                        value={formData.receiver}
                        onChange={e => setFormData({ ...formData, receiver: e.target.value })}
                        required
                    />
                </div>

                <button type="submit" className="confirm-btn" disabled={!formData.address || !formData.receiver}>
                    确认下单
                </button>
            </form>
        </div>
    );
}