'use client';

export default function GlobalError({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void 
}) {
  return (
    <html>
      <body style={{padding: 16}}>
        <h2>Something went wrong</h2>
        <pre style={{whiteSpace: 'pre-wrap', fontSize: 12, opacity: 0.85}}>
          {String(error?.message ?? 'Unknown error')}
        </pre>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
