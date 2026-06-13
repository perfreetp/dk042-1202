import { NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { navItems } from "@/constants/nav";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-primary-900 text-white min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-primary-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-700 flex items-center justify-center">
            <ShieldCheck size={22} className="text-primary-200" />
          </div>
          <div>
            <div className="text-base font-semibold leading-tight">
              数据标准检查
            </div>
            <div className="text-xs text-primary-300 mt-0.5">
              Data Standard Inspector
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive
                  ? "bg-primary-700 text-white shadow-inner"
                  : "text-primary-200 hover:bg-primary-800 hover:text-white"
              )
            }
          >
            <item.icon size={18} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-primary-800">
        <div className="text-xs text-primary-300">版本 v1.0.0</div>
      </div>
    </aside>
  );
}
