import { useState } from 'react';

function CommentForm({ onSubmit }) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content);
            setContent('');
        } catch (err) {
            console.error('提交评论失败:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你的评论..."
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                disabled={isSubmitting}
            />
            <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
                {isSubmitting ? '提交中...' : '提交评论'}
            </button>
        </form>
    );
}

export default CommentForm;