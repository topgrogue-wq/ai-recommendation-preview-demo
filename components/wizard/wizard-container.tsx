import { ArrowRight, Check, Sparkles } from 'lucide-react';

const steps = ['Agency profile', 'AI recommendations', 'Website analysis'];

export default function WizardContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_30px_hsl(var(--primary)/.22)]">
              <Sparkles size={19} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">AI Recommendation Preview</p>
              <p className="text-xs text-muted-foreground">Visibility intelligence for modern agencies</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            Live analysis workspace
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-6">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Audit flow</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">Make your agency easier for AI to recommend.</h1>
            </div>
            <nav aria-label="Analysis steps" className="space-y-2">
              {steps.map((step, index) => (
                <div key={step} className={`flex items-center gap-3 rounded-lg px-3 py-3 ${index === 0 ? 'bg-primary/10 text-foreground' : 'text-muted-foreground'}`}>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${index === 0 ? 'bg-primary text-primary-foreground' : 'border border-border'}`}>
                    {index === 0 ? <Check size={14} aria-hidden="true" /> : index + 1}
                  </span>
                  <span className="text-sm font-medium">{step}</span>
                </div>
              ))}
            </nav>
            <div className="mt-8 hidden rounded-xl border border-border bg-card p-4 lg:block">
              <p className="text-xs font-semibold text-foreground">What you&apos;ll get</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">A relevant AI recommendation test, one clear visibility gap, and one evidence-based website improvement.</p>
            </div>
          </aside>

          <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-[0_18px_60px_hsl(var(--background)/.22)] sm:p-7 lg:p-9">
            {children}
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span>Built for transparent, evidence-based recommendations</span>
          <ArrowRight size={14} aria-hidden="true" />
        </footer>
      </div>
    </main>
  );
}
