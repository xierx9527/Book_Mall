import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getFeaturedBooks } from '../services/books';
import BookCard from '../components/BookCard';

// 在顶部添加CSS引入
import '../home.css';

function Home() {
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeaturedBooks = async () => {
            try {
                // 假设后端有一个获取推荐图书的接口
                // 这里暂时用getAllBooks代替
                const data = await getFeaturedBooks();
                setFeaturedBooks(data.slice(0, 4)); // 取前4本作为推荐
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedBooks();
    }, []);

    return (
        <div className="home-container">
            {/* 英雄区域 */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>发现你的下一本好书</h1>
                    <p className="hero-subtitle">
                        探索我们精心挑选的图书收藏，享受阅读的乐趣
                    </p>
                    <Link
                        to="/books"
                        className="cta-button"
                    >
                        浏览图书
                    </Link>
                </div>
            </section>

            {/* 推荐图书 */}
            <section className="featured-section">
                <div className="section-header">
                    <h2>精选推荐</h2>
                    <Link to="/books" className="view-all">
                        查看全部 &rarr;
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-8">加载中...</div>
                ) : error ? (
                    <div className="text-red-500 text-center py-8">{error}</div>
                ) : (
                    <div className="horizontal-scroll">
                        {featuredBooks.map(book => (
                            <Link
                                to={`/books/${book.id}`}
                                key={book.id}
                                className="book-item"
                            >
                                <BookCard book={book} />
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* 特色区域 */}
            <section className="features-section">
                <h2>为什么选择我们</h2>
                <div className="feature-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🚚</div>
                        <h3>快速配送</h3>
                        <p>全国范围内快速送达，确保您尽快收到心仪的图书</p>
                    </div>
                    {/* 新增优惠价格卡片 */}
                    <div className="feature-card">
                        <div className="feature-icon">💰</div>
                        <h3>优惠价格</h3>
                        <p>我们提供最具竞争力的价格和定期促销活动</p>
                    </div>
                    {/* 新增海量选择卡片 */}
                    <div className="feature-card">
                        <div className="feature-icon">📚</div>
                        <h3>海量选择</h3>
                        <p>超过10万种图书供您选择，满足各种阅读需求</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;