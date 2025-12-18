import { use } from 'flexium/core'
import { useCurrentUser, createPost } from '../store'

export default function CreatePost() {
  const [currentUser] = useCurrentUser()
  const [content, setContent] = use('')

  function handleSubmit(e: Event) {
    e.preventDefault()
    if (!content.trim()) return

    createPost(content.trim())
    setContent('')
  }

  return (
    <form class="create-post" onsubmit={handleSubmit}>
      <div class="create-post-header">
        <div class="avatar">{currentUser.avatar}</div>
        <input
          type="text"
          class="post-input"
          placeholder="What's on your mind?"
          value={content}
          oninput={(e: any) => setContent(e.target.value)}
        />
      </div>
      <button type="submit" class="post-btn" disabled={!content.trim()}>
        Post
      </button>
    </form>
  )
}
