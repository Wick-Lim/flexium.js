import { use } from 'flexium/core'
import { usePosts, useCurrentUser } from '../store'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'

export default function Feed() {
  const [posts] = usePosts()
  const [currentUser] = useCurrentUser()
  const [showComments, setShowComments] = use<Record<number, boolean>>({})

  return (
    <div class="container">
      <CreatePost />
      <div>
        {posts.length === 0 ? (
          <div class="empty-feed">
            <h2>No posts yet</h2>
            <p>Be the first to share something!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              post={post}
              currentUser={currentUser}
              showComments={showComments[post.id] || false}
              onToggleComments={() => setShowComments({
                ...showComments,
                [post.id]: !showComments[post.id]
              })}
            />
          ))
        )}
      </div>
    </div>
  )
}
