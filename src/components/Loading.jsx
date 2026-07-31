export default function Loading() {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style={{ animation: "spin 1s linear infinite" }}
      >
        <style>
          {`@keyframes spin { 100% { transform: rotate(360deg); } }`}
        </style>
        <path
          d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span>Loading...</span>
    </div>
  );
}