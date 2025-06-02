import Link from 'next/link';

const ToothIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-primary"
  >
    <path d="M9.95312 3.40625C8.17188 4.0625 6.84375 5.6875 6.65625 7.625C6.46875 9.5625 7.59375 11.4375 9.375 12.25C9.375 12.25 9.375 12.25 9.375 12.25C9.375 12.25 9.375 12.25 9.375 12.25C10.0938 12.625 10.5 13.4062 10.5 14.2188C10.5 15.25 9.75 16.0938 8.8125 16.25C7.125 16.5312 5.4375 17.625 4.84375 19.25C4.25 20.875 4.875 22.75 6.25 23.75C9.25 25.625 14.6562 25.625 17.6562 23.75C19.0312 22.75 19.6562 20.875 19.0625 19.25C18.4688 17.625 16.7812 16.5312 15.0938 16.25C14.1562 16.0938 13.4062 15.25 13.4062 14.2188C13.4062 13.4062 13.8125 12.625 14.5312 12.25C14.5312 12.25 14.5312 12.25 14.5312 12.25C14.5312 12.25 14.5312 12.25 14.5312 12.25C16.3438 11.4375 17.4375 9.5625 17.25 7.625C17.0625 5.6875 15.7344 4.0625 13.9531 3.40625C13.0312 3.09375 11.875 3.09375 10.9531 3.40625H9.95312Z" />
  </svg>
);

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <ToothIcon />
      <span className="font-headline text-2xl font-bold text-primary">
        Sonrisa Perfecta
      </span>
    </Link>
  );
}
