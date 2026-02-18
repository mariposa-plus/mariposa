'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">🦋</span>
            <span className="logo-text">MARIPOSA</span>
          </div>
          <div className="nav-actions">
            <button className="nav-btn" onClick={() => router.push('/login')}>
              Sign In
            </button>
            <button className="nav-btn-primary" onClick={() => router.push('/register')}>
              Join the Waitlist
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Payment automation for the AI era</h1>
            <p className="hero-subtitle">
              AI reads your invoices. Rules decide what happens. Payments execute
              automatically — fiat or crypto, your choice.
            </p>
            <button className="hero-cta" onClick={() => router.push('/register')}>
              Join the Waitlist
            </button>
          </div>
          <div className="hero-visual">
            <div className="floating-orb orb-1"></div>
            <div className="floating-orb orb-2"></div>
            <div className="floating-orb orb-3"></div>
            <div className="star-accent star-1">✦</div>
            <div className="star-accent star-2">✦</div>
            <div className="star-accent star-3">✧</div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section">
        <div className="container">
          <h2 className="section-title-center">
            Payments in 2025 shouldn't feel like 1995
          </h2>
          <p className="problem-text">
            You're still reading invoices manually. Copy-pasting wallet addresses.
            Chasing approvals via email. Converting currencies by hand. Reconciling
            spreadsheets at month-end. Praying you didn't make a mistake.
          </p>
          <p className="problem-text">
            Meanwhile, you have AI that can write essays and blockchain that can move
            millions in seconds.
          </p>
          <p className="problem-highlight">
            Why are your payments still stuck in the past?
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section className="solution-section">
        <div className="container">
          <h2 className="section-title-center">Meet Mariposa</h2>
          <p className="solution-description">
            Mariposa is a visual automation platform that connects AI, fintech, and
            blockchain into seamless payment workflows.
          </p>
          <div className="solution-tagline">
            <div className="tagline-item">Drag.</div>
            <div className="tagline-item">Drop.</div>
            <div className="tagline-item">Automate.</div>
          </div>
          <p className="solution-subtext">
            No code. No complexity. Just payments that handle themselves.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title-center">From invoice to payment in seconds</h2>

          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3 className="step-title">Invoice Arrives</h3>
              <p className="step-description">
                Email, upload, webhook — however invoices reach you, Mariposa catches them.
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <h3 className="step-title">AI Understands</h3>
              <p className="step-description">
                Our AI extracts vendor, amount, due date, and payment details. No manual data entry.
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <h3 className="step-title">Rules Decide</h3>
              <p className="step-description">
                Your rules run automatically: budget checks, approval routing, fraud detection,
                payment scheduling.
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">4</div>
              <h3 className="step-title">Payment Executes</h3>
              <p className="step-description">
                Bank transfer, crypto payment, or both. Recipient chooses how they want to receive.
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">5</div>
              <h3 className="step-title">Everything Logged</h3>
              <p className="step-description">
                Full audit trail. Accounting updated. Receipt sent. You did nothing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title-center">Everything you need to automate payments</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI Invoice Processing</h3>
              <p className="feature-description">
                Drop an invoice. AI extracts everything: vendor, amount, bank details, due date.
                Works with any format — PDF, email, image.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3 className="feature-title">Visual Workflow Builder</h3>
              <p className="feature-description">
                Drag and drop components to build payment logic. No code required.
                See your automation before you deploy it.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💱</div>
              <h3 className="feature-title">Fiat + Crypto United</h3>
              <p className="feature-description">
                Pay from your bank. Recipient gets crypto. Or reverse. Or let them choose.
                All in one flow.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">Global Payments</h3>
              <p className="feature-description">
                Pay anyone, anywhere, any currency. 30 seconds to 190+ countries.
                Not 3-5 business days.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Built-in Escrow</h3>
              <p className="feature-description">
                Protect any transaction. Funds release when conditions are met.
                Trust without trusting.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Instant Splits</h3>
              <p className="feature-description">
                Revenue arrives. Splits happen same second. Partners, taxes, savings —
                all automated.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3 className="feature-title">Multi-Sig Approvals</h3>
              <p className="feature-description">
                Big payments need multiple approvals? Built in. Approvers get notified.
                Pipeline waits. Approved? Payment executes.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Real-Time Dashboard</h3>
              <p className="feature-description">
                See every payment. Track every workflow. Full audit trail.
                Accounting-ready exports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="use-cases-section">
        <div className="container">
          <h2 className="section-title-center">Built for people who move money</h2>

          <div className="use-cases-grid">
            <div className="use-case-card">
              <h3 className="use-case-title">💼 Agencies & Freelancers</h3>
              <p className="use-case-description">
                Invoice clients automatically. Get paid faster. Pay contractors their way —
                bank, PayPal, or crypto.
              </p>
            </div>

            <div className="use-case-card">
              <h3 className="use-case-title">🚀 Startups</h3>
              <p className="use-case-description">
                Automate payroll across 50 countries. Split revenue to investors.
                Stop the spreadsheet chaos.
              </p>
            </div>

            <div className="use-case-card">
              <h3 className="use-case-title">🌐 DAOs & Web3 Teams</h3>
              <p className="use-case-description">
                Treasury operations on autopilot. Contributor payments in minutes, not days.
                On-chain proof of everything.
              </p>
            </div>

            <div className="use-case-card">
              <h3 className="use-case-title">🎯 Grant Programs</h3>
              <p className="use-case-description">
                Milestone-based releases. AI-verified deliverables. Transparent fund distribution.
              </p>
            </div>

            <div className="use-case-card">
              <h3 className="use-case-title">🛒 Marketplaces</h3>
              <p className="use-case-description">
                Seller payouts automated. Escrow built in. Disputes handled. Everyone gets paid.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Mariposa Section */}
      <section className="why-section">
        <div className="container">
          <h2 className="section-title-center">What makes Mariposa different</h2>

          <div className="why-grid">
            <div className="why-card">
              <h3 className="why-title">Not just fiat. Not just crypto. Both.</h3>
              <p className="why-description">
                Other tools make you choose. We bridge the gap. Pay in dollars, they receive Bitcoin.
                Or any combination.
              </p>
            </div>

            <div className="why-card">
              <h3 className="why-title">AI-native, not AI-added.</h3>
              <p className="why-description">
                We didn't bolt on AI. Intelligence is built into every component.
                Your payments understand context.
              </p>
            </div>

            <div className="why-card">
              <h3 className="why-title">Visual, not code.</h3>
              <p className="why-description">
                If you can draw a flowchart, you can automate payments. No developers required.
              </p>
            </div>

            <div className="why-card">
              <h3 className="why-title">Recipient choice.</h3>
              <p className="why-description">
                Stop asking for bank details. Send a payment link. They pick: bank, PayPal,
                crypto, mobile money.
              </p>
            </div>

            <div className="why-card">
              <h3 className="why-title">Trust built in.</h3>
              <p className="why-description">
                Escrow, multi-sig, conditional releases — protection that used to require lawyers,
                now requires one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <h2 className="section-title-center">Simple pricing. No surprises.</h2>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 className="pricing-tier">FREE</h3>
              <div className="pricing-price">$0<span>/month</span></div>
              <ul className="pricing-features">
                <li>3 workflows</li>
                <li>100 executions/month</li>
                <li>Testnet only</li>
                <li>Community support</li>
              </ul>
              <button className="pricing-btn" onClick={() => router.push('/register')}>
                Get Started
              </button>
            </div>

            <div className="pricing-card pricing-card-featured">
              <div className="pricing-badge">POPULAR</div>
              <h3 className="pricing-tier">PRO</h3>
              <div className="pricing-price">$99<span>/month</span></div>
              <ul className="pricing-features">
                <li>Unlimited workflows</li>
                <li>Unlimited executions</li>
                <li>Mainnet payments</li>
                <li>Email support</li>
                <li>All integrations</li>
              </ul>
              <button className="pricing-btn pricing-btn-featured" onClick={() => router.push('/register')}>
                Start Free Trial
              </button>
            </div>

            <div className="pricing-card">
              <h3 className="pricing-tier">TEAM</h3>
              <div className="pricing-price">$299<span>/month</span></div>
              <ul className="pricing-features">
                <li>Everything in Pro</li>
                <li>5 team members</li>
                <li>Audit logs</li>
                <li>Priority support</li>
                <li>Advanced analytics</li>
              </ul>
              <button className="pricing-btn" onClick={() => router.push('/register')}>
                Get Started
              </button>
            </div>

            <div className="pricing-card">
              <h3 className="pricing-tier">ENTERPRISE</h3>
              <div className="pricing-price">Custom</div>
              <ul className="pricing-features">
                <li>Unlimited everything</li>
                <li>Custom integrations</li>
                <li>SLA guarantee</li>
                <li>Dedicated support</li>
                <li>On-premise option</li>
              </ul>
              <button className="pricing-btn" onClick={() => router.push('/register')}>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-section">
        <div className="container">
          <h2 className="final-cta-title">Ready to stop chasing payments?</h2>
          <p className="final-cta-subtitle">
            Join the waitlist. Be first to automate.
          </p>
          <button className="final-cta-btn" onClick={() => router.push('/register')}>
            Get Early Access
          </button>
          <p className="final-cta-note">
            No credit card required. Free tier available.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-icon">🦋</span>
              <span className="logo-text">MARIPOSA</span>
            </div>
            <div className="footer-text">
              Mariposa — Payments that handle themselves.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
