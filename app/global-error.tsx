"use client";

export default function GlobalError() {
  return (
    <html>
      <body>
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
          <p className="text-sm font-medium text-destructive">Critical Error</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Application failed to load</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Please refresh the page. If the issue persists, check the deployment logs.
          </p>
        </div>
      </body>
    </html>
  );
}
