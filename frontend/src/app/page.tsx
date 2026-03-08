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
            <span className="logo-icon">&#x1F98B;</span>
            <span className="logo-text">MARIPOSA</span>
          </div>
          <div className="nav-actions">
            <button className="nav-btn" onClick={() => router.push('/login')}>
              Sign In
            </button>
            <button className="nav-btn-primary" onClick={() => router.push('/register')}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Build Chainlink CRE workflows visually</h1>
            <p className="hero-subtitle">
              Drag-and-drop pipeline builder for the Chainlink Runtime Environment.
              Design workflows, generate CRE SDK code, simulate, and deploy &mdash; all from one interface.
            </p>
            <button className="hero-cta" onClick={() => router.push('/register')}>
              Start Building
            </button>
          </div>
          <div className="hero-visual">
            <div className="floating-orb orb-1"></div>
            <div className="floating-orb orb-2"></div>
            <div className="floating-orb orb-3"></div>
            <div className="star-accent star-1">&#x2726;</div>
            <div className="star-accent star-2">&#x2726;</div>
            <div className="star-accent star-3">&#x2727;</div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="problem-section">
        <div className="container">
          <h2 className="section-title-center">
            Building CRE workflows shouldn&apos;t require memorizing the SDK
          </h2>
          <p className="problem-text">
            The Chainlink Runtime Environment is powerful &mdash; cron triggers, on-chain reads and writes,
            consensus aggregation, custom compute. But wiring it all together means writing boilerplate
            TypeScript, managing config files, and debugging deployment pipelines manually.
          </p>
          <p className="problem-text">
            You have a workflow idea in your head. Getting it running shouldn&apos;t take days of scaffolding.
          </p>
          <p className="problem-highlight">
            What if you could just drag, drop, and deploy?
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section className="solution-section">
        <div className="container">
          <h2 className="section-title-center">Meet Mariposa</h2>
          <p className="solution-description">
            A visual pipeline builder purpose-built for Chainlink CRE. Design workflows on a canvas,
            configure nodes with guided forms, and let Mariposa generate production-ready CRE SDK code.
          </p>
          <div className="solution-tagline">
            <div className="tagline-item">Design.</div>
            <div className="tagline-item">Generate.</div>
            <div className="tagline-item">Deploy.</div>
          </div>
          <p className="solution-subtext">
            From visual canvas to running CRE workflow in minutes.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title-center">From idea to deployment in five steps</h2>

          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3 className="step-title">Design Your Workflow</h3>
              <p className="step-description">
                Drag trigger, capability, logic, and contract nodes onto the canvas.
                Connect them with edges to define data flow.
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">2</div>
              <h3 className="step-title">Configure Nodes</h3>
              <p className="step-description">
                Click any node to open its config form. Set cron schedules, API endpoints,
                contract addresses, transform expressions, and more.
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">3</div>
              <h3 className="step-title">Generate CRE Code</h3>
              <p className="step-description">
                One click generates production-ready TypeScript targeting the CRE SDK &mdash;
                imports, config schemas, and workflow logic included.
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">4</div>
              <h3 className="step-title">Simulate</h3>
              <p className="step-description">
                Run your workflow through the CRE CLI simulator with real-time log streaming.
                Catch issues before deploying on-chain.
              </p>
            </div>

            <div className="step-item">
              <div className="step-number">5</div>
              <h3 className="step-title">Deploy</h3>
              <p className="step-description">
                Compile and deploy Solidity consumer contracts, then push your workflow
                to the Chainlink DON &mdash; all from the same interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title-center">Everything you need to build CRE workflows</h2>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ fontSize: '48px' }}>&#x1F3A8;</div>
              <h3 className="feature-title">Visual Pipeline Builder</h3>
              <p className="feature-description">
                ReactFlow-powered canvas with 22+ node types across 5 categories.
                Drag, drop, and connect &mdash; see your entire workflow at a glance.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ fontSize: '48px' }}>&#x2728;</div>
              <h3 className="feature-title">AI Copilot</h3>
              <p className="feature-description">
                Describe your workflow in plain English. The AI Copilot generates nodes,
                edges, and configurations &mdash; then applies them to your canvas with one click.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ fontSize: '48px' }}>&#x1F4BB;</div>
              <h3 className="feature-title">CRE Code Generation</h3>
              <p className="feature-description">
                Automatically converts your visual pipeline into CRE SDK TypeScript.
                Topologically sorted, properly imported, ready to compile with Bun.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ fontSize: '48px' }}>&#x26D3;</div>
              <h3 className="feature-title">On-Chain Integration</h3>
              <p className="feature-description">
                EVM read/write nodes, ABI encoding/decoding, log event triggers, and
                chain selector support for Ethereum, Arbitrum, Base, Avalanche, and more.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ fontSize: '48px' }}>&#x1F9EA;</div>
              <h3 className="feature-title">Built-in Simulation</h3>
              <p className="feature-description">
                Run CRE CLI simulations directly from the browser with real-time
                Socket.io log streaming. Debug before you deploy.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ fontSize: '48px' }}>&#x1F4DC;</div>
              <h3 className="feature-title">Smart Contract Management</h3>
              <p className="feature-description">
                Write Solidity contracts in a Monaco editor, compile with solc,
                and deploy to testnets &mdash; all without leaving Mariposa.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ fontSize: '48px' }}>&#x1F500;</div>
              <h3 className="feature-title">Conditional Logic</h3>
              <p className="feature-description">
                Branch workflows with condition nodes, transform data with custom
                JavaScript expressions, and aggregate results with consensus methods.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ fontSize: '48px' }}>&#x26A1;</div>
              <h3 className="feature-title">Real-Time Execution</h3>
              <p className="feature-description">
                BullMQ-powered job queue with cron scheduling, delayed execution,
                multi-sig approvals, and live execution monitoring via WebSocket.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Node Types Section */}
      <section className="use-cases-section">
        <div className="container">
          <h2 className="section-title-center">22+ node types across 5 categories</h2>

          <div className="use-cases-grid">
            <div className="use-case-card" style={{ borderColor: 'rgba(124, 58, 237, 0.4)' }}>
              <h3 className="use-case-title" style={{ color: '#a78bfa' }}>Triggers</h3>
              <p className="use-case-description">
                Cron schedules, HTTP webhooks, and EVM log event listeners.
                Define how and when your workflow starts.
              </p>
            </div>

            <div className="use-case-card" style={{ borderColor: 'rgba(37, 99, 235, 0.4)' }}>
              <h3 className="use-case-title" style={{ color: '#60a5fa' }}>Capabilities</h3>
              <p className="use-case-description">
                HTTP fetch, EVM read/write, custom Node.js compute, and secrets access.
                Connect to any API or smart contract.
              </p>
            </div>

            <div className="use-case-card" style={{ borderColor: 'rgba(22, 163, 106, 0.4)' }}>
              <h3 className="use-case-title" style={{ color: '#34d399' }}>Logic</h3>
              <p className="use-case-description">
                Data transforms, conditional branching, ABI encode/decode, and consensus
                aggregation. Process and route data between nodes.
              </p>
            </div>

            <div className="use-case-card" style={{ borderColor: 'rgba(234, 88, 12, 0.4)' }}>
              <h3 className="use-case-title" style={{ color: '#fb923c' }}>Solidity Contracts</h3>
              <p className="use-case-description">
                IReceiver, price feed, custom data consumers, and event emitters.
                Write, compile, and deploy consumer contracts in-app.
              </p>
            </div>

            <div className="use-case-card" style={{ borderColor: 'rgba(107, 114, 128, 0.4)' }}>
              <h3 className="use-case-title" style={{ color: '#9ca3af' }}>Chain Config</h3>
              <p className="use-case-description">
                Chain selectors, contract addresses, wallet signers, and RPC endpoints.
                Configure your target network and deployment settings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Mariposa Section */}
      <section className="why-section">
        <div className="container">
          <h2 className="section-title-center">Why Mariposa</h2>

          <div className="why-grid">
            <div className="why-card">
              <h3 className="why-title">Visual-first, code-ready.</h3>
              <p className="why-description">
                Design workflows visually, then export production CRE SDK TypeScript.
                No trade-off between ease of use and real code output.
              </p>
            </div>

            <div className="why-card">
              <h3 className="why-title">AI-powered workflow design.</h3>
              <p className="why-description">
                Describe what you want in plain English. The Copilot creates the nodes,
                connects the edges, and configures the pipeline for you.
              </p>
            </div>

            <div className="why-card">
              <h3 className="why-title">End-to-end in one tool.</h3>
              <p className="why-description">
                Design, configure, generate code, simulate, compile contracts, and deploy.
                No context-switching between CLI tools and editors.
              </p>
            </div>

            <div className="why-card">
              <h3 className="why-title">Built for Chainlink CRE.</h3>
              <p className="why-description">
                Not a generic workflow tool. Every node type, config schema, and code generator
                is purpose-built for the Chainlink Runtime Environment.
              </p>
            </div>

            <div className="why-card">
              <h3 className="why-title">Open architecture.</h3>
              <p className="why-description">
                Full-stack TypeScript. ReactFlow canvas. Express API. MongoDB. Redis queues.
                Extend, customize, or self-host to fit your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <h2 className="section-title-center">Simple pricing. Start free.</h2>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 className="pricing-tier">FREE</h3>
              <div className="pricing-price">$0<span>/month</span></div>
              <ul className="pricing-features">
                <li>3 pipelines</li>
                <li>100 executions/month</li>
                <li>Testnet deployment</li>
                <li>AI Copilot (limited)</li>
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
                <li>Unlimited pipelines</li>
                <li>Unlimited executions</li>
                <li>Mainnet deployment</li>
                <li>Full AI Copilot</li>
                <li>Email support</li>
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
                <li>Execution audit logs</li>
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
                <li>Custom node types</li>
                <li>SLA guarantee</li>
                <li>Dedicated support</li>
                <li>Self-hosted option</li>
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
          <h2 className="final-cta-title">Ready to build your first CRE workflow?</h2>
          <p className="final-cta-subtitle">
            Go from idea to deployed Chainlink workflow in minutes.
          </p>
          <button className="final-cta-btn" onClick={() => router.push('/register')}>
            Start Building Free
          </button>
          <p className="final-cta-note">
            No credit card required. Free tier includes testnet deployment.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-icon">&#x1F98B;</span>
              <span className="logo-text">MARIPOSA</span>
            </div>
            <div className="footer-text">
              Mariposa &mdash; Visual pipeline builder for Chainlink CRE.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
