import { HomeLink } from "@/components/layout/home-link";

export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="mb-4">
        <HomeLink />
      </p>
      <h1 className="text-3xl font-bold text-slate-900">Политика</h1>
      <p className="mt-6 text-slate-600 leading-relaxed">
        Скоро здесь будет опубликована политика конфиденциальности и условия
        использования платформы Business Case.
      </p>
    </div>
  );
}
