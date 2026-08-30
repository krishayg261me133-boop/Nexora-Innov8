import { Link } from 'react-router-dom';
import { Sparkles, Quote } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - visual */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden gradient-bg p-12">
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse-slow" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur-sm text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl font-bold text-white">NEXORA</span>
          </Link>
        </div>
        <div className="relative">
          <Quote className="h-10 w-10 text-white/30" />
          <p className="mt-4 text-2xl font-display font-semibold text-white leading-snug max-w-md">
            "I found my hackathon team in under 10 minutes. The match score was spot on — we won first place."
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center text-white font-semibold">
              SB
            </div>
            <div>
              <div className="text-white font-medium">Saloni Bhanwar</div>
              <div className="text-white/70 text-sm">ECE Student, 1st Year</div>
            </div>
          </div>
        </div>
        <div className="relative flex gap-8 text-white/80">
          <div>
            <div className="font-display text-2xl font-bold text-white">10+</div>
            <div className="text-sm">Students</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-white">10+</div>
            <div className="text-sm">Projects</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-white">10+</div>
            <div className="text-sm">Teams Formed</div>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-slatey-50">
        <div className="w-full max-w-md animate-fade-up">
          <Link to="/" className="flex items-center gap-2.5 lg:hidden mb-8">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-bg text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold text-slatey-900">NEXORA</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-slatey-900">{title}</h1>
          <p className="mt-2 text-slatey-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
