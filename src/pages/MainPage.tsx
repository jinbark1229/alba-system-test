// src/pages/MainPage.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MainLayout } from "../components/layout";

export default function MainPage() {
    const { user, withdraw } = useAuth();

    if (user) {
        return (
            <MainLayout title="홈" description={`${user.name}님, 오늘도 좋은 하루 되세요!`}>
                {/* Dashboard Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Worker: Daily Log Widget */}
                    {user.role === "worker" && (
                        <div className="bg-white dark:bg-[#1e2936] p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4 text-emerald-500">
                                <span className="material-symbols-outlined text-3xl">edit_note</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">근무 일지</h3>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                                오늘 근무한 내용을 기록하세요.<br />
                                급여 계산의 기준이 됩니다.
                            </p>
                            <Link to="/daily-log" className="text-emerald-500 font-medium hover:underline text-sm inline-flex items-center gap-1">
                                일지 작성 <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </Link>
                        </div>
                    )}

                    {/* Boss/Admin: Data Export Widget */}
                    {(user.role === "boss" || user.role === "admin") && (
                        <div className="bg-white dark:bg-[#1e2936] p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-4 text-blue-500">
                                <span className="material-symbols-outlined text-3xl">download</span>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">데이터 내보내기</h3>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                                근무 기록과 급여 내역을<br />
                                엑셀/CSV 파일로 다운로드합니다.
                            </p>
                            <Link to="/admin/export" className="text-blue-500 font-medium hover:underline text-sm inline-flex items-center gap-1">
                                내보내기 <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </Link>
                        </div>
                    )}

                    {/* Schedule Widget */}
                    <div className="bg-white dark:bg-[#1e2936] p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4 text-primary">
                            <span className="material-symbols-outlined text-3xl">calendar_month</span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">근무 일정</h3>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                            이번 달 근무 스케줄을 확인하고<br />
                            대타를 요청할 수 있습니다.
                        </p>
                        <Link to="/schedule" className="text-primary font-medium hover:underline text-sm inline-flex items-center gap-1">
                            일정 보기 <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </Link>
                    </div>

                    {/* Notice Widget */}
                    <div className="bg-white dark:bg-[#1e2936] p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4 text-amber-500">
                            <span className="material-symbols-outlined text-3xl">campaign</span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">공지사항</h3>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                            매장 전달사항과 주요 공지를<br />
                            확인할 수 있습니다.
                        </p>
                        <Link to="/notices" className="text-amber-500 font-medium hover:underline text-sm inline-flex items-center gap-1">
                            공지 확인 <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </Link>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">계정 관리</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                if (window.confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                                    withdraw();
                                }
                            }}
                            className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            회원 탈퇴
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // Landing Page (Not Logged In)
    return (
        <div className="min-h-screen bg-white dark:bg-background-dark">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 dark:bg-[#101922]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">storefront</span>
                        알바시스템
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-slate-600 dark:text-slate-300 hover:text-primary font-medium text-sm transition-colors"
                        >
                            로그인
                        </Link>
                        <Link
                            to="/register"
                            className="bg-primary hover:bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
                        >
                            회원가입
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
                        스마트한<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                            아르바이트 관리
                        </span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                        근무 일지 작성부터 급여 계산, 스케줄 관리까지.<br />
                        사장님과 알바생 모두를 위한 최적의 솔루션을 경험하세요.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/login"
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:transform hover:-translate-y-1 transition-all shadow-xl"
                        >
                            지금 시작하기
                        </Link>
                        <a
                            href="#features"
                            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            기능 알아보기
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-slate-50 dark:bg-[#1a2632] px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon="edit_note"
                            title="간편한 일지 작성"
                            description="날짜, 시간, 휴게 시간만 입력하면 끝. 복잡한 절차 없이 매일의 근무를 기록하세요."
                            color="text-blue-500"
                            bg="bg-blue-50 dark:bg-blue-900/20"
                        />
                        <FeatureCard
                            icon="download"
                            title="자동 레포트"
                            description="사장님은 근무 기록을 한눈에 확인하고 CSV/Excel 파일로 손쉽게 다운로드받을 수 있습니다."
                            color="text-purple-500"
                            bg="bg-purple-50 dark:bg-purple-900/20"
                        />
                        <FeatureCard
                            icon="attach_money"
                            title="급여 계산기"
                            description="내 월급은 얼마일까? 시급만 입력하면 근무 시간을 바탕으로 예상 수령액을 바로 확인하세요."
                            color="text-green-500"
                            bg="bg-green-50 dark:bg-green-900/20"
                        />
                        <FeatureCard
                            icon="calendar_month"
                            title="근무 시간표"
                            description="한 달간의 근무 일정을 달력으로 한눈에. 복잡한 표 대신 깔끔한 캘린더 뷰를 제공합니다."
                            color="text-amber-500"
                            bg="bg-amber-50 dark:bg-amber-900/20"
                        />
                        <FeatureCard
                            icon="autorenew"
                            title="반복 업무 자동화"
                            description="매주 반복되는 스케줄은 템플릿으로 설정하세요. 자동으로 일지가 생성됩니다."
                            color="text-cyan-500"
                            bg="bg-cyan-50 dark:bg-cyan-900/20"
                        />
                        <FeatureCard
                            icon="campaign"
                            title="공지사항 게시판"
                            description="사장님의 전달사항을 놓치지 마세요. 휴무 일정이나 매장 공지를 로그인 직후 확인할 수 있습니다."
                            color="text-rose-500"
                            bg="bg-rose-50 dark:bg-rose-900/20"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} PartTime System. All rights reserved.
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, color, bg }: { icon: string; title: string; description: string; color: string; bg: string }) {
    return (
        <div className="bg-white dark:bg-[#1e2936] p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${bg}`}>
                <span className={`material-symbols-outlined text-3xl ${color}`}>{icon}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                {description}
            </p>
        </div>
    );
}
