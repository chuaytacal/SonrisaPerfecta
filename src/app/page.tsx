import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the main dashboard page
  redirect('/dashboard');
  
  // Fallback content, though redirect should happen first
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary">Redirigiendo al Dashboard...</h1>
    </div>
  );
}
