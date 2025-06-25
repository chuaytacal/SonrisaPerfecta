import { redirect } from 'next/navigation';

export default function HomePage() {
  // The middleware will handle redirection based on authentication status.
  // This redirect is a fallback.
  redirect('/login');
}
