// src/components/layout/Sidebar.tsx
import { useState, useEffect } from "react";
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

function useDarkMode() {
    const [isDark, setIsDark] = useState(() => {
        return document.documentElement.classList.contains('dark') ||
            localStorage.getItem('theme') === 'dark';
    });

    const toggle = () => {
        const newVal = !isDark;
        setIsDark(newVal);
        if (newVal) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        } else if (saved === 'light') {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        }
    }, []);

    return { isDark, toggle };
}

export default function Sidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark, toggle } = useDarkMode();

    const isActive = (path: string) => location.pathname === path;

    const canAccess = (item: NavItem) => {
        if (!item.roles) return true;
        if (!user) return false;
        if (user.role === 'admin') return true;
        return item.roles.includes(user.role);
    };

    const filteredNavItems = navItems.filter(canAccess);
    const filteredAdminItems = adminItems.filter(canAccess);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <aside className="w-[280px] bg-white dark:bg-[#1a2632] border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-300 hidden lg:flex h-full">
            <div className="flex h-full flex-col justify-between p-4">
                <div className="flex flex-col gap-8">
                    {/* User Profile */}
                    <div className="flex items-center gap-3 px-2 pt-2">
                        <div className="bg-primary/20 rounded-full size-12 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-2xl">person</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-slate-900 dark:text-white text-base font-bold leading-normal truncate">
                                {user?.name || "게스트"}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal">
                                {user?.role === "boss" ? "사장님" : user?.role === "manager" ? "매니저" : user?.role === "admin" ? "관리자" : "알바생"}
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

                {/* Bottom Actions: Dark Mode + Logout */}
                <div className="flex flex-col gap-2 pb-2">
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3"></div>
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggle}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full text-left group"
                    >
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors" style={{ fontSize: "24px" }}>
                            {isDark ? "light_mode" : "dark_mode"}
                        </span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                            {isDark ? "라이트 모드" : "다크 모드"}
                        </span>
                    </button>

                    {/* Logout */}
                    {user && user.id !== 'guest-viewer' && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left group"
                        >
                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-red-500 transition-colors" style={{ fontSize: "24px" }}>
                                logout
                            </span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-red-500 transition-colors">
                                로그아웃
                            </span>
                        </button>
                    )}
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
    const { isDark, toggle } = useDarkMode();

    const isActive = (path: string) => location.pathname === path;

    const canAccess = (item: NavItem) => {
        if (!item.roles) return true;
        if (!user) return false;
        if (user.role === 'admin') return true;
        return item.roles.includes(user.role);
    };

    const isAdmin = user?.role === 'admin';
    const isBoss = user?.role === 'boss';

    const mobileNavItems: NavItem[] = isAdmin ? [
        { path: "/", icon: "home", label: "홈" },
        { path: "/daily-log", icon: "edit_note", label: "근무일지" },
        { path: "/schedule", icon: "calendar_month", label: "일정" },
        { path: "/salary", icon: "attach_money", label: "급여" },
        { path: "/notices", icon: "campaign", label: "공지" },
        { path: "/admin/export", icon: "download", label: "내보내기" },
        { path: "/admin/allowed-names", icon: "person_add", label: "허용관리" },
        { path: "/admin/users", icon: "group", label: "사용자" },
    ].filter(canAccess) : isBoss ? [
        { path: "/", icon: "home", label: "홈" },
        { path: "/schedule", icon: "calendar_month", label: "일정", roles: ["boss"] },
        { path: "/notices", icon: "campaign", label: "공지", roles: ["boss"] },
        { path: "/admin/export", icon: "download", label: "내보내기", roles: ["boss", "admin"] },
        { path: "/admin/allowed-names", icon: "person_add", label: "허용관리", roles: ["boss"] },
    ].filter(canAccess) : [
        { path: "/", icon: "home", label: "홈" },
        { path: "/daily-log", icon: "edit_note", label: "근무일지", roles: ["worker"] },
        { path: "/schedule", icon: "calendar_month", label: "일정", roles: ["worker"] },
        { path: "/salary", icon: "attach_money", label: "급여", roles: ["worker"] },
        { path: "/notices", icon: "campaign", label: "공지", roles: ["worker"] },
    ].filter(canAccess);

    const visibleItems = mobileNavItems.slice(0, 4);
    const moreItems = mobileNavItems.slice(4);

    const [showMore, setShowMore] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={() => { toggle(); setShowMore(false); }}
                            className="flex flex-col items-center gap-1 py-2 rounded-lg text-slate-500"
                        >
                            <span className="material-symbols-outlined text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
                            <span className="text-xs font-medium">{isDark ? '라이트' : '다크'}</span>
                        </button>
                        {/* Logout */}
                        {user && user.id !== 'guest-viewer' && (
                            <button
                                onClick={() => { handleLogout(); setShowMore(false); }}
                                className="flex flex-col items-center gap-1 py-2 rounded-lg text-red-500"
                            >
                                <span className="material-symbols-outlined text-xl">logout</span>
                                <span className="text-xs font-medium">로그아웃</span>
                            </button>
                        )}
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
