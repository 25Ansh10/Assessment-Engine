import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

import heroStudents from '../assets/hero_students.png';
import aiProctoring from '../assets/ai_proctoring.png';
import analyticsDashboard from '../assets/analytics_dashboard.png';
import securityFeatures from '../assets/security_features.png';

export default function Landing() {
  const [showCookie, setShowCookie] = useState(false);
  const [counters, setCounters] = useState({ exams: 0, students: 0, accuracy: 0, uptime: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const statsRef = useRef(null);
  const hasAnimated = useRef(false);
  const heroRef = useRef(null);

  // Cookie consent
  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem('arithexam_cookie')) setShowCookie(true);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Stats counter animation
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

  // Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Cycle active step
  useEffect(() => {
    const iv = setInterval(() => setActiveStep(p => (p + 1) % 4), 3000);
    return () => clearInterval(iv);
  }, []);

  // Close menu on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  // Mouse tracking for Hero parallax
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e) => {
      const rect = hero.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    };
    hero.addEventListener('mousemove', onMove);
    return () => hero.removeEventListener('mousemove', onMove);
  }, []);

  const handleCookie = (accept) => {
    localStorage.setItem('arithexam_cookie', accept ? 'accepted' : 'declined');
    setShowCookie(false);
  };

  const features = [
    { icon: '🛡️', title: 'AI Proctoring', desc: 'Face detection, tab monitoring and fullscreen enforcement — live in the browser, no plugin needed.', color: '#1a4fff', img: aiProctoring },
    { icon: '⚡', title: 'Instant Deploy', desc: 'Create an exam in minutes, share a 6-character code. Candidates start in seconds.', color: '#00b96b', img: null },
    { icon: '📊', title: 'Deep Analytics', desc: 'Per-topic scores, class rankings and performance trends — delivered the moment the exam ends.', color: '#7c3aed', img: analyticsDashboard },
    { icon: '🌐', title: 'Any Device', desc: 'Works perfectly on desktop, tablet and mobile. Zero compromise on exam experience.', color: '#f59e0b', img: null },
  ];

  const featureShowcase = [
    {
      tag: 'AI Proctoring',
      title: 'Real-time AI monitoring that students barely notice',
      desc: 'Our computer vision engine detects face movements, tracks eye gaze, monitors tab switches, and enforces fullscreen — all running locally in the browser with zero latency.',
      img: aiProctoring,
      badges: ['Face Detection', 'Tab Monitoring', 'Fullscreen Lock', 'Browser-Based'],
      accent: '#1a4fff',
    },
    {
      tag: 'Analytics Dashboard',
      title: 'Performance insights that drive better outcomes',
      desc: 'Interactive dashboards with per-topic analysis, class rankings, performance trends, and exportable reports — available the moment the exam ends.',
      img: analyticsDashboard,
      badges: ['Real-time Scores', 'Topic Analysis', 'Class Rankings', 'Export Reports'],
      accent: '#7c3aed',
    },
    {
      tag: 'Enterprise Security',
      title: 'Bank-grade security your institution can trust',
      desc: 'End-to-end encrypted exam delivery, SOC 2 compliant infrastructure, and multi-layer fraud detection that catches 99.2% of cheating attempts.',
      img: securityFeatures,
      badges: ['E2E Encryption', 'SOC 2 Compliant', 'Fraud Detection', 'Data Privacy'],
      accent: '#00b96b',
    },
  ];

  const steps = [
    { n: '1', icon: '✏️', title: 'Create your exam', desc: 'Build a question bank, set time limits and configure AI proctoring — all in one place.' },
    { n: '2', icon: '🔗', title: 'Share the code', desc: 'Candidates receive a 6-character access code. They join instantly, no separate account needed.' },
    { n: '3', icon: '🚀', title: 'Start the exam', desc: 'AI proctoring activates automatically. Full screen enforcement, tab monitoring, and face detection.' },
    { n: '4', icon: '📈', title: 'View results live', desc: 'Scores, analytics and proctoring reports are ready the moment the exam is submitted.' },
  ];

  const testimonials = [
    { name: 'Dr. Priya Sharma', role: 'Dean of Academics, MIT Pune', text: 'ArithExam changed how we run semester exams. The AI proctoring is accurate and our faculty love the analytics dashboard.', av: 'PS', stars: 5 },
    { name: 'Rahul Verma', role: 'HR Director, TCS', text: 'We ran 3,000 candidate assessments in a single day without a single issue. Truly enterprise-grade reliability.', av: 'RV', stars: 5 },
    { name: 'Sneha Kulkarni', role: 'Training Head, Infosys', text: 'Our candidates actually enjoy the exam experience. That\'s something we never expected to hear about an exam platform.', av: 'SK', stars: 5 },
  ];

  return (
    <div className="lp">

      {/* ── HAMBURGER BUTTON — Always visible top-right ── */}
      <button
        className={`lp-hamburger ${menuOpen ? 'lp-hamburger--open' : ''}`}
        onClick={() => setMenuOpen(p => !p)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* ── MOBILE SLIDE-IN MENU ── */}
      <div className={`lp-menu ${menuOpen ? 'lp-menu--open' : ''}`}>
        <div className="lp-menu__logo">
          <span className="lp-navbar__logo-icon">A</span>
          ArithExam
        </div>
        <nav className="lp-menu__links">
          <a href="#features" className="lp-menu__link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="lp-menu__link" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#reviews" className="lp-menu__link" onClick={() => setMenuOpen(false)}>Reviews</a>
          <a href="#stats" className="lp-menu__link" onClick={() => setMenuOpen(false)}>Stats</a>
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
      {menuOpen && <div className="lp-overlay" onClick={() => setMenuOpen(false)} />}

      {/* ══════════════════════════════
         HERO — Premium Split Layout with Real Image
         ══════════════════════════════ */}
      <section className="lp-hero" id="hero" ref={heroRef}>
        <div className="lp-hero__bg-mesh" />
        <div className="lp-hero__bg-grid" />
        <div className="lp-hero__bg-gradient" />

        <div className="lp-hero__content">
          <div className="lp-hero__left">
            <div className="lp-hero__badge">
              <span className="lp-hero__badge-dot" />
              AI-Powered Exam Platform
            </div>

            <h1 className="lp-hero__h1">
              ArithExam,<br />
              <span className="lp-hero__accent">Assessments</span><br />
              Simplified!
            </h1>

            <p className="lp-hero__desc">
              Conduct secure, intelligent online exams with real-time AI proctoring —
              built for institutions, enterprises and educators across India.
            </p>

            <div className="lp-hero__actions">
              <Link to="/register">
                <button className="lp-btn-primary magnetic-btn">
                  Sign Up for Free
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </Link>
              <Link to="/login">
                <button className="lp-btn-outline magnetic-btn">Candidate Login</button>
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

          {/* ── RIGHT — Hero Image with Decorative Elements ── */}
          <div className="lp-hero__right">
            <div className="lp-hero__img-wrap" style={{
              transform: `translate(${mousePos.x * 6}px, ${mousePos.y * 4}px)`,
              transition: 'transform 0.3s ease-out'
            }}>
              {/* Green curved background shape */}
              <div className="lp-hero__shape" />

              {/* Main hero image */}
              <div className="lp-hero__photo-container">
                <img
                  src={heroStudents}
                  alt="Students using ArithExam platform"
                  className="lp-hero__photo"
                  loading="eager"
                />
                <div className="lp-hero__photo-border" />
              </div>

              {/* Floating stat cards */}
              <div className="lp-float lp-float--1" style={{
                transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -7}px)`,
                transition: 'transform 0.4s ease-out'
              }}>
                <div className="lp-float__icon">🎯</div>
                <div>
                  <div className="lp-float__val">99.2%</div>
                  <div className="lp-float__lbl">AI Accuracy</div>
                </div>
              </div>

              <div className="lp-float lp-float--2" style={{
                transform: `translate(${mousePos.x * 8}px, ${mousePos.y * -5}px)`,
                transition: 'transform 0.5s ease-out'
              }}>
                <div className="lp-float__icon">👥</div>
                <div>
                  <div className="lp-float__val">2,847</div>
                  <div className="lp-float__lbl">Active Now</div>
                </div>
              </div>

              <div className="lp-float lp-float--3" style={{
                transform: `translate(${mousePos.x * -6}px, ${mousePos.y * 8}px)`,
                transition: 'transform 0.4s ease-out'
              }}>
                <div className="lp-float__icon">⚡</div>
                <div>
                  <div className="lp-float__val">Instant</div>
                  <div className="lp-float__lbl">Results</div>
                </div>
              </div>

              <div className="lp-rating" style={{
                transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 6}px)`,
                transition: 'transform 0.5s ease-out'
              }}>
                <div className="lp-rating__stars">★★★★★</div>
                <div className="lp-rating__score">4.8</div>
                <div className="lp-rating__lbl">Google Reviews</div>
              </div>
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
              'MIT Pune','TCS','Infosys','Wipro','IIT Bombay','BITS Pilani','Cognizant','HCL','NIT Nagpur','Accenture'].map((n,i) => (
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

      {/* ══════════════════════════════
         FEATURES — Interactive Cards
         ══════════════════════════════ */}
      <section className="lp-features" id="features">
        <div className="lp-inner">
          <div className="lp-section-head reveal-up">
            <span className="lp-tag">Why ArithExam</span>
            <h2 className="lp-section-title">Everything your exam needs,<br />nothing it doesn't</h2>
            <p className="lp-section-desc">Purpose-built for modern assessment — no legacy baggage, no confusing UX.</p>
          </div>
          <div className="lp-features__grid">
            {features.map((f, i) => (
              <div key={i} className="lp-feat reveal-up" style={{ animationDelay: `${i*0.1}s` }}>
                <div className="lp-feat__icon-wrap" style={{ background: `${f.color}10`, border: `1.5px solid ${f.color}20` }}>
                  <span className="lp-feat__icon">{f.icon}</span>
                </div>
                <h3 className="lp-feat__title">{f.title}</h3>
                <p className="lp-feat__desc">{f.desc}</p>
                <div className="lp-feat__accent-line" style={{ background: f.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
         FEATURE SHOWCASE — Image + Text Sections
         ══════════════════════════════ */}
      <section className="lp-showcase" id="showcase">
        <div className="lp-inner">
          {featureShowcase.map((item, i) => (
            <div key={i} className={`lp-showcase__row reveal-up ${i % 2 === 1 ? 'lp-showcase__row--reverse' : ''}`}>
              <div className="lp-showcase__image-col">
                <div className="lp-showcase__img-wrap" style={{ borderColor: `${item.accent}15` }}>
                  <img src={item.img} alt={item.tag} className="lp-showcase__img" loading="lazy" />
                  <div className="lp-showcase__img-glow" style={{ background: `radial-gradient(circle, ${item.accent}10, transparent 70%)` }} />
                </div>
              </div>
              <div className="lp-showcase__text-col">
                <span className="lp-tag" style={{ background: `${item.accent}10`, color: item.accent }}>{item.tag}</span>
                <h3 className="lp-showcase__title">{item.title}</h3>
                <p className="lp-showcase__desc">{item.desc}</p>
                <div className="lp-showcase__badges">
                  {item.badges.map((badge, bi) => (
                    <span key={bi} className="lp-showcase__badge" style={{ borderColor: `${item.accent}25`, color: item.accent }}>
                      <span className="lp-showcase__badge-dot" style={{ background: item.accent }} />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
         HOW IT WORKS — Enhanced 4 Steps
         ══════════════════════════════ */}
      <section className="lp-how" id="how-it-works">
        <div className="lp-inner">
          <div className="lp-section-head reveal-up" style={{ textAlign: 'center', margin: '0 auto 64px', maxWidth: '700px' }}>
            <span className="lp-tag">Process</span>
            <h2 className="lp-section-title">From zero to exam-ready in<br />4 simple steps</h2>
            <p className="lp-section-desc" style={{ margin: '14px auto' }}>
              Designed for speed. Intuitive for candidates. Powerful for admins.
            </p>
          </div>

          <div className="lp-how__grid">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`lp-step-card reveal-up ${activeStep === i ? 'active' : ''}`}
                style={{ animationDelay: `${i * 0.15}s` }}
                onMouseEnter={() => setActiveStep(i)}
              >
                <div className="lp-step-card__top">
                  <div className="lp-step-card__num">0{s.n}</div>
                  <div className="lp-step-card__icon">{s.icon}</div>
                </div>
                <div className="lp-step-card__body">
                  <h3 className="lp-step-card__title">{s.title}</h3>
                  <p className="lp-step-card__desc">{s.desc}</p>
                </div>
                <div className="lp-step-card__line"></div>
              </div>
            ))}
          </div>

          <div className="lp-how__cta reveal-up" style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/register">
              <button className="lp-btn-primary magnetic-btn">Experience it Now →</button>
            </Link>
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
              <Link to="/register"><button className="lp-btn-primary lp-btn-primary--lg magnetic-btn">Create Free Account</button></Link>
              <Link to="/login"><button className="lp-btn-outline magnetic-btn">Candidate Login</button></Link>
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
              <span className="lp-navbar__logo-icon">A</span> ArithExam
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
            <span>© 2026 ArithExam. All rights reserved.</span>
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