export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-card shadow-soft p-6 ${hover ? 'hover:shadow-card transition-shadow duration-smooth' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

