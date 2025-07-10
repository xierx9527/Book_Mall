import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { getAllBooks } from '../services/books';

// 顶部添加CSS引入
import '../booklist.css';

function BookList() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const data = await getAllBooks();
                setBooks(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    if (loading) return <div className="text-center py-8">加载中...</div>;
    if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

    return (
        <div className="book-list-container">
            <h1>所有图书</h1>

            <div className="book-grid">
                {books.map(book => (
                    <Link to={`/books/${book.id}`} key={book.id} className="book-item">
                        <BookCard book={book} />
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default BookList;