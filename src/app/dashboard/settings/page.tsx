import { HomeLink } from "@/components/layout/home-link";

export default function SettingsPage() {
  return (
    <div>
      <p className="mb-4">
        <HomeLink />
      </p>
      <h1 className="text-2xl font-bold text-slate-900">Личный кабинет</h1>
      <h2 className="mt-1 text-lg text-slate-600">Настройки</h2>
      <p className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-slate-500">
        Скоро здесь появятся настройки профиля и уведомлений.
      </p>
    </div>
  );
}
