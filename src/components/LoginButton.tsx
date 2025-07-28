'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p>Signed in as {session.user?.email}</p>
        <button
          onClick={async () => {
            await signOut();
          }}
          className="rounded-md bg-gray-800 px-3 py-2 text-white"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <p>Not signed in</p>
      <button
        onClick={async () => {
          await signIn();
        }}
        className="rounded-md bg-gray-800 px-3 py-2 text-white"
      >
        Sign in
      </button>
    </div>
  );
}
