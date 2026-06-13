import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { navItems } from "@/constants/nav";

const subtitles: Record<string, string> = {
  "/tasks": "创建和管理数据标准检查任务",
  "/tasks/task-001/matching": "系统自动匹配待检查字段与标准字段",
  "/tasks/task-001/issues": "查看检查发现的问题并执行整改",
  "/rectification": "跟踪整改进度，审核整改结果",
  "/analytics": "查看项目达标率与违规分布分析",
};

export default function AppLayout() {
  const location = useLocation();
  const currentNav = navItems.find((n) => {
    if (location.pathname.startsWith("/tasks/") && n.path.includes("/tasks/")) {
      return true;
    }
    return location.pathname === n.path || location.pathname.startsWith(n.path + "/");
  });
  const title = currentNav?.label || "数据标准检查";

  const getSubtitle = () => {
    if (location.pathname === "/tasks") return subtitles["/tasks"];
    if (location.pathname.includes("/matching")) return subtitles["/tasks/task-001/matching"];
    if (location.pathname.includes("/issues")) return subtitles["/tasks/task-001/issues"];
    if (location.pathname === "/rectification") return subtitles["/rectification"];
    if (location.pathname === "/analytics") return subtitles["/analytics"];
    return undefined;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} subtitle={getSubtitle()} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
