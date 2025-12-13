import { state } from 'flexium/core'

export interface User {
  id: number
  username: string
  name: string
  avatar: string
}

export interface Comment {
  id: number
  author: User
  content: string
  createdAt: number
}

export interface Post {
  id: number
  author: User
  content: string
  image?: string
  likes: number
  likedBy: number[]
  comments: Comment[]
  createdAt: number
}

const mockUsers: User[] = [
  { id: 1, username: 'alice', name: 'Alice Johnson', avatar: 'A' },
  { id: 2, username: 'bob', name: 'Bob Smith', avatar: 'B' },
  { id: 3, username: 'charlie', name: 'Charlie Brown', avatar: 'C' },
  { id: 4, username: 'diana', name: 'Diana Prince', avatar: 'D' }
]

const currentUser: User = mockUsers[0]

const mockPosts: Post[] = [
  {
    id: 1,
    author: mockUsers[1],
    content: 'Just finished building an amazing new feature! 🚀',
    likes: 24,
    likedBy: [2, 3],
    comments: [
      {
        id: 1,
        author: mockUsers[2],
        content: 'Looks great! Can\'t wait to try it out.',
        createdAt: Date.now() - 3600000
      }
    ],
    createdAt: Date.now() - 7200000
  },
  {
    id: 2,
    author: mockUsers[2],
    content: 'Beautiful sunset today 🌅',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    likes: 42,
    likedBy: [1, 2, 4],
    comments: [],
    createdAt: Date.now() - 10800000
  },
  {
    id: 3,
    author: mockUsers[3],
    content: 'Working on some exciting new projects. Stay tuned! 💼',
    likes: 18,
    likedBy: [1, 2],
    comments: [
      {
        id: 2,
        author: mockUsers[0],
        content: 'Excited to see what you\'re building!',
        createdAt: Date.now() - 1800000
      },
      {
        id: 3,
        author: mockUsers[1],
        content: 'Looking forward to it!',
        createdAt: Date.now() - 900000
      }
    ],
    createdAt: Date.now() - 14400000
  }
]

export function useCurrentUser() {
  return state<User>(currentUser, { key: ['currentUser'] })
}

export function usePosts() {
  return state<Post[]>(mockPosts, { key: ['posts'] })
}

let nextPostId = Math.max(...mockPosts.map(p => p.id)) + 1
let nextCommentId = Math.max(...mockPosts.flatMap(p => p.comments.map(c => c.id))) + 1

export function createPost(content: string, image?: string) {
  const [posts, setPosts] = usePosts()
  const [currentUser] = useCurrentUser()

  const newPost: Post = {
    id: nextPostId++,
    author: currentUser,
    content,
    image,
    likes: 0,
    likedBy: [],
    comments: [],
    createdAt: Date.now()
  }

  setPosts([newPost, ...posts])
}

export function toggleLike(postId: number) {
  const [posts, setPosts] = usePosts()
  const [currentUser] = useCurrentUser()

  setPosts(posts.map(post => {
    if (post.id !== postId) return post

    const isLiked = post.likedBy.includes(currentUser.id)
    return {
      ...post,
      likes: isLiked ? post.likes - 1 : post.likes + 1,
      likedBy: isLiked
        ? post.likedBy.filter(id => id !== currentUser.id)
        : [...post.likedBy, currentUser.id]
    }
  }))
}

export function addComment(postId: number, content: string) {
  const [posts, setPosts] = usePosts()
  const [currentUser] = useCurrentUser()

  const newComment: Comment = {
    id: nextCommentId++,
    author: currentUser,
    content,
    createdAt: Date.now()
  }

  setPosts(posts.map(post =>
    post.id === postId
      ? { ...post, comments: [...post.comments, newComment] }
      : post
  ))
}

export function getUserById(userId: number): User | undefined {
  return mockUsers.find(u => u.id === userId)
}
