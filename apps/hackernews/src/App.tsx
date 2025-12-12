import { Router, Route, Link } from 'flexium/router'
import Stories from './pages/Stories'
import Item from './pages/Item'
import User from './pages/User'

function Nav() {
    return (
        <header class="header">
            <nav class="inner">
                <Link to="/" class="logo">
                    <strong>Hacker News</strong>
                </Link>
                <Link to="/top">Top</Link>
                <Link to="/new">New</Link>
                <Link to="/show">Show</Link>
                <Link to="/ask">Ask</Link>
                <Link to="/job">Jobs</Link>
            </nav>
        </header>
    )
}

export default function App() {
    return (
        <Router>
            <a href="#main" class="skip-link">Skip to main content</a>
            <Nav />
            <Route path="/" component={() => <Stories type="top" />} />
            <Route path="/top" component={() => <Stories type="top" />} />
            <Route path="/new" component={() => <Stories type="new" />} />
            <Route path="/show" component={() => <Stories type="show" />} />
            <Route path="/ask" component={() => <Stories type="ask" />} />
            <Route path="/job" component={() => <Stories type="job" />} />
            <Route path="/item/:id" component={Item} />
            <Route path="/user/:id" component={User} />
        </Router>
    )
}
