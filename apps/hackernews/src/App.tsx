import { Routes, Route, Link } from 'flexium/router'
import Stories from './pages/Stories'
import Item from './pages/Item'
import User from './pages/User'

function Nav() {
    return (
        <header class="header">
            <nav class="inner">
                <Link to="/" class="logo">
                    <span class="logo-y">Y</span>
                </Link>
                <Link to="/" class="site-name">
                    <strong>Hacker News</strong>
                </Link>
                <span class="links">
                    <Link to="/new">new</Link> |{' '}
                    <Link to="/show">show</Link> |{' '}
                    <Link to="/ask">ask</Link> |{' '}
                    <Link to="/jobs">jobs</Link>
                </span>
            </nav>
        </header>
    )
}

export default function App() {
    return (
        <Routes>
            <a href="#main" class="skip-link">Skip to main content</a>
            <Nav />
            <Route path="/" component={() => <Stories type="top" />} />
            <Route path="/new" component={() => <Stories type="new" />} />
            <Route path="/show" component={() => <Stories type="show" />} />
            <Route path="/ask" component={() => <Stories type="ask" />} />
            <Route path="/jobs" component={() => <Stories type="job" />} />
            <Route path="/item/:id" component={Item} />
            <Route path="/user/:id" component={User} />
        </Routes>
    )
}
