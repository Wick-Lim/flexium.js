import { Routes, Route, Link } from 'flexium/router'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import { useCurrentUser } from './store'

function Nav() {
  const [currentUser] = useCurrentUser()

  return (
    <header class="header">
      <div class="header-content">
        <Link to="/" class="logo">📱 Flexium Social</Link>
        <nav class="nav-links">
          <Link to={`/profile/${currentUser.id}`}>Profile</Link>
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <Routes>
      <Nav />
      <Route path="/" component={Feed} />
      <Route path="/profile/:id" component={Profile} />
    </Routes>
  )
}
