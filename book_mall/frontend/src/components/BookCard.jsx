// 顶部添加CSS引入
import '../bookcard.css';

function BookCard({ book }) {
    return (
        <div className="book-card">
            <img
                src={book.cover_image ? `http://localhost:8080/static/${book.cover_image}?t=${Date.now()}` : 'https://placehold.co/300x400'}
                alt={book.title}
                className="book-cover"
            />
            <div className="book-details">
                <h3 className="book-title">{book.title}</h3>
                <div className="meta-info">
                    <p className="book-author">作者：{book.author}</p>
                    <div className="book-info">
                        <span className="book-price">¥{book.price}</span>
                        <span className="book-stock">库存 {book.stock}本</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookCard;