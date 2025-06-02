import Link from 'next/link';

const LoayzaLogoIcon = () => (
  <svg
    width="48" // Increased size for better visibility of details
    height="48"
    viewBox="0 0 150 100" // Adjusted viewBox for new logo proportions
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-auto text-primary" // Adjusted height, width auto
  >
    {/* Stylized L/Tooth shape on the left */}
    <path
      d="M35.789 16.1065C30.9091 17.2695 27.2941 21.075 26.9231 25.636C26.5521 30.197 29.0956 34.5615 34.0226 36.263C34.0226 36.263 34.0226 36.263 34.0226 36.263C34.0226 36.263 34.0226 36.263 34.0226 36.263C36.2716 37.0555 37.3541 39.0795 37.3541 41.0611C37.3541 43.6535 34.9216 45.443 32.6116 45.8165C28.4581 46.424 24.8041 49.1075 23.3116 52.87C21.8191 56.6325 23.3956 60.935 27.0341 63.185C34.3306 67.6475 47.5006 67.6475 54.7971 63.185C58.4356 60.935 60.0121 56.6325 58.5196 52.87C57.0271 49.1075 53.3731 46.424 49.2196 45.8165C46.9096 45.443 44.4771 43.6535 44.4771 41.0611C44.4771 39.0795 45.5596 37.0555 47.8321 36.263C47.8321 36.263 47.8321 36.263 47.8321 36.263C47.8321 36.263 47.8321 36.263 47.8321 36.263C52.8446 34.5615 55.3261 30.197 54.9551 25.636C54.5841 21.075 50.9691 17.2695 46.0891 16.1065C43.8676 15.579 40.9541 15.579 38.7326 16.1065H35.789Z"
      fill="currentColor" // Use currentColor to inherit text-primary
    />
    {/* Text: "Centro Dental Especializado" */}
    <text
      x="68"
      y="38" // Positioned above LOAYZA
      fontFamily="Inter, sans-serif"
      fontSize="12" // Smaller font size
      fill="currentColor"
    >
      Centro Dental Especializado
    </text>
    {/* Text: "LOAYZA" */}
    <text
      x="68"
      y="65" // Positioned below the first line
      fontFamily="Inter, sans-serif"
      fontSize="28" // Larger font size
      fontWeight="bold"
      fill="currentColor"
      letterSpacing="0.05em" // Slight letter spacing for stylized look
    >
      LOAYZA
    </text>
  </svg>
);


export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center space-x-2">
      <LoayzaLogoIcon />
      {/* The text is now part of the SVG, so this span can be removed or simplified if needed */}
      {/* For accessibility, you might want to keep a screen-reader friendly version of the name */}
      <span className="sr-only">
        Centro Dental Especializado Loayza
      </span>
    </Link>
  );
}
