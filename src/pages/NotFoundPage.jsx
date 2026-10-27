import { Link, useLocation } from 'react-router-dom';
import { Brand } from '../components/ui';
import LogoMark from '../components/LogoMark';

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="not-found">
      <nav className="not-found-nav">
        <Brand />
        <Link to="/sign-in" className="btn btn-ghost btn-sm">
          Sign in
        </Link>
      </nav>

      <main className="not-found-body">
        <section className="not-found-card" aria-labelledby="not-found-title">
          <p className="eyebrow">Error 404</p>
          <h2 className="not-found-code" aria-hidden="true">
            <span>4</span>
            <span className="zero">
              0
              <LogoMark size={64} />
            </span>
            <span>4</span>
          </h2>
          <h1 id="not-found-title">This page is not on the proof sheet.</h1>
          <p>
            The link may be old, the proof may have been removed, or the address has a typo. Nothing here
            needs approving.
          </p>
          <span className="not-found-path">{location.pathname}</span>

          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary">
              Back to home
            </Link>
            <Link to="/app" className="btn btn-ghost">
              Go to my projects
            </Link>
          </div>

          <div className="not-found-links">
            <Link to="/sign-in">Sign in</Link>
            <Link to="/sign-up">Create an account</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
