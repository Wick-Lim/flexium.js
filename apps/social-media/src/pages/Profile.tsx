import { useState } from 'flexium/core'
import { useRouter } from 'flexium/router'
import { usePosts, getUserById, type User } from '../store'

export default function Profile() {
  const r = useRouter()
  const [userId] = useState(() => parseInt(r.params.id))
  const [user] = useState<User | null>(() => {
    const found = getUserById(userId)
    return found || null
  })
  const [posts] = usePosts()
  const [userPosts] = useState(() => posts.filter(p => p.author.id === userId))

  if (!user) {
    return (
      <div class="container">
        <div class="empty-feed">User not found</div>
      </div>
    )
  }

  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0)
  const totalComments = userPosts.reduce((sum, post) => sum + post.comments.length, 0)

  return (
    <div class="container">
      <div class="profile-page">
        <div class="profile-header">
          <div class="profile-avatar-large">{user!.avatar}</div>
          <div class="profile-info">
            <h1>{user.name}</h1>
            <p style="color: var(--text-secondary);">@{user.username}</p>
            <div class="profile-stats">
              <div class="stat">
                <div class="stat-value">{userPosts.length}</div>
                <div class="stat-label">Posts</div>
              </div>
              <div class="stat">
                <div class="stat-value">{totalLikes}</div>
                <div class="stat-label">Likes</div>
              </div>
              <div class="stat">
                <div class="stat-value">{totalComments}</div>
                <div class="stat-label">Comments</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2 style="margin-bottom: 1rem;">Posts</h2>
          {userPosts.length === 0 ? (
            <div class="empty-feed">No posts yet</div>
          ) : (
            userPosts.map(post => (
              <div class="post-card">
                <div class="post-content">{post.content}</div>
                {post.image && <img src={post.image} alt="" class="post-image" />}
                <div class="post-actions">
                  <button class="action-btn">
                    ❤️ {post.likes}
                  </button>
                  <button class="action-btn">
                    💬 {post.comments.length}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
