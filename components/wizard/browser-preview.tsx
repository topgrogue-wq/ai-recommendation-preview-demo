interface BrowserPreviewProps {
  agencyName: string;
  websiteUrl: string;
  businessLocation?: string;
  variant?: 'current' | 'improved';
}

export default function BrowserPreview({ agencyName, websiteUrl, businessLocation, variant = 'current' }: BrowserPreviewProps) {
  const improved = variant === 'improved';
  const location = businessLocation || 'your local market';
  const address = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') || `${agencyName.toLowerCase().replace(/\s+/g, '-')}.com`;

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-card shadow-sm ${improved ? 'border-primary/35 shadow-primary/5' : 'border-border'}`}>
      <div className="flex items-center gap-3 border-b border-border bg-muted px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded border border-border bg-background px-3 py-1.5 text-center text-xs text-muted-foreground">{address}</div>
      </div>

      <div className="bg-background">
        <div className="border-b border-border px-5 py-4 md:px-7">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold tracking-tight text-foreground">{agencyName}</span>
            <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
              <span>Services</span><span>Areas Served</span><span>About</span><span className="rounded border border-border px-2.5 py-1.5 text-foreground">Contact</span>
            </div>
          </div>
        </div>

        <div className="relative grid gap-6 px-5 py-8 md:min-h-[345px] md:grid-cols-[1fr_0.9fr] md:px-7 md:py-10">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              {improved ? `${location} · Local experts` : 'Trusted local experts'}
            </p>
            <h2 className="max-w-md text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
              {improved ? `${agencyName}, trusted across ${location}.` : `Find the right local expertise in ${location}.`}
            </h2>
            <p className="mt-3 max-w-md text-xs leading-5 text-muted-foreground md:text-sm">
              {improved ? `Helping clients make confident decisions across ${location} with clear, relevant guidance.` : 'Explore tailored services and local expertise from a team that understands your goals.'}
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="rounded bg-foreground px-3.5 py-2 text-[11px] font-medium text-background">{improved ? `Explore ${location}` : 'Explore services'}</div>
              <div className="rounded border border-border px-3.5 py-2 text-[11px] font-medium text-foreground">{improved ? 'Talk with an advisor' : 'Meet our team'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5" aria-label="Service imagery preview">
            <div className="min-h-32 rounded bg-secondary" />
            <div className="mt-6 min-h-32 rounded bg-muted" />
            <div className="col-span-2 flex items-center justify-between rounded border border-border bg-card px-3.5 py-3">
              <div>
                <p className="text-[11px] font-medium text-foreground">{improved ? `${location} services by area` : 'Featured services'}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Local expertise · Clear guidance · Trusted support</p>
              </div>
              <span className="text-[10px] text-muted-foreground">View more</span>
            </div>
          </div>

          {!improved && (
            <div className="pointer-events-none absolute left-5 top-7 rounded-md border border-primary/60 bg-background/95 px-3 py-2 shadow-lg md:left-[43%] md:top-8">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">1</span>
                <span className="max-w-44 text-[11px] font-medium leading-4 text-foreground">Missing location-specific authority near the primary CTA.</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border px-5 py-2.5 text-center text-[10px] text-muted-foreground">{improved ? 'Preview of one AI-friendly improvement' : 'Preview reconstructed from publicly visible page content'}</div>
      </div>
    </div>
  );
}
