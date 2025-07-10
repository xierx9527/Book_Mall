import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommentForm from '../components/CommentForm';
import CommentList from '../components/CommentList';
import { getBookById, addComment } from '../services/books';
import '../styles.css';


// 在组件外部添加解析函数
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        throw new Error('无效的token格式');
    }
}

// 在顶部导入中添加useNavigate
import { useNavigate } from 'react-router-dom';

function BookDetail() {
    // 添加navigate定义
    const navigate = useNavigate();
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const data = await getBookById(id);
                setBook(data);
                // 直接使用原始评论数据
                setComments(data.comments || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);
    const handleAddComment = async (commentText) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('用户未登录');
            }

            // 使用原生解析方法
            const decoded = parseJwt(token);
            console.log('Decoded token:', decoded); // 调试用
            const response = await addComment(
                id,
                decoded.user_id,
                decoded.username || decoded.user_name, // 添加备选字段
                commentText
            );

            // 重新加载书籍详情
            const data = await getBookById(id);
            setBook(data);
            setComments(data.comments || []);
        } catch (err) {
            alert('添加评论失败: ' + err.message);
        }
    };

    useEffect(() => {
        console.log('Current comments:', comments); // 检查username字段是否存在
    }, [comments]);

    if (loading) return <div className="text-center py-8">加载中...</div>;
    if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

    return (
        <div className="book-detail-container">
            {/* 图片容器 */}
            <div>
                <div className="book-cover-container">
                    <div className="book-cover">
                        <img
                            src={book.cover_image ? `http://localhost:8080/static/${book.cover_image}` : 'https://placehold.co/300x400'}
                            alt={book.title}
                        />
                    </div>
                </div>
            </div>

            {/* 书籍信息容器 */}
            <div>
                <div className="book-info">
                    <h1>{book.title}</h1>
                    <p>作者: {book.author}</p>
                    <p className="book-price">¥{book.price}</p>
                    <p className="book-description">{book.description}</p>
                    <button
                        onClick={() => navigate('/order/create', { state: { book } })}
                        className="add-to-cart-btn"
                    >
                        加入购物车
                    </button>
                </div>
            </div>

            {/* 评论容器 */}
            <div className="comments-container">
                <h2>评论</h2>
                <CommentForm onSubmit={handleAddComment} />
                <CommentList comments={comments} />
            </div>
        </div>
    );
}

export default BookDetail;