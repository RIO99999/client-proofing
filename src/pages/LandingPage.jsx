import { Link } from 'react-router-dom';
import { Brand } from '../components/ui';

const FEATURES = [
  {
    n: '01',
    title: 'Proofs, not attachments',
    body: 'Upload PNG, JPG, WEBP, GIF or PDF proofs to a project. Every version stays attached to the project it belongs to.'
  },
  {
    n: '02',
    title: 'Approve or ask for changes',
    body: 'Clients view the full-size proof and approve it or request changes, with a note explaining exactly what to fix.'
  },
  {
    n: '03',
    title: 'One thread per proof',
    body: 'Feedback lives beside the artwork in a single thread. No more hunting through WhatsApp for the message that said "make the logo bigger".'
  }
];

export default function LandingPage() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Brand />
        <div className="nav-links">
          <Link to="/sign-in" className="btn btn-ghost btn-sm">
            Sign in
          </Link>
          <Link to="/sign-up" className="btn btn-primary btn-sm">
            Start a project
          </Link>
        </div>
      </nav>

      <section className="hero">
        <div>
          <span className="eyebrow">For designers and their clients</span>
          <h1>
            Proof it once.
            <br />
            <em>Approve it</em> in one place.
          </h1>
          <p className="lede">
            Send graphics to clients, collect approvals and revision notes against each proof, and keep the whole
            back and forth in one thread. No more WhatsApp screenshots.
          </p>
          <div className="hero-actions">
            <Link to="/sign-up" className="btn btn-primary btn-lg">
              Create a project
            </Link>
            <Link to="/sign-in" className="btn btn-outline btn-lg">
              See the demo
            </Link>
          </div>
          <p className="hero-note">Demo account: amara@studioverde.ng · password demo1234</p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="mock-proof">
            <div className="mock-proof-head">
              <strong>Instagram card, launch week</strong>
              <span className="badge badge-revision">Revision</span>
            </div>
            <div className="mock-art">
              <div className="disc" />
              <div className="title">
                Now in
                <br />
                every store
              </div>
            </div>
            <div className="mock-comment">
              <strong>
                Tunde Bello <span className="role-tag">client</span>
              </strong>
              Can the price line be bigger? Customers missed it last time.
            </div>
            <div className="mock-actions">
              <span className="btn-outline" style={{ color: 'var(--forest)', border: '1px solid var(--forest)' }}>
                Approve
              </span>
              <span style={{ background: 'var(--amber)', color: 'var(--ink)' }}>Request changes</span>
            </div>
          </div>
        </div>
      </section>

      <div className="band">
        <div className="band-inner">
          <span>Built for studios sending proofs to clients on Nigerian and global timelines.</span>
          <span>Every decision, timestamped.</span>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <span className="eyebrow">What it does</span>
          <h2>A calmer way to get sign-off.</h2>
          <p>Designed around the three things that eat most of a designer&rsquo;s week: finding the latest file, decoding feedback, and chasing an approval.</p>
        </div>
        <div className="features">
          {FEATURES.map((f) => (
            <article key={f.n} className="feature">
              <span className="feature-num">{f.n}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <span className="eyebrow">How it works</span>
          <h2>Three steps from draft to sign-off.</h2>
        </div>
        <div className="steps">
          <div className="step">
            <span className="n">1</span>
            <h3>Create a project</h3>
            <p>Name the job and send the client a private invite link. They sign up or sign in and land on the project.</p>
          </div>
          <div className="step">
            <span className="n">2</span>
            <h3>Upload proofs</h3>
            <p>Drop in each graphic. The client sees the full-size file, with the status badge for every proof.</p>
          </div>
          <div className="step">
            <span className="n">3</span>
            <h3>Approve or revise</h3>
            <p>One click approves. Requesting changes needs a note, and the thread keeps every round in order.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Stop chasing sign-off on WhatsApp.</h2>
        <p>Set up a project in a minute. Invite the client with a link.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link to="/sign-up" className="btn btn-primary btn-lg">
            Start a project
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <span>Client Proofing System · a MERN portfolio project by Idris Rio, Osogbo</span>
          <span>React, Express, MongoDB, JWT</span>
        </div>
      </footer>
    </div>
  );
}
