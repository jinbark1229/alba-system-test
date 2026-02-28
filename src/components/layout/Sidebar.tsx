// src/components/layout/Sidebar.tsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface NavItem {
    path: string;
    icon: string;
    label: string;
    roles?: string[];
}

const navItems: NavItem[] = [
    { path: "/", icon: "home", label: "홈" },
    { path: "/daily-log", icon: "edit_note", label: "근무 일지", roles: ["worker"] },
    { path: "/schedule", icon: "calendar_month", label: "근무 일정", roles: ["worker", "boss"] },
    { path: "/salary", icon: "attach_money", label: "급여 계산", roles: ["worker"] },
    { path: "/notices", icon: "campaign", label: "공지사항", roles: ["worker", "boss"] },
    { path: "/settings", icon: "settings", label: "설정", roles: ["worker", "manager", "boss", "admin"] },
];

const adminItems: NavItem[] = [
    { path: "/admin/export", icon: "download", label: "데이터 내보내기", roles: ["boss", "admin"] },
    { path: "/admin/allowed-names", icon: "person_add", label: "허용 이름 관리", roles: ["boss"] },
    { path: "/admin/users", icon: "group", label: "사용자 관리", roles: ["admin"] },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path: string) => location.pathname === path;

    const canAccess = (item: NavItem) => {
        if (!item.roles) return true;
        if (!user) return false;
        return item.roles.includes(user.role);
    };

    const filteredNavItems = navItems.filter(canAccess);
    const filteredAdminItems = adminItems.filter(canAccess);

    return (
        <aside className="w-[280px] bg-white dark:bg-[#1a2632] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-300 hidden lg:flex h-full">
            <div className="flex h-full flex-col justify-between p-4">
                <div className="flex flex-col gap-8">
                    {/* User Profile */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="bg-primary/20 rounded-full size-12 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-2xl">person</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-slate-900 dark:text-white text-base font-bold leading-normal">
                                {user?.name || "게스트"}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal">
                                {user?.role === "boss" ? "사장님" : user?.role === "manager" ? "매니져" : user?.role === "admin" ? "관리자" : "알바생"}
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1">
                        {filteredNavItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors ${isActive(item.path)
                                    ? "bg-primary/10 dark:bg-primary/20 text-primary"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}
                            >
                                <span
                                    className={`material-symbols-outlined ${isActive(item.path)
                                        ? "text-primary"
                                        : "text-slate-500 dark:text-slate-400 group-hover:text-primary"
                                        } transition-colors`}
                                    style={{ fontSize: "24px" }}
                                >
                                    {item.icon}
                                </span>
                                <p
                                    className={`text-sm font-medium leading-normal ${isActive(item.path)
                                        ? "text-primary font-semibold"
                                        : "text-slate-700 dark:text-slate-300 group-hover:text-primary"
                                        } transition-colors`}
                                >
                                    {item.label}
                                </p>
                            </Link>
                        ))}

                        {/* Divider & Admin Section */}
                        {filteredAdminItems.length > 0 && (
                            <>
                                <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
                                <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase">관리</p>
                                {filteredAdminItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors ${isActive(item.path)
                                            ? "bg-primary/10 dark:bg-primary/20 text-primary"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                    >
                                        <span
                                            className={`material-symbols-outlined ${isActive(item.path)
                                                ? "text-primary"
                                                : "text-slate-500 dark:text-slate-400 group-hover:text-primary"
                                                } transition-colors`}
                                            style={{ fontSize: "24px" }}
                                        >
                                            {item.icon}
                                        </span>
                                        <p
                                            className={`text-sm font-medium leading-normal ${isActive(item.path)
                                                ? "text-primary font-semibold"
                                                : "text-slate-700 dark:text-slate-300 group-hover:text-primary"
                                                } transition-colors`}
                                        >
                                            {item.label}
                                        </p>
                                    </Link>
                                ))}
                            </>
                        )}
                    </nav>
                </div>

                {/* Footer/Logout */}
                <div className="px-2">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 group transition-colors"
                    >
                        <span
                            className="material-symbols-outlined text-slate-400 group-hover:text-red-500 transition-colors"
                            style={{ fontSize: "24px" }}
                        >
                            logout
                        </span>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-normal group-hover:text-red-500 transition-colors">
                            로그아웃
                        </p>
                    </button>
                </div>
            </div>
        </aside>
    );
}

// Mobile Bottom Navigation
export function MobileNav() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => location.pathname === path;

    const canAccess = (item: NavItem) => {
        if (!item.roles) return true;
        if (!user) return false;
        return item.roles.includes(user.role);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Combine nav items for mobile - different order for boss
    const isBoss = user?.role === 'boss' || user?.role === 'admin';

    const mobileNavItems: NavItem[] = isBoss ? [
        // Boss main items
        { path: "/", icon: "home", label: "홈" },
        { path: "/schedule", icon: "calendar_month", label: "일정", roles: ["boss"] },
        { path: "/notices", icon: "campaign", label: "공지", roles: ["boss"] },
        { path: "/admin/export", icon: "download", label: "내보내기", roles: ["boss", "admin"] },
        { path: "/admin/allowed-names", icon: "person_add", label: "허용관리", roles: ["boss"] },
    ].filter(canAccess) : [
        // Worker main items
        { path: "/", icon: "home", label: "홈" },
        { path: "/daily-log", icon: "edit_note", label: "근무일지", roles: ["worker"] },
        { path: "/schedule", icon: "calendar_month", label: "일정", roles: ["worker"] },
        { path: "/salary", icon: "attach_money", label: "급여", roles: ["worker"] },
        { path: "/notices", icon: "campaign", label: "공지", roles: ["worker"] },
    ].filter(canAccess);

    // Show only first 4 items + more menu
    const visibleItems = mobileNavItems.slice(0, 4);
    const moreItems = mobileNavItems.slice(4);

    const [showMore, setShowMore] = useState(false);

    return (
        <>
            {/* More Menu Overlay */}
            {showMore && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setShowMore(false)}
                />
            )}

            {/* More Menu */}
            {showMore && (
                <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-[#1a2632] border-t border-slate-200 dark:border-slate-700 z-50 lg:hidden p-4 shadow-lg">
                    <div className="grid grid-cols-4 gap-4">
                        {moreItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setShowMore(false)}
                                className={`flex flex-col items-center gap-1 py-2 rounded-lg ${isActive(item.path) ? 'text-primary bg-primary/10' : 'text-slate-500'}`}
                            >
                                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        ))}
                        <Link
                            to="/settings"
                            onClick={() => setShowMore(false)}
                            className={`flex flex-col items-center gap-1 py-2 rounded-lg ${isActive('/settings') ? 'text-primary bg-primary/10' : 'text-slate-500'}`}
                        >
                            <span className="material-symbols-outlined text-xl">settings</span>
                            <span className="text-xs font-medium">설정</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex flex-col items-center gap-1 py-2 rounded-lg text-red-500"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                            <span className="text-xs font-medium">로그아웃</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a2632] border-t border-slate-200 dark:border-slate-700 z-50 lg:hidden safe-area-bottom">
                <div className="flex justify-around items-center h-16">
                    {visibleItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors ${isActive(item.path)
                                ? 'text-primary'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors ${showMore ? 'text-primary' : 'text-slate-400'}`}
                    >
                        <span className="material-symbols-outlined text-2xl">{showMore ? 'expand_more' : 'expand_less'}</span>
                        <span className="text-[10px] font-medium">더보기</span>
                    </button>
                </div>
            </nav>
        </>
    );
}
