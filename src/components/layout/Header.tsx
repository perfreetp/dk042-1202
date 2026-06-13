import { Bell, Search, User } from "lucide-react";

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="搜索..."
            className="w-64 pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
          />
        </div>
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
            <User size={16} />
          </div>
          <div className="text-sm">
            <div className="font-medium text-slate-800">数据治理专员</div>
            <div className="text-xs text-slate-500">admin@company.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}
