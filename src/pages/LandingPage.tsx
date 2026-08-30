import { Link } from 'react-router-dom';
import {
  ArrowRight, Search, Users, Sparkles, Target, MessageSquare, Zap, Shield,
  UserPlus, BookOpen, Bell, Trophy, CheckCircle2,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slatey-50">
      <LandingNav />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}

function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slatey-200/60">
      <nav className="container-px mx-auto max-w-container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-bg text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-slatey-900">NEXORA</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#problem" className="text-sm font-medium text-slatey-600 hover:text-brand-600 transition-colors">Problem</a>
          <a href="#solution" className="text-sm font-medium text-slatey-600 hover:text-brand-600 transition-colors">Solution</a>
          <a href="#features" className="text-sm font-medium text-slatey-600 hover:text-brand-600 transition-colors">Features</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost">Log In</Link>
          <Link to="/signup" className="btn-primary">Get Started</Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="absolute inset-0 hero-grid opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full gradient-bg opacity-10 blur-3xl" />
      <div className="container-px mx-auto max-w-container relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
              <Sparkles className="h-4 w-4" />
              The Smart Campus Talent Network
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-slatey-900 text-balance sm:text-5xl lg:text-6xl">
              Find the Perfect Team for Your{' '}
              <span className="gradient-text">Next Big Idea</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slatey-600">
              NEXORA helps students discover teammates, research partners, and
              project collaborators using skills, interests, experience, and availability.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/signup" className="btn-primary text-base">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-base">
                Explore Talent
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-slatey-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-tealx-500" />
                Verified students only
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-tealx-500" />
                Smart matching
              </div>
            </div>
          </div>

          <div className="relative animate-scale-in" style={{ animationDelay: '200ms' }}>
            <NetworkGraph />
          </div>
        </div>
      </div>
    </section>
  );
}

function NetworkGraph() {
  const nodes = [
    { x: 50, y: 50, label: 'You', main: true },
    { x: 15, y: 20, label: 'AI/ML' },
    { x: 85, y: 25, label: 'Frontend' },
    { x: 20, y: 75, label: 'Backend' },
    { x: 80, y: 70, label: 'UI/UX' },
    { x: 50, y: 12, label: 'Cloud' },
    { x: 50, y: 88, label: 'Data' },
  ];
  return (
    <div className="relative aspect-square max-w-md mx-auto">
      <div className="absolute inset-0 rounded-3xl gradient-bg-soft border border-white/40" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        {nodes.slice(1).map((n, i) => (
          <line
            key={i}
            x1="50" y1="50"
            x2={n.x} y2={n.y}
            stroke="url(#grad)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.5"
          />
        ))}
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      {nodes.map((n, i) => (
        <div
          key={i}
          className={`absolute -translate-x-1/2 -translate-y-1/2 ${n.main ? 'animate-pulse-slow' : 'animate-float'}`}
          style={{ left: `${n.x}%`, top: `${n.y}%`, animationDelay: `${i * 0.5}s` }}
        >
          <div
            className={`grid place-items-center rounded-2xl font-semibold shadow-lg ${
              n.main
                ? 'h-20 w-20 gradient-bg text-white text-sm shadow-glow'
                : 'h-14 w-14 bg-white text-slatey-700 text-xs shadow-card'
            }`}
          >
            {n.label}
          </div>
        </div>
      ))}
    </div>
  );
}

const problems = [
  { icon: Users, title: 'Finding teammates is difficult', desc: 'Most students rely on friend circles, missing out on great collaborators.', stat: '73%' },
  { icon: Search, title: 'Talent is scattered across campus', desc: 'Skills and expertise are hidden across departments and year groups.', stat: '12+' },
  { icon: Target, title: 'Opportunities are missed', desc: 'Hackathons and research slots go unfilled due to poor discovery.', stat: '40%' },
  { icon: BookOpen, title: 'Research connections are hard', desc: 'Students struggle to find faculty projects matching their skills.', stat: '55%' },
  { icon: Zap, title: 'Team formation is inefficient', desc: 'Hours wasted coordinating instead of building and innovating.', stat: '6h+' },
];

function ProblemSection() {
  return (
    <section id="problem" className="py-24 lg:py-32">
      <div className="container-px mx-auto max-w-container">
        <Reveal className="max-w-2xl">
          <span className="section-eyebrow">The Problem</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-slatey-900 text-balance sm:text-4xl lg:text-5xl">
            Students struggle to find the right collaborators
          </h2>
          <p className="mt-5 text-lg text-slatey-600">
            The talent exists — it's just scattered, undiscovered, and disconnected.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="card group p-6 hover:shadow-card-hover hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <span className="font-display text-3xl font-bold text-slatey-200 group-hover:text-brand-200 transition-colors">
                    {p.stat}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-slatey-900">{p.title}</h3>
                <p className="mt-2 text-sm text-slatey-500 leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { icon: Shield, title: 'Verify Your Identity', desc: 'Register with your institute email to join the verified student network.' },
  { icon: UserPlus, title: 'Create Your Profile', desc: 'Add your skills, interests, experience, and availability to showcase your talent.' },
  { icon: Search, title: 'Discover Talent', desc: 'Search and filter students by skills, interests, department, and availability.' },
  { icon: Users, title: 'Build Teams', desc: 'Create projects, invite matched teammates, and start collaborating instantly.' },
];

function SolutionSection() {
  return (
    <section id="solution" className="py-24 lg:py-32 bg-white border-y border-slatey-200/60">
      <div className="container-px mx-auto max-w-container">
        <Reveal className="max-w-2xl">
          <span className="section-eyebrow">The Solution</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-slatey-900 text-balance sm:text-4xl lg:text-5xl">
            How NEXORA works
          </h2>
          <p className="mt-5 text-lg text-slatey-600">
            From signup to team formation in four simple steps.
          </p>
        </Reveal>
        <div className="mt-16 relative">
          <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-brand-200 via-cyanx-200 to-tealx-200 lg:block" />
          <div className="grid gap-8 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 120}>
                <div className="relative">
                  <div className="flex items-center gap-4 lg:block">
                    <div className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl gradient-bg text-white shadow-glow">
                      <s.icon className="h-7 w-7" />
                    </div>
                    <span className="lg:absolute lg:-top-2 lg:left-16 font-display text-4xl font-bold text-slatey-100">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-slatey-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-slatey-500 leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Shield, title: 'Authorised Login', desc: 'Secure account creation with institute email verification for a trusted student-only network.' },
  { icon: Search, title: 'Talent Discovery', desc: 'Search students, browse skills, and discover expertise across your entire campus.' },
  { icon: Sparkles, title: 'Smart Match Score', desc: 'AI-powered compatibility scoring based on skills, availability, and shared interests.' },
  { icon: Users, title: 'Team Formation', desc: 'Create projects, invite teammates, and build balanced teams with missing-role detection.' },
  { icon: BookOpen, title: 'Research & Opportunities', desc: 'Browse faculty research listings, save opportunities, and apply with one click.' },
  { icon: MessageSquare, title: 'Communication Hub', desc: 'Direct messaging and team channels inspired by Slack and Discord.' },
  { icon: Target, title: 'Missing Talent Detection', desc: 'Identify required roles for your team and get suggestions for ideal teammates.' },
  { icon: Bell, title: 'Real-time Notifications', desc: 'Stay updated on team invites, applications, messages, and match suggestions.' },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="container-px mx-auto max-w-container">
        <Reveal className="max-w-2xl">
          <span className="section-eyebrow">Features</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-slatey-900 text-balance sm:text-4xl lg:text-5xl">
            Everything you need to collaborate
          </h2>
          <p className="mt-5 text-lg text-slatey-600">
            A complete platform combining the best of LinkedIn, GitHub, Discord, and Notion — built for students.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <div className="card group h-full p-6 hover:shadow-card-hover hover:-translate-y-1">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-cyanx-50 text-brand-600 transition-all group-hover:from-brand-600 group-hover:to-cyanx-600 group-hover:text-white">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-base font-semibold text-slatey-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slatey-500 leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container-px mx-auto max-w-container">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl gradient-bg p-12 lg:p-16 text-center">
            <div className="absolute inset-0 hero-grid opacity-20" />
            <div className="relative">
              <Trophy className="mx-auto h-12 w-12 text-white/90" />
              <h2 className="mt-6 font-display text-3xl font-bold text-white text-balance sm:text-4xl lg:text-5xl">
                Next Generation of Student Collaboration
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
                Join the verified student talent network and find your perfect team today.
              </p>
              <Link to="/signup" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-brand-600 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer className="border-t border-slatey-200/60 bg-white">
      <div className="container-px mx-auto max-w-container py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg gradient-bg text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-bold text-slatey-900">NEXORA</span>
          </div>
          <p className="text-sm text-slatey-500">
            The Smart Campus Talent Network — Next Generation of Student Collaboration
          </p>
          <p className="text-sm text-slatey-400">© {new Date().getFullYear()} NEXORA</p>
        </div>
      </div>
    </footer>
  );
}
