import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center max-w-md px-4">
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">页面未找到</h2>
                <p className="text-gray-600 mb-8">
                    您访问的页面不存在或已被移除。请检查URL或返回首页。
                </p>
                <Link
                    to="/"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                    返回首页
                </Link>
            </div>
        </div>
    );
}

export default NotFound;