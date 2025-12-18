import { useState } from 'flexium/core'
import { Link } from 'flexium/router'
import { toggleLike, addComment, type Post, type User } from '../store'
import Comments from './Comments'

export default function PostCard({
  post,
  currentUser,
  showComments,
  onToggleComments
}: {
  post: Post
  currentUser: User
  showComments: boolean
  onToggleComments: () => void
}) {
  const [commentText, setCommentText] = useState('')
  const isLiked = post.likedBy.includes(currentUser.id)

  function handleLike() {
    toggleLike(post.id)
  }

  function handleCommentSubmit(e: Event) {
    e.preventDefault()
    if (!commentText.trim()) return

    addComment(post.id, commentText.trim())
    setCommentText('')
  }

  function formatTime(ms: number) {
    const seconds = Math.floor((Date.now() - ms) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div class="post-card">
      <div class="post-header">
        <Link to={`/profile/${post.author.id}`} class="avatar">
          {post.author.avatar}
        </Link>
        <div>
          <Link to={`/profile/${post.author.id}`} class="post-author">
            {post.author.name}
          </Link>
          <div class="post-time">{formatTime(post.createdAt)}</div>
        </div>
      </div>
      <div class="post-content">{post.content}</div>
      {post.image && <img src={post.image} alt="" class="post-image" />}
      <div class="post-actions">
        <button
          class={`action-btn ${isLiked ? 'liked' : ''}`}
          onclick={handleLike}
        >
          {isLiked ? '❤️' : '🤍'} {post.likes}
        </button>
        <button
          class={`action-btn ${showComments ? 'commented' : ''}`}
          onclick={onToggleComments}
        >
          💬 {post.comments.length}
        </button>
      </div>
      {showComments && (
        <Comments
          post={post}
          currentUser={currentUser}
          commentText={commentText}
          setCommentText={setCommentText}
          onCommentSubmit={handleCommentSubmit}
        />
      )}
    </div>
  )
}
