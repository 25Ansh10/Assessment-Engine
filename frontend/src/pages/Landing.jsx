import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

export default function Landing() {
  const [showCookie, setShowCookie] = useState(false);
  const [counters, setCounters] = useState({ exams: 0, students: 0, accuracy: 0, uptime: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const statsRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem('aritexam_cookie')) setShowCookie(true);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const targets = { exams: 10000, students: 50000, accuracy: 99, uptime: 99.9 };
        const start = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - start) / 2000, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          setCounters({
            exams: Math.round(targets.exams * ease),
            students: Math.round(targets.students * ease),
            accuracy: Math.round(targets.accuracy * ease),
            uptime: +(targets.uptime * ease).toFixed(1),
          });
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const iv = setInterval(() => setActiveFeature(p => (p + 1) % 4), 3500);
    return () => clearInterval(iv);
  }, []);

  // Close menu on Escape key
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const handleCookie = (accept) => {
    localStorage.setItem('aritexam_cookie', accept ? 'accepted' : 'declined');
    setShowCookie(false);
  };

  const features = [
    { icon: '🛡️', title: 'AI Proctoring', desc: 'Face detection, tab monitoring and fullscreen enforcement — live in the browser, no plugin needed.' },
    { icon: '⚡', title: 'Instant Deploy', desc: 'Create an exam in minutes, share a 6-character code. Candidates start in seconds.' },
    { icon: '📊', title: 'Deep Analytics', desc: 'Per-topic scores, class rankings and performance trends delivered the moment the exam ends.' },
    { icon: '🌐', title: 'Any Device', desc: 'Works perfectly on desktop, tablet and mobile. Zero compromise on exam experience.' },
  ];

  const steps = [
    { n: '1', icon: '✏️', title: 'Create your exam', desc: 'Build a question bank, set time limits and configure AI proctoring — all in one place.' },
    { n: '2', icon: '🔗', title: 'Share the code', desc: 'Candidates receive a 6-character access code. They join instantly, no account needed.' },
    { n: '3', icon: '📈', title: 'View results live', desc: 'Scores, analytics and proctoring reports are ready the moment the exam is submitted.' },
  ];

  const testimonials = [
    { name: 'Dr. Priya Sharma', role: 'Dean of Academics, MIT Pune', text: 'AritExam changed how we run semester exams. The AI proctoring is accurate and our faculty love the analytics dashboard.', av: 'PS', stars: 5 },
    { name: 'Rahul Verma', role: 'HR Director, TCS', text: 'We ran 3,000 candidate assessments in a single day without a single issue. Truly enterprise-grade reliability.', av: 'RV', stars: 5 },
    { name: 'Sneha Kulkarni', role: 'Training Head, Infosys', text: 'Our candidates actually enjoy the exam experience. That\'s something we never expected to hear about an exam platform.', av: 'SK', stars: 5 },
  ];

  return (
    <div className="lp">

      {/* ── HAMBURGER BUTTON ── */}
      <button
        className={`lp-hamburger ${menuOpen ? 'lp-hamburger--open' : ''}`}
        onClick={() => setMenuOpen(p => !p)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* ── SLIDE-IN MENU ── */}
      <div className={`lp-menu ${menuOpen ? 'lp-menu--open' : ''}`}>
        <div className="lp-menu__logo">
          <span className="lp-nav__logo-icon">A</span>
          AritExam
        </div>
        <nav className="lp-menu__links">
          <a href="#features"     className="lp-menu__link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="lp-menu__link" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#reviews"      className="lp-menu__link" onClick={() => setMenuOpen(false)}>Reviews</a>
          <a href="#stats"        className="lp-menu__link" onClick={() => setMenuOpen(false)}>Stats</a>
        </nav>
        <div className="lp-menu__actions">
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            <button className="lp-btn-outline" style={{ width: '100%' }}>Candidate Login</button>
          </Link>
          <Link to="/admin-login" onClick={() => setMenuOpen(false)}>
            <button className="lp-btn-outline" style={{ width: '100%' }}>Admin Login</button>
          </Link>
          <Link to="/register" onClick={() => setMenuOpen(false)}>
            <button className="lp-btn-primary" style={{ width: '100%' }}>Get Started Free →</button>
          </Link>
        </div>
      </div>

      {/* ── OVERLAY ── */}
      {menuOpen && <div className="lp-overlay" onClick={() => setMenuOpen(false)} />}

      {/* ── HERO ── */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero__left">
          <div className="lp-hero__badge">
            <span className="lp-hero__badge-dot" />
            AI-Powered Exam Platform
          </div>

          <h1 className="lp-hero__h1">
            AritExam,<br />
            <span className="lp-hero__accent">Assessments</span><br />
            Simplified!
          </h1>

          <p className="lp-hero__desc">
            Conduct secure, intelligent online exams with real-time AI proctoring —
            built for institutions, enterprises and educators across India.
          </p>

          <div className="lp-hero__actions">
            <Link to="/register">
              <button className="lp-btn-primary">Sign Up for Free</button>
            </Link>
            <Link to="/login">
              <button className="lp-btn-outline">Candidate Login</button>
            </Link>
          </div>

          <div className="lp-hero__checks">
            <span className="lp-check">AI Proctoring</span>
            <span className="lp-check">Instant Results</span>
            <span className="lp-check">Any Device</span>
            <span className="lp-check">Free to Start</span>
          </div>

          <div className="lp-hero__proof">
            <div className="lp-proof-avs">
              {['A','B','C','D','E'].map((l, i) => (
                <span key={i} className="lp-proof-av" style={{ marginLeft: i ? '-8px' : 0 }}>{l}</span>
              ))}
            </div>
            <div>
              <div className="lp-proof-num">50,000+</div>
              <div className="lp-proof-lbl">Monthly Active Students</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT IMAGE AREA ── */}
        <div className="lp-hero__right">
          <div className="lp-hero__img-wrap">
            <div className="lp-hero__grid-bg" />

            <div className="lp-hero__illustration">
              <div className="lp-hero__illus-circle" />
              <div className="lp-hero__screen-mock">
                <div className="lp-screen__bar">
                  <span /><span /><span />
                </div>
                <div className="lp-screen__content">
                  <div className="lp-screen__q-row">
                    <div className="lp-screen__q-dot lp-screen__q-dot--blue" />
                    <div className="lp-screen__q-line lp-screen__q-line--long" />
                  </div>
                  <div className="lp-screen__opts">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`lp-screen__opt ${i===2 ? 'lp-screen__opt--sel' : ''}`}>
                        <div className={`lp-screen__opt-dot ${i===2 ? 'lp-screen__opt-dot--sel' : ''}`} />
                        <div className="lp-screen__opt-line" style={{ width: `${[70,55,80,60][i-1]}%` }} />
                        {i===2 && <span className="lp-screen__opt-check">✓</span>}
                      </div>
                    ))}
                  </div>
                  <div className="lp-screen__bottom">
                    <div className="lp-screen__proctor">
                      <span className="lp-screen__proctor-dot" />
                      AI Proctoring Active
                    </div>
                    <div className="lp-screen__timer">⏱ 42:18</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lp-float lp-float--1">
              <div className="lp-float__icon">🎯</div>
              <div>
                <div className="lp-float__val">99.2%</div>
                <div className="lp-float__lbl">AI Accuracy</div>
              </div>
            </div>

            <div className="lp-float lp-float--2">
              <div className="lp-float__icon">👥</div>
              <div>
                <div className="lp-float__val">2,847</div>
                <div className="lp-float__lbl">Active Now</div>
              </div>
            </div>

            <div className="lp-float lp-float--3">
              <div className="lp-float__icon">⚡</div>
              <div>
                <div className="lp-float__val">Instant</div>
                <div className="lp-float__lbl">Results</div>
              </div>
            </div>

            <div className="lp-rating">
              <div className="lp-rating__stars">★★★★★</div>
              <div className="lp-rating__score">4.8</div>
              <div className="lp-rating__lbl">Google Reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="lp-marquee">
        <div className="lp-marquee__label">Trusted by</div>
        <div className="lp-marquee__track-wrap">
          <div className="lp-marquee__track">
            {['MIT Pune','TCS','Infosys','Wipro','IIT Bombay','BITS Pilani','Cognizant','HCL','NIT Nagpur','Accenture',
              'MIT Pune','TCS','Infosys','Wipro','IIT Bombay','BITS Pilani','Cognizant','HCL','NIT Nagpur','Accenture'].map((n,i)=>(
              <span key={i} className="lp-marquee__item">
                <span className="lp-marquee__sep">·</span>{n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="lp-stats" ref={statsRef} id="stats">
        <div className="lp-inner">
          <div className="lp-stats__grid">
            {[
              { val: counters.exams.toLocaleString()+'+', label: 'Exams Delivered', icon: '📝' },
              { val: counters.students.toLocaleString()+'+', label: 'Students Served', icon: '🎓' },
              { val: counters.accuracy+'%', label: 'Proctoring Accuracy', icon: '🤖' },
              { val: counters.uptime+'%', label: 'Platform Uptime', icon: '⚙️' },
            ].map((s,i) => (
              <div key={i} className="lp-stat reveal-up" style={{ animationDelay: `${i*0.1}s` }}>
                <div className="lp-stat__icon">{s.icon}</div>
                <div className="lp-stat__val">{s.val}</div>
                <div className="lp-stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-features" id="features">
        <div className="lp-inner">
          <div className="lp-section-head reveal-up">
            <span className="lp-tag">Why AritExam</span>
            <h2 className="lp-section-title">Everything your exam needs,<br />nothing it doesn't</h2>
            <p className="lp-section-desc">Purpose-built for modern assessment — no legacy baggage, no confusing UX.</p>
          </div>
          <div className="lp-features__grid">
            {features.map((f, i) => (
              <div key={i} className="lp-feat reveal-up" style={{ animationDelay: `${i*0.1}s` }}>
                <div className="lp-feat__icon">{f.icon}</div>
                <h3 className="lp-feat__title">{f.title}</h3>
                <p className="lp-feat__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-how" id="how-it-works">
        <div className="lp-inner lp-how__inner">
          <div className="lp-how__left">
            <span className="lp-tag reveal-up">How it works</span>
            <h2 className="lp-section-title reveal-up">From zero to<br />exam-ready in<br />3 simple steps</h2>
            <p className="lp-section-desc reveal-up">
              No training required. AritExam is intuitive enough for first-time users and powerful enough for enterprise.
            </p>
            <Link to="/register">
              <button className="lp-btn-primary reveal-up">Start for Free →</button>
            </Link>
          </div>
          <div className="lp-how__steps">
            {steps.map((s, i) => (
              <div key={i} className="lp-step reveal-up" style={{ animationDelay: `${i*0.12}s` }}>
                <div className="lp-step__num">{s.n}</div>
                <div className="lp-step__icon">{s.icon}</div>
                <div>
                  <h3 className="lp-step__title">{s.title}</h3>
                  <p className="lp-step__desc">{s.desc}</p>
                </div>
                {i < 2 && <div className="lp-step__connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-reviews" id="reviews">
        <div className="lp-inner">
          <div className="lp-section-head reveal-up">
            <span className="lp-tag">Reviews</span>
            <h2 className="lp-section-title">What educators and<br />enterprises are saying</h2>
          </div>
          <div className="lp-reviews__grid">
            {testimonials.map((t, i) => (
              <div key={i} className="lp-review reveal-up" style={{ animationDelay: `${i*0.12}s` }}>
                <div className="lp-review__stars">{'★'.repeat(t.stars)}</div>
                <p className="lp-review__text">"{t.text}"</p>
                <div className="lp-review__author">
                  <div className="lp-review__av">{t.av}</div>
                  <div>
                    <div className="lp-review__name">{t.name}</div>
                    <div className="lp-review__role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta reveal-scale">
        <div className="lp-inner lp-cta__inner">
          <div className="lp-cta__left">
            <h2 className="lp-cta__title">Ready to conduct your<br />first smart exam?</h2>
            <p className="lp-cta__desc">Join 500+ institutions. Free plan available. No credit card needed.</p>
            <div className="lp-cta__actions">
              <Link to="/register"><button className="lp-btn-primary lp-btn-primary--lg">Create Free Account</button></Link>
              <Link to="/login"><button className="lp-btn-outline">Sign In</button></Link>
            </div>
            <div className="lp-cta__trust">
              <span>✓ Free forever plan</span>
              <span>✓ No credit card</span>
              <span>✓ Setup in 2 minutes</span>
            </div>
          </div>
          <div className="lp-cta__right">
            <div className="lp-cta__card">
              <div className="lp-cta__card-icon">🚀</div>
              <div>
                <div className="lp-cta__card-stat">10,000+</div>
                <div className="lp-cta__card-lbl">Exams delivered this month</div>
              </div>
            </div>
            <div className="lp-cta__card lp-cta__card--2">
              <div className="lp-cta__card-icon">🛡️</div>
              <div>
                <div className="lp-cta__card-stat">99.2%</div>
                <div className="lp-cta__card-lbl">AI proctoring accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-inner lp-footer__inner">
          <div className="lp-footer__brand">
            <div className="lp-footer__logo">
              <span className="lp-nav__logo-icon">A</span> AritExam
            </div>
            <p className="lp-footer__tagline">The future of secure online assessment, built for India.</p>
            <div className="lp-footer__social">
              <a href="#" className="lp-footer__social-link">Twitter</a>
              <a href="#" className="lp-footer__social-link">LinkedIn</a>
              <a href="#" className="lp-footer__social-link">Instagram</a>
            </div>
          </div>
          <div className="lp-footer__cols">
            <div className="lp-footer__col">
              <div className="lp-footer__col-head">Product</div>
              <a href="#features">Features</a>
              <a href="#stats">Stats</a>
              <Link to="/register">Sign Up Free</Link>
            </div>
            <div className="lp-footer__col">
              <div className="lp-footer__col-head">Platform</div>
              <Link to="/login">Candidate Login</Link>
              <Link to="/admin-login">Admin Login</Link>
              <a href="#how-it-works">How it works</a>
            </div>
            <div className="lp-footer__col">
              <div className="lp-footer__col-head">Company</div>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Use</a>
              <a href="#contact">Contact Us</a>
            </div>
          </div>
        </div>
        <div className="lp-footer__bottom">
          <div className="lp-inner lp-footer__bottom-inner">
            <span>© 2026 AritExam. All rights reserved.</span>
            <span>Made with ♥ in India</span>
          </div>
        </div>
      </footer>

      {/* ── COOKIE ── */}
      {showCookie && (
        <div className="lp-cookie">
          <h4>🍪 Cookie Preferences</h4>
          <p>We use cookies to improve your experience and analyze usage.</p>
          <div className="lp-cookie__btns">
            <button className="lp-btn-primary" onClick={() => handleCookie(true)}>Accept All</button>
            <button className="lp-cookie__decline" onClick={() => handleCookie(false)}>Decline</button>
          </div>
        </div>
      )}
    </div>
  );
}