import { Link } from 'flexium/router'
import { type Post, type User } from '../store'

export default function Comments({
  post,
  currentUser,
  commentText,
  setCommentText,
  onCommentSubmit
}: {
  post: Post
  currentUser: User
  commentText: string
  setCommentText: (text: string) => void
  onCommentSubmit: (e: Event) => void
}) {
  function formatTime(ms: number) {
    const seconds = Math.floor((Date.now() - ms) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div class="comments-section">
      {post.comments.map(comment => (
        <div class="comment">
          <Link to={`/profile/${comment.author.id}`} class="comment-avatar">
            {comment.author.avatar}
          </Link>
          <div class="comment-content">
            <div>
              <Link to={`/profile/${comment.author.id}`} class="comment-author">
                {comment.author.name}
              </Link>
              <span style="color: var(--text-secondary); font-size: 0.75rem;">
                {' '}{formatTime(comment.createdAt)}
              </span>
            </div>
            <div class="comment-text">{comment.content}</div>
          </div>
        </div>
      ))}
      <form class="comment-input-container" onsubmit={onCommentSubmit}>
        <div class="comment-avatar">{currentUser.avatar}</div>
        <input
          type="text"
          class="comment-input"
          placeholder="Write a comment..."
          value={commentText}
          oninput={(e: any) => setCommentText(e.target.value)}
        />
        <button type="submit" class="comment-submit" disabled={!commentText.trim()}>
          Post
        </button>
      </form>
    </div>
  )
}
