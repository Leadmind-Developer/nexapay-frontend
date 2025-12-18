export default function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-gray-600">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border rounded-lg"
      />
    </div>
  );
}
