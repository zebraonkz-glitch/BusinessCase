import Link from "next/link";

export function HomeLink() {
  return (
    <Link href="/" className="text-sm text-sky-600 hover:underline">
      ← Главная
    </Link>
  );
}
