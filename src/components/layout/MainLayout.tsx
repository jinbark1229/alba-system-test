import { useNavigate } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar, { MobileNav } from "./Sidebar";

interface MainLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    breadcrumbs?: { label: string; path?: string }[];
}

export default function MainLayout({ children, title, description, breadcrumbs }: MainLayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Show simplified layout for non-logged-in users
    if (!user) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                {children}
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">
                {/* Header / Breadcrumbs */}
                <header className="shrink-0 px-6 py-5 lg:px-12 lg:py-8">
                    <div className="max-w-[1000px] mx-auto w-full">
                        {/* Breadcrumbs */}
                        {breadcrumbs && breadcrumbs.length > 0 && (
                            <div className="flex flex-wrap gap-2 items-center mb-4 text-sm">
                                {breadcrumbs.map((crumb, index) => (
                                    <span key={index} className="flex items-center gap-2">
                                        {index > 0 && (
                                            <span className="text-slate-400 dark:text-slate-600 font-medium">/</span>
                                        )}
                                        {crumb.path ? (
                                            <a
                                                href={crumb.path}
                                                className="text-slate-500 dark:text-slate-400 hover:text-primary font-medium"
                                            >
                                                {crumb.label}
                                            </a>
                                        ) : (
                                            <span className="text-slate-900 dark:text-slate-100 font-semibold">
                                                {crumb.label}
                                            </span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Page Heading */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-slate-900 dark:text-white text-3xl lg:text-4xl font-black leading-tight tracking-tight">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-slate-500 dark:text-slate-400 text-base lg:text-lg font-normal max-w-2xl">
                                    {description}
                                </p>
                            )}
                        </div>
                        {/* User Profile & Logout (Visible on Mobile/Tablet or for quick access) */}
                        <div className="absolute top-8 right-6 lg:right-12 flex items-center gap-3">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</span>
                                <span className="text-xs text-slate-500">{user?.role === 'boss' ? '사장님' : user?.role === 'admin' ? '관리자' : '알바생'}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-300 hover:text-red-500 transition-all shadow-sm"
                                title="로그아웃"
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                                <span className="text-sm font-bold hidden sm:inline">로그아웃</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-24 lg:pb-20 lg:px-12">
                    <div className="max-w-[1000px] mx-auto w-full flex flex-col gap-8">
                        {children}
                    </div>
                </div>

                {/* Mobile Navigation */}
                <MobileNav />
            </main>
        </div>
    );
}
