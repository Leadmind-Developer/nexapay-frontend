export default function AuthLayout({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center">{title}</h1>
        {children}
        {footer && <div className="text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}
