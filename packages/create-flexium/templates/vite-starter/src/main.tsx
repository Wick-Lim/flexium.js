import { state } from 'flexium/core'
import { render } from 'flexium/dom'
import { Router, Route, Link, router } from 'flexium/router'

function Home() {
  return (
    <div>
      <h1>Home</h1>
      <p>Welcome to the Router example!</p>
    </div>
  )
}

function About() {
  return <h1>About Page</h1>
}

function User() {
  const r = router()
  return (
    <div>
      <h1>User Page</h1>
      <p>User ID: {() => r.params().id}</p>
    </div>
  )
}

function App() {
  return (
    <Router>
      <nav style={{ display: 'flex', gap: '10px', padding: '10px', background: '#eee' }}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/users/123">User 123</Link>
      </nav>

      <div style={{ padding: '20px' }}>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/users/:id" component={User} />
      </div>
    </Router>
  )
}

render(<App />, document.getElementById('root')!)
