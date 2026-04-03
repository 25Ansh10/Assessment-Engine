import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, Heart } from 'lucide-react';
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
  const statsRef = useRef(null);
  const hasAnimated = useRef(false);
  const heroRef = useRef(null);

  // Cookie consent
  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem('ArithExam_cookie')) setShowCookie(true);
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

  const handleCookie = (accept) => {
    localStorage.setItem('ArithExam_cookie', accept ? 'accepted' : 'declined');
    setShowCookie(false);
  };

  const features = [
    { 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ), 
      title: 'Smart Proctoring', 
      desc: 'Secure environment that ensures fair play using advanced AI face detection and tab monitoring.', 
      color: 'var(--primary)', 
      img: aiProctoring 
    },
    { 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ), 
      title: 'Instant Launch', 
      desc: 'Enter your exam code and dive straight into your assessment. No wait times, no friction.', 
      color: 'var(--secondary)', 
      img: null 
    },
    { 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm0 0h5a2 2 0 002-2v-3a2 2 0 00-2-2h-5M9 19v-3a2 2 0 002-2h4a2 2 0 002 2v3a2 2 0 00-2 2h-4a2 2 0 00-2-2z" />
        </svg>
      ), 
      title: 'Growth Tracking', 
      desc: 'Detailed performance breakdown and personalized insights to help you improve every day.', 
      color: '#7c3aed', 
      img: analyticsDashboard 
    },
    { 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ), 
      title: 'Desktop Optimized', 
      desc: 'Take your proctored exams securely from any laptop or desktop web browser.', 
      color: 'var(--accent)', 
      img: null 
    },
  ];

  const featureShowcase = [
    {
      tag: 'Secure Testing',
      title: 'A Fair Playing Field for Every Student',
      desc: 'Our AI proctoring identifies distractions and ensures integrity without being intrusive. Featuring zero-latency face detection and auto-lock mechanisms, you can focus entirely on your performance.',
      img: aiProctoring,
      accent: 'var(--primary)',
    },
    {
      tag: 'Robust Security',
      title: 'Unmatched Exam Integrity',
      desc: 'Experience complete peace of mind with our verified anti-cheat system. We utilize continuous webcam monitoring, smart tab detection, and fullscreen enforcement to secure your testing environment.',
      img: securityFeatures,
      accent: 'var(--green)',
    },
    {
      tag: 'Personalized Insights',
      title: 'Don\'t Just Test, Grow!',
      desc: 'Get an instant, deep-dive report of your strengths the moment you finish. Track your progress, analyze topics, and identify skill gaps across multiple sessions instantly.',
      img: analyticsDashboard,
      accent: 'var(--secondary)',
    },
  ];

  const steps = [
    { 
      n: '1', 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ), 
      title: 'Quick Join', 
      desc: 'Securely create your candidate profile or enter your unique exam code to begin.' 
    },
    { 
      n: '2', 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ), 
      title: 'Smart Verify', 
      desc: 'A quick biometric check ensures your identity and secures your testing session.' 
    },
    { 
      n: '3', 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ), 
      title: 'Take the Exam', 
      desc: 'Experience a modern, distraction-free assessment interface designed for focus.' 
    },
    { 
      n: '4', 
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="24" height="24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
        </svg>
      ), 
      title: 'Check Progress', 
      desc: 'Instantly view your results and comprehensive feedback to track your learning journey.' 
    },
  ];

  const testimonials = [
    { name: 'Arjun Mehta', role: 'Final Year Student, IIT Delhi', text: 'ArithExam made my entrance prep so much smoother. The instant feedback on which topics I missed is a game changer.', av: 'AM', stars: 5 },
    { name: 'Riya Kulkarni', role: 'Graduate Applicant', text: 'I love how I can take my assessments on my iPad without any lag. The interface is clean and helps me stay focused.', av: 'RK', stars: 5 },
    { name: 'Sameer Sheikh', role: 'Professional Certification Candidate', text: 'The most stress-free exam experience I\'ve had. No complex setup, just enter the code and start.', av: 'SS', stars: 5 },
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
          <img src="/logo.png" alt="ArithExam" width="40" height="40" style={{ borderRadius: '10px' }} />
          <span className="landing-navbar__logo-text" style={{ color: 'var(--ink)' }}>ArithExam</span>
        </div>
        <nav className="landing-menu__links">
          <a href="#features" className="landing-menu__link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="landing-menu__link" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#reviews" className="landing-menu__link" onClick={() => setMenuOpen(false)}>Reviews</a>
          <a href="#stats" className="landing-menu__link" onClick={() => setMenuOpen(false)}>Stats</a>
        </nav>
        <div className="landing-menu__actions">
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            <button className="landing-btn-outline" style={{ width: '100%' }}>Login to Portal</button>
          </Link>
          <Link to="/register" onClick={() => setMenuOpen(false)}>
            <button className="landing-btn-primary" style={{ width: '100%' }}>Join for Free →</button>
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
              Assess Smarter, Perform Better. ArithExam is your personalized 
              assessment engine, built to help you track progress and excel.
            </p>

            <div className="landing-hero__actions">
              <Link to="/register">
                <button className="landing-btn-primary magnetic-btn">
                  Start Your Journey
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </Link>
              <Link to="/login">
                <button className="landing-btn-outline magnetic-btn">Login to Portal</button>
              </Link>
            </div>

            <div className="landing-hero__checks">
              <span className="landing-check">Secure Testing</span>
              <span className="landing-check">In-depth Analysis</span>
              <span className="landing-check">Track Progress</span>
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
            <div className="landing-hero__img-wrap">
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
              <div className="landing-float landing-float--1">
                <div className="landing-float__icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <div className="landing-float__val">99.2%</div>
                  <div className="landing-float__lbl">AI Accuracy</div>
                </div>
              </div>

              <div className="landing-float landing-float--2">
                <div className="landing-float__icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div>
                  <div className="landing-float__val">50,000+</div>
                  <div className="landing-float__lbl">Active Now</div>
                </div>
              </div>

              <div className="landing-float landing-float--3">
                <div className="landing-float__icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <div className="landing-float__val">Instant</div>
                  <div className="landing-float__lbl">Results</div>
                </div>
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
              { 
                val: counters.exams.toLocaleString()+'+', 
                label: 'Exams Delivered', 
                icon: (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              { 
                val: counters.students.toLocaleString()+'+', 
                label: 'Students Served', 
                icon: (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-10.824-6.998 12.083 12.083 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                  </svg>
                )
              },
              { 
                val: counters.accuracy+'%', 
                label: 'Proctoring Accuracy', 
                icon: (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              { 
                val: counters.uptime+'%', 
                label: 'Platform Uptime', 
                icon: (
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="28" height="28">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
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
            <h2 className="landing-section-title">Everything you need to<br />succeed, nothing you don't</h2>
            <p className="landing-section-desc">Purpose-built for modern students — no distractions, just focus.</p>
          </div>
          <div className="landing-features__grid">
            {features.map((f, i) => (
              <div key={i} className="landing-feat reveal-up" style={{ animationDelay: `${i*0.1}s` }}>
                <div className="landing-feat__icon" style={{ color: f.color }}>
                  {f.icon}
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
                <div className="landing-review__stars">
                  {[...Array(t.stars)].map((_, idx) => (
                    <svg key={idx} fill="#f59e0b" viewBox="0 0 20 20" width="16" height="16" style={{marginRight: '3px'}}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
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
            <h2 className="landing-cta__title">Ready to take your<br />next secure exam?</h2>
            <p className="landing-cta__desc">Join 50,000+ students. Sign in to start your assessment today.</p>
            <div className="landing-cta__actions">
              <Link to="/register"><button className="landing-btn-primary landing-btn-primary--lg magnetic-btn">Get Started Now</button></Link>
              <Link to="/login"><button className="landing-btn-outline magnetic-btn">Candidate Login</button></Link>
            </div>
            <div className="landing-cta__trust">
              <span style={{display:'flex', alignItems:'center', gap:'4px'}}><Check size={16}/> Free for Students</span>
              <span style={{display:'flex', alignItems:'center', gap:'4px'}}><Check size={16}/> Instant Progress Tracker</span>
              <span style={{display:'flex', alignItems:'center', gap:'4px'}}><Check size={16}/> Laptops & Desktops Only</span>
            </div>
          </div>
          <div className="landing-cta__right">
            <div className="landing-cta__card">
              <div className="landing-cta__card-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="32" height="32">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <div className="landing-cta__card-stat">50,000+</div>
                <div className="landing-cta__card-lbl">Active students this month</div>
              </div>
            </div>
            <div className="landing-cta__card landing-cta__card--2">
              <div className="landing-cta__card-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="32" height="32">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
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
              <img src="/logo.png" alt="ArithExam" width="36" height="36" style={{ borderRadius: '8px' }} />
              <span className="landing-navbar__logo-text">ArithExam</span>
            </div>
            <p className="landing-footer__tagline">Assess Smarter, Perform Better.</p>
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
              <Link to="/login">Student Portal</Link>
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
            <span style={{display:'flex', alignItems:'center', gap:'4px', justifyContent:'center'}}>Made with <Heart size={14} fill="var(--primary)" color="var(--primary)" /> in India</span>
          </div>
        </div>
      </footer>

      {/* ── COOKIE ── */}
      {showCookie && (
        <div className="landing-cookie">
          <h4>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20" style={{ marginBottom: '-4px', marginRight: '8px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Cookie Preferences
          </h4>
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
