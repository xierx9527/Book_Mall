import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { getAuthToken } from '../services/auth';
import './AdminBookManagement.css';
import { getAllBooks } from '../services/books'; // 添加导入

export default function AdminBookManagement() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        price: 0,
        stock: 0,
        description: '',
        cover_image: ''
    });

    // 将fetchBooks函数提取到组件作用域
    const fetchBooks = async () => {
        try {
            const data = await getAllBooks();
            setBooks(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks(); // 这里可以正常调用
    }, []);

    if (loading) return <div className="text-center py-8">加载中...</div>;
    if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

    const handleCreateBook = async (e) => {
        e.preventDefault();
        try {
            if (!newBook.title || !newBook.author || newBook.price <= 0) {
                throw new Error('请填写所有必填字段');
            }

            // 在文件顶部添加API基础路径常量
            const API_BASE_URL = 'http://localhost:8080';

            // 修改handleCreateBook中的请求URL
            const response = await fetch(`${API_BASE_URL}/admin/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    title: newBook.title,
                    author: newBook.author,
                    price: newBook.price,
                    stock: newBook.stock,
                    description: newBook.description,
                    cover_image: newBook.cover_image
                })
            });

            // 克隆响应以便多次读取
            const responseClone = response.clone();

            if (!response.ok) {
                let errorMessage = '创建图书失败';
                try {
                    const errorData = await responseClone.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (jsonError) {
                    try {
                        const text = await response.text();
                        errorMessage = text || errorMessage;
                    } catch (textError) {
                        errorMessage = `HTTP错误: ${response.status}`;
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            setNewBook({
                title: '',
                author: '',
                price: 0,
                stock: 0,
                description: '',
                cover_image: ''
            });
            fetchBooks();
        } catch (error) {
            console.error('创建图书失败:', error);
            setError(error.message);
        }
    };

    const handleDeleteBook = async (id) => {
        if (window.confirm('确定要删除这本图书吗？')) {
            try {
                const API_BASE_URL = 'http://localhost:8080'; // 添加API基础路径
                const response = await fetch(`${API_BASE_URL}/admin/books/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`
                    }
                });

                if (!response.ok) {
                    throw new Error('删除图书失败');
                }
                fetchBooks();
            } catch (error) {
                console.error('删除图书失败:', error);
                setError(error.message);
            }
        }
    };

    return (
        <div className="admin-container">
            <h1>图书管理</h1>

            <div className="book-form">
                <h2>添加新书</h2>
                <form onSubmit={handleCreateBook}>
                    <div className="form-group">
                        <label>书名</label>
                        <input
                            type="text"
                            value={newBook.title}
                            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>作者</label>
                        <input
                            type="text"
                            value={newBook.author}
                            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>价格</label>
                        <input
                            type="number"
                            value={newBook.price}
                            onChange={(e) => setNewBook({ ...newBook, price: parseFloat(e.target.value) })}
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>库存</label>
                        <input
                            type="number"
                            value={newBook.stock}
                            onChange={(e) => setNewBook({ ...newBook, stock: parseInt(e.target.value) })}
                            min="0"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>描述</label>
                        <textarea
                            value={newBook.description}
                            onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>封面图片路径</label>
                        <input
                            type="text"
                            value={newBook.cover_image}
                            onChange={(e) => setNewBook({ ...newBook, cover_image: e.target.value })}
                            placeholder="例如: covers/book1.jpg"
                        />
                    </div>
                    <button type="submit" className="submit-btn">添加图书</button>
                </form>
            </div>

            <div className="book-list">
                <h2>图书列表</h2>
                <div className="books-grid">
                    {books.map(book => (
                        <div key={book.id} className="book-item">
                            <BookCard book={book} />
                            <button
                                onClick={() => handleDeleteBook(book.id)}
                                className="delete-btn"
                            >
                                删除
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
