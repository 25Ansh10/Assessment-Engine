  import { useState, useEffect, useRef } from 'react';
  import { Link } from 'react-router-dom';
  import '../styles/Landing.css';

  export default function Landing() {
    const [showCookie, setShowCookie] = useState(false);
    const [counters, setCounters] = useState({ exams: 0, students: 0, accuracy: 0, uptime: 0 });
    const [navScrolled, setNavScrolled] = useState(false);
    const statsRef = useRef(null);
    const hasAnimated = useRef(false);

    // Cookie consent delay
    useEffect(() => {
      const timer = setTimeout(() => {
        if (!localStorage.getItem('aritexam_cookie')) setShowCookie(true);
      }, 2500);
      return () => clearTimeout(timer);
    }, []);

    // Nav scroll detection
    useEffect(() => {
      const handleScroll = () => setNavScrolled(window.scrollY > 60);
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Counter animation on scroll
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            animateCounters();
          }
        },
        { threshold: 0.3 }
      );
      if (statsRef.current) observer.observe(statsRef.current);
      return () => observer.disconnect();
    }, []);

    const animateCounters = () => {
      const targets = { exams: 10000, students: 50000, accuracy: 99, uptime: 99.9 };
      const duration = 2200;
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4); // quartic easeOut
        setCounters({
          exams: Math.round(targets.exams * ease),
          students: Math.round(targets.students * ease),
          accuracy: Math.round(targets.accuracy * ease),
          uptime: +(targets.uptime * ease).toFixed(1),
        });
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const handleCookie = (accept) => {
      localStorage.setItem('aritexam_cookie', accept ? 'accepted' : 'declined');
      setShowCookie(false);
    };

    // Scroll reveal
    useEffect(() => {
      const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) e.target.classList.add('visible');
          });
        },
        { threshold: 0.12 }
      );
      reveals.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, []);

    return (
      <div className="landing-page">
        {/* STITCH 3 v2 — Floating Island Nav */}
        <nav className={`landing-nav ${navScrolled ? 'scrolled' : ''}`} id="landing-nav">
          <span className="landing-nav__logo">AritExam</span>
          <div className="landing-nav__links">
            <Link to="/login" className="landing-nav__link">Login</Link>
            <Link to="/admin-login" className="landing-nav__link">Admin</Link>
            <Link to="/register" className="landing-nav__cta">Get Started</Link>
          </div>
        </nav>

        {/* Hero: Cinematic Full-Bleed */}
        <section className="landing-hero" id="hero-section">
          <div className="landing-hero__left">
            <div className="landing-hero__badge">
              <span>AI-Powered Assessments</span>
            </div>
            <h1 className="landing-hero__headline">
              The Future of<br />
              <span className="gradient-text">Secure Exams</span><br />
              Starts Here
            </h1>
            <p className="landing-hero__tagline">
              AritExam delivers intelligent proctoring, real-time monitoring, and
              bias-free assessments — all wrapped in an experience that feels
              nothing like a traditional test platform.
            </p>
            <div className="landing-hero__actions">
              <Link to="/register">
                <button className="landing-btn-primary ripple-btn magnetic-btn" id="hero-signup-btn">
                  Start Free Trial
                </button>
              </Link>
              <Link to="/login">
                <button className="landing-btn-secondary magnetic-btn" id="hero-login-btn">
                  Candidate Login
                </button>
              </Link>
            </div>
          </div>

          <div className="landing-hero__right">
            <div className="landing-hero__right-bg"></div>
            <div className="landing-visual">
              <div className="landing-visual__grid"></div>
              <div className="landing-visual__orb landing-visual__orb--1"></div>
              <div className="landing-visual__orb landing-visual__orb--2"></div>
              <div className="landing-visual__orb landing-visual__orb--3"></div>

              <div className="landing-visual__card landing-visual__card--1">
                <div className="landing-visual__card-label">Active Sessions</div>
                <div className="landing-visual__card-value">2,847</div>
              </div>
              <div className="landing-visual__card landing-visual__card--2">
                <div className="landing-visual__card-label">AI Accuracy</div>
                <div className="landing-visual__card-value">99.2%</div>
              </div>
              <div className="landing-visual__card landing-visual__card--3">
                <div className="landing-visual__card-label">Exams Today</div>
                <div className="landing-visual__card-value">1,204</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats — Ticker Strip */}
        <section className="landing-stats" ref={statsRef} id="stats-section">
          <div className="landing-stat reveal">
            <div className="landing-stat__number">{counters.exams.toLocaleString()}+</div>
            <div className="landing-stat__label">Exams Delivered</div>
          </div>
          <div className="landing-stat reveal">
            <div className="landing-stat__number">{counters.students.toLocaleString()}+</div>
            <div className="landing-stat__label">Students Served</div>
          </div>
          <div className="landing-stat reveal">
            <div className="landing-stat__number">{counters.accuracy}%</div>
            <div className="landing-stat__label">Proctoring Accuracy</div>
          </div>
          <div className="landing-stat reveal">
            <div className="landing-stat__number">{counters.uptime}%</div>
            <div className="landing-stat__label">Platform Uptime</div>
          </div>
        </section>

        {/* Features — Zigzag Asymmetric */}
        <section className="landing-features" id="features-section">
          <div className="landing-features__header reveal">
            <div className="landing-features__subtitle">Why AritExam</div>
            <h2 className="landing-features__title">Assessment infrastructure that actually works</h2>
            <p className="landing-features__desc">
              Forget clunky exam portals. AritExam combines AI proctoring with beautiful UX
              to create assessments your candidates will actually want to take.
            </p>
          </div>

          <div className="landing-feature-list">
            <div className="landing-feature-item reveal">
              <div className="landing-feature-item__icon landing-feature-item__icon--1">🛡️</div>
              <div className="landing-feature-item__content">
                <h3>AI-Powered Proctoring</h3>
                <p>
                  Real-time face detection, tab-switch monitoring, clipboard blocking,
                  and fullscreen enforcement — all running seamlessly in the browser
                  without any software installation.
                </p>
              </div>
            </div>

            <div className="landing-feature-item reveal">
              <div className="landing-feature-item__icon landing-feature-item__icon--2">⚡</div>
              <div className="landing-feature-item__content">
                <h3>Instant Exam Deployment</h3>
                <p>
                  Create and deploy exams in minutes. Share a 6-character test code with
                  candidates — they enter it, verify identity, and start immediately.
                  No downloads, no plugins, no friction.
                </p>
              </div>
            </div>

            <div className="landing-feature-item reveal">
              <div className="landing-feature-item__icon landing-feature-item__icon--3">📊</div>
              <div className="landing-feature-item__content">
                <h3>Rich Analytics</h3>
                <p>
                  Detailed per-topic breakdowns, animated score visualizations, class
                  rankings, and performance trends — delivered to candidates the moment
                  they submit their exam.
                </p>
              </div>
            </div>

            <div className="landing-feature-item reveal">
              <div className="landing-feature-item__icon landing-feature-item__icon--4">🌐</div>
              <div className="landing-feature-item__content">
                <h3>Works Everywhere</h3>
                <p>
                  Fully responsive platform that works on desktop, tablet, and mobile.
                  Exams adapt their layout to the device — from cockpit mode on desktop
                  to swipe navigation on mobile.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="landing-cta reveal-scale" id="cta-section">
          <h2 className="landing-cta__title">Ready to transform your assessments?</h2>
          <p className="landing-cta__desc">
            Join thousands of institutions already using AritExam to deliver
            secure, intelligent, and beautiful online assessments.
          </p>
          <Link to="/register">
            <button className="landing-btn-primary ripple-btn magnetic-btn" id="cta-signup-btn">
              Create Free Account
            </button>
          </Link>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <span>© 2026 AritExam. All rights reserved.</span>
          <div className="landing-footer__links">
            <a href="#privacy" className="link-underline">Privacy</a>
            <a href="#terms" className="link-underline">Terms</a>
            <a href="#contact" className="link-underline">Contact</a>
          </div>
        </footer>

        {/* Cookie — Glass Morphism */}
        {showCookie && (
          <div className="cookie-card" id="cookie-consent">
            <h4>🍪 Cookie Preferences</h4>
            <p>
              We use cookies to enhance your experience and analyze platform usage.
              You can accept all cookies or decline non-essential ones.
            </p>
            <div className="cookie-card__actions">
              <button className="cookie-card__accept" onClick={() => handleCookie(true)} id="cookie-accept-btn">
                Accept All
              </button>
              <button className="cookie-card__decline" onClick={() => handleCookie(false)} id="cookie-decline-btn">
                Decline
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
