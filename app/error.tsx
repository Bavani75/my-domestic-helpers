'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="loading"><h1>Couldn’t load this page</h1><p>Check your connection and try again.</p><button onClick={reset}>Retry</button></main>; }
