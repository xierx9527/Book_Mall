function CommentList({ comments }) {
    if (comments.length === 0) {
        return <p className="no-comment-tip">暂无评论</p>;
    }

    return (
        <div className="comment-list-container">
            {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                    <div className="comment-header ">
                        <div className="">
                            <p className="comment-username">
                                {comment.user_name?.trim() ? comment.user_name : '匿名用户'}
                            </p>
                            {/* 添加时间格式化 */}
                            <p className="comment-time">
                                {new Date(comment.CreatedAt || comment.created_at).toLocaleString('zh-CN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                </div>
            ))}
        </div>
    );
}

export default CommentList;