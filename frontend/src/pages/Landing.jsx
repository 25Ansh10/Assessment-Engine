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
    { icon: '⚡', title: 'Instant Access', desc: 'Join any assessment instantly using a 6-character code shared by your institution. No complex setup.', color: '#00b96b', img: null },
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
      tag: 'Enterprise Security',
      title: 'Bank-grade security your institution can trust',
      desc: 'End-to-end encrypted exam delivery, SOC 2 compliant infrastructure, and multi-layer fraud detection that catches 99.2% of cheating attempts.',
      img: securityFeatures,
      badges: ['E2E Encryption', 'SOC 2 Compliant', 'Fraud Detection', 'Data Privacy'],
      accent: '#00b96b',
    },
  ];

  const steps = [
    { n: '1', icon: '🔗', title: 'Get Your Code', desc: 'Receive a 6-character access code from your instructor or institution to join the exam.' },
    { n: '2', icon: '👤', title: 'Quick Login', desc: 'Sign in to your candidate account. No complex setup—just enter your details and you\'re in.' },
    { n: '3', icon: '🚀', title: 'Take the Exam', desc: 'AI proctoring activates. Complete your assessment in a secure, monitored environment.' },
    { n: '4', icon: '📈', title: 'See Results', desc: 'View your performance, class rank, and detailed feedback immediately after submission.' },
  ];

  const testimonials = [
    { name: 'Dr. Priya Sharma', role: 'Dean of Academics, MIT Pune', text: 'ArithExam changed how we run semester exams. The AI proctoring is accurate and our faculty love the analytics dashboard.', av: 'PS', stars: 5 },
    { name: 'Rahul Verma', role: 'HR Director, TCS', text: 'We ran 3,000 candidate assessments in a single day without a single issue. Truly enterprise-grade reliability.', av: 'RV', stars: 5 },
    { name: 'Sneha Kulkarni', role: 'Training Head, Infosys', text: 'Our candidates actually enjoy the exam experience. That\'s something we never expected to hear about an exam platform.', av: 'SK', stars: 5 },
  ];

  return (
    <div className="landing">

      {/* ── HAMBURGER BUTTON — Always visible top-right ── */}
      <button
        className={`landing-hamburger ${menuOpen ? 'landing-hamburger--open' : ''}`}
        onClick={() => setMenuOpen(p => !p)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* ── MOBILE SLIDE-IN MENU ── */}
      <div className={`landing-menu ${menuOpen ? 'landing-menu--open' : ''}`}>
        <div className="landing-menu__logo">
          <span className="landing-navbar__logo-icon">A</span>
          ArithExam
        </div>
        <nav className="landing-menu__links">
          <a href="#features" className="landing-menu__link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="landing-menu__link" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#reviews" className="landing-menu__link" onClick={() => setMenuOpen(false)}>Reviews</a>
          <a href="#stats" className="landing-menu__link" onClick={() => setMenuOpen(false)}>Stats</a>
        </nav>
        <div className="landing-menu__actions">
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            <button className="landing-btn-outline" style={{ width: '100%' }}>Candidate Login</button>
          </Link>
          <Link to="/register" onClick={() => setMenuOpen(false)}>
            <button className="landing-btn-primary" style={{ width: '100%' }}>Get Started Free →</button>
          </Link>
        </div>
      </div>
      {menuOpen && <div className="landing-overlay" onClick={() => setMenuOpen(false)} />}

      {/* ══════════════════════════════
         HERO — Premium Split Layout with Real Image
         ══════════════════════════════ */}
      <section className="landing-hero" id="hero" ref={heroRef}>
        <div className="landing-hero__bg-mesh" />
        <div className="landing-hero__bg-grid" />
        <div className="landing-hero__bg-gradient" />

        <div className="landing-hero__content">
          <div className="landing-hero__left">
            <div className="landing-hero__badge">
              <span className="landing-hero__badge-dot" />
              AI-Powered Exam Platform
            </div>

            <h1 className="landing-hero__h1">
              ArithExam,<br />
              <span className="landing-hero__accent">Assessments</span><br />
              Simplified!
            </h1>

            <p className="landing-hero__desc">
              Conduct secure, intelligent online exams with real-time AI proctoring —
              built for candidates across India.
            </p>

            <div className="landing-hero__actions">
              <Link to="/register">
                <button className="landing-btn-primary magnetic-btn">
                  Sign Up for Free
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </Link>
              <Link to="/login">
                <button className="landing-btn-outline magnetic-btn">Candidate Login</button>
              </Link>
            </div>

            <div className="landing-hero__checks">
              <span className="landing-check">AI Proctoring</span>
              <span className="landing-check">Instant Results</span>
              <span className="landing-check">Any Device</span>
              <span className="landing-check">Free to Start</span>
            </div>

            <div className="landing-hero__proof">
              <div className="landing-proof-avs">
                {['A','B','C','D','E'].map((l, i) => (
                  <span key={i} className="landing-proof-av" style={{ marginLeft: i ? '-8px' : 0 }}>{l}</span>
                ))}
              </div>
              <div>
                <div className="landing-proof-num">50,000+</div>
                <div className="landing-proof-lbl">Monthly Active Students</div>
              </div>
            </div>
          </div>

          {/* ── RIGHT — Hero Image with Decorative Elements ── */}
          <div className="landing-hero__right">
            <div className="landing-hero__img-wrap" style={{
              transform: `translate(${mousePos.x * 6}px, ${mousePos.y * 4}px)`,
              transition: 'transform 0.3s ease-out'
            }}>
              {/* Green curved background shape */}
              <div className="landing-hero__shape" />

              {/* Main hero image */}
              <div className="landing-hero__photo-container">
                <img
                  src={heroStudents}
                  alt="Students using ArithExam platform"
                  className="landing-hero__photo"
                  loading="eager"
                />
                <div className="landing-hero__photo-border" />
              </div>

              {/* Floating stat cards */}
              <div className="landing-float landing-float--1" style={{
                transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -7}px)`,
                transition: 'transform 0.4s ease-out'
              }}>
                <div className="landing-float__icon">🎯</div>
                <div>
                  <div className="landing-float__val">99.2%</div>
                  <div className="landing-float__lbl">AI Accuracy</div>
                </div>
              </div>

              <div className="landing-float landing-float--2" style={{
                transform: `translate(${mousePos.x * 8}px, ${mousePos.y * -5}px)`,
                transition: 'transform 0.5s ease-out'
              }}>
                <div className="landing-float__icon">👥</div>
                <div>
                  <div className="landing-float__val">2,847</div>
                  <div className="landing-float__lbl">Active Now</div>
                </div>
              </div>

              <div className="landing-float landing-float--3" style={{
                transform: `translate(${mousePos.x * -6}px, ${mousePos.y * 8}px)`,
                transition: 'transform 0.4s ease-out'
              }}>
                <div className="landing-float__icon">⚡</div>
                <div>
                  <div className="landing-float__val">Instant</div>
                  <div className="landing-float__lbl">Results</div>
                </div>
              </div>

              <div className="landing-rating" style={{
                transform: `translate(${mousePos.x * 5}px, ${mousePos.y * 6}px)`,
                transition: 'transform 0.5s ease-out'
              }}>
                <div className="landing-rating__stars">★★★★★</div>
                <div className="landing-rating__score">4.8</div>
                <div className="landing-rating__lbl">Google Reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="landing-marquee">
        <div className="landing-marquee__label">Trusted by</div>
        <div className="landing-marquee__track-wrap">
          <div className="landing-marquee__track">
            {['MIT Pune','TCS','Infosys','Wipro','IIT Bombay','BITS Pilani','Cognizant','HCL','NIT Nagpur','Accenture',
              'MIT Pune','TCS','Infosys','Wipro','IIT Bombay','BITS Pilani','Cognizant','HCL','NIT Nagpur','Accenture'].map((n,i) => (
              <span key={i} className="landing-marquee__item">
                <span className="landing-marquee__sep">·</span>{n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="landing-stats" ref={statsRef} id="stats">
        <div className="landing-inner">
          <div className="landing-stats__grid">
            {[
              { val: counters.exams.toLocaleString()+'+', label: 'Exams Delivered', icon: '📝' },
              { val: counters.students.toLocaleString()+'+', label: 'Students Served', icon: '🎓' },
              { val: counters.accuracy+'%', label: 'Proctoring Accuracy', icon: '🤖' },
              { val: counters.uptime+'%', label: 'Platform Uptime', icon: '⚙️' },
            ].map((s,i) => (
              <div key={i} className="landing-stat reveal-up" style={{ animationDelay: `${i*0.1}s` }}>
                <div className="landing-stat__icon">{s.icon}</div>
                <div className="landing-stat__val">{s.val}</div>
                <div className="landing-stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
         FEATURES — Interactive Cards
         ══════════════════════════════ */}
      <section className="landing-features" id="features">
        <div className="landing-inner">
          <div className="landing-section-head reveal-up">
            <span className="landing-tag">Why ArithExam</span>
            <h2 className="landing-section-title">Everything your exam needs,<br />nothing it doesn't</h2>
            <p className="landing-section-desc">Purpose-built for modern assessment — no legacy baggage, no confusing UX.</p>
          </div>
          <div className="landing-features__grid">
            {features.map((f, i) => (
              <div key={i} className="landing-feat reveal-up" style={{ animationDelay: `${i*0.1}s` }}>
                <div className="landing-feat__icon-wrap" style={{ background: `${f.color}10`, border: `1.5px solid ${f.color}20` }}>
                  <span className="landing-feat__icon">{f.icon}</span>
                </div>
                <h3 className="landing-feat__title">{f.title}</h3>
                <p className="landing-feat__desc">{f.desc}</p>
                <div className="landing-feat__accent-line" style={{ background: f.color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
         FEATURE SHOWCASE — Image + Text Sections
         ══════════════════════════════ */}
      <section className="landing-showcase" id="showcase">
        <div className="landing-inner">
          {featureShowcase.map((item, i) => (
            <div key={i} className={`landing-showcase__row reveal-up ${i % 2 === 1 ? 'landing-showcase__row--reverse' : ''}`}>
              <div className="landing-showcase__image-col">
                <div className="landing-showcase__img-wrap" style={{ borderColor: `${item.accent}15` }}>
                  <img src={item.img} alt={item.tag} className="landing-showcase__img" loading="lazy" />
                  <div className="landing-showcase__img-glow" style={{ background: `radial-gradient(circle, ${item.accent}10, transparent 70%)` }} />
                </div>
              </div>
              <div className="landing-showcase__text-col">
                <span className="landing-tag" style={{ background: `${item.accent}10`, color: item.accent }}>{item.tag}</span>
                <h3 className="landing-showcase__title">{item.title}</h3>
                <p className="landing-showcase__desc">{item.desc}</p>
                <div className="landing-showcase__badges">
                  {item.badges.map((badge, bi) => (
                    <span key={bi} className="landing-showcase__badge" style={{ borderColor: `${item.accent}25`, color: item.accent }}>
                      <span className="landing-showcase__badge-dot" style={{ background: item.accent }} />
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
      <section className="landing-how" id="how-it-works">
        <div className="landing-inner">
          <div className="landing-section-head reveal-up" style={{ textAlign: 'center', margin: '0 auto 64px', maxWidth: '700px' }}>
            <span className="landing-tag">Process</span>
            <h2 className="landing-section-title">From zero to exam-ready in<br />4 simple steps</h2>
            <p className="landing-section-desc" style={{ margin: '14px auto' }}>
              Designed for speed. Intuitive for candidates. Seamless for all.
            </p>
          </div>

          <div className="landing-how__grid">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`landing-step-card reveal-up ${activeStep === i ? 'active' : ''}`}
                style={{ animationDelay: `${i * 0.15}s` }}
                onMouseEnter={() => setActiveStep(i)}
              >
                <div className="landing-step-card__top">
                  <div className="landing-step-card__num">0{s.n}</div>
                  <div className="landing-step-card__icon">{s.icon}</div>
                </div>
                <div className="landing-step-card__body">
                  <h3 className="landing-step-card__title">{s.title}</h3>
                  <p className="landing-step-card__desc">{s.desc}</p>
                </div>
                <div className="landing-step-card__line"></div>
              </div>
            ))}
          </div>

          <div className="landing-how__cta reveal-up" style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/register">
              <button className="landing-btn-primary magnetic-btn">Experience it Now →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="landing-reviews" id="reviews">
        <div className="landing-inner">
          <div className="landing-section-head reveal-up">
            <span className="landing-tag">Reviews</span>
            <h2 className="landing-section-title">What educators and<br />enterprises are saying</h2>
          </div>
          <div className="landing-reviews__grid">
            {testimonials.map((t, i) => (
              <div key={i} className="landing-review reveal-up" style={{ animationDelay: `${i*0.12}s` }}>
                <div className="landing-review__stars">{'★'.repeat(t.stars)}</div>
                <p className="landing-review__text">"{t.text}"</p>
                <div className="landing-review__author">
                  <div className="landing-review__av">{t.av}</div>
                  <div>
                    <div className="landing-review__name">{t.name}</div>
                    <div className="landing-review__role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta reveal-scale">
        <div className="landing-inner landing-cta__inner">
          <div className="landing-cta__left">
            <h2 className="landing-cta__title">Ready to conduct your<br />first smart exam?</h2>
            <p className="landing-cta__desc">Join 500+ institutions. Free plan available. No credit card needed.</p>
            <div className="landing-cta__actions">
              <Link to="/register"><button className="landing-btn-primary landing-btn-primary--lg magnetic-btn">Create Free Account</button></Link>
              <Link to="/login"><button className="landing-btn-outline magnetic-btn">Candidate Login</button></Link>
            </div>
            <div className="landing-cta__trust">
              <span>✓ Free forever plan</span>
              <span>✓ No credit card</span>
              <span>✓ Setup in 2 minutes</span>
            </div>
          </div>
          <div className="landing-cta__right">
            <div className="landing-cta__card">
              <div className="landing-cta__card-icon">🚀</div>
              <div>
                <div className="landing-cta__card-stat">10,000+</div>
                <div className="landing-cta__card-lbl">Exams delivered this month</div>
              </div>
            </div>
            <div className="landing-cta__card landing-cta__card--2">
              <div className="landing-cta__card-icon">🛡️</div>
              <div>
                <div className="landing-cta__card-stat">99.2%</div>
                <div className="landing-cta__card-lbl">AI proctoring accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="landing-inner landing-footer__inner">
          <div className="landing-footer__brand">
            <div className="landing-footer__logo">
              <span className="landing-navbar__logo-icon">A</span> ArithExam
            </div>
            <p className="landing-footer__tagline">The future of secure online assessment, built for India.</p>
            <div className="landing-footer__social">
              <a href="#" className="landing-footer__social-link">Twitter</a>
              <a href="#" className="landing-footer__social-link">Facebook</a>
              <a href="#" className="landing-footer__social-link">Instagram</a>
            </div>
          </div>
          <div className="landing-footer__cols">
            <div className="landing-footer__col">
              <div className="landing-footer__col-head">Product</div>
              <a href="#features">Features</a>
              <a href="#stats">Stats</a>
              <Link to="/register">Sign Up Free</Link>
            </div>
            <div className="landing-footer__col">
              <div className="landing-footer__col-head">Platform</div>
              <Link to="/login">Candidate Login</Link>
              <Link to="/register">Create Account</Link>
              <a href="#how-it-works">How it works</a>
            </div>
            <div className="landing-footer__col">
              <div className="landing-footer__col-head">Company</div>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Use</a>
              <a href="#contact">Contact Us</a>
            </div>
          </div>
        </div>
        <div className="landing-footer__bottom">
          <div className="landing-inner landing-footer__bottom-inner">
            <span>© 2026 ArithExam. All rights reserved.</span>
            <span>Made with ♥ in India</span>
          </div>
        </div>
      </footer>

      {/* ── COOKIE ── */}
      {showCookie && (
        <div className="landing-cookie">
          <h4>🍪 Cookie Preferences</h4>
          <p>We use cookies to improve your experience and analyze usage.</p>
          <div className="landing-cookie__btns">
            <button className="landing-btn-primary" onClick={() => handleCookie(true)}>Accept All</button>
            <button className="landing-cookie__decline" onClick={() => handleCookie(false)}>Decline</button>
          </div>
        </div>
      )}
    </div>
  );
}
