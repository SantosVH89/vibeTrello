export function FormMessage({ type = 'error', children }) {
  if (!children) return null;

  const estilos = type === 'error'
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-blue-200 bg-blue-50 text-blue-700';

  return (
    <div className={`rounded border px-3 py-2 text-sm ${estilos}`}>
      {children}
    </div>
  );
}
