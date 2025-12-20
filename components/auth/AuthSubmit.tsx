export default function AuthSubmit({
  children,
  loading,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  loading?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
