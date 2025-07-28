// File: app/page.tsx
'use client'; // This directive is necessary for using hooks

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginButton from '../components/LoginButton';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(''); // Clear previous result

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResult(data.text);

    } catch (error) {
      console.error('Failed to fetch:', error);
      setResult('Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <LoginButton />
      <h1>Ask Gemini AI 🚀</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
          rows={4}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
        <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'Generating...' : 'Submit'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h2>Response:</h2>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}