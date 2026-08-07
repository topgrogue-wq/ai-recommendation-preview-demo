export default function WizardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-foreground">
              AI Visibility Preview
            </h1>
          </div>
          <p className="text-center text-muted-foreground mt-2 max-w-lg mx-auto">
            See how AI platforms currently recommend real estate agencies, identify one visibility gap, and preview one improvement that can help your agency become easier for AI to recommend.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
