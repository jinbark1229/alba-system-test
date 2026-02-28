// src/pages/SchedulePage.tsx
import { useState } from "react";
import ScheduleCalendar from "../components/ScheduleCalendar";
import ScheduleTableView from "../components/ScheduleTableView";
import ScheduleComments from "../components/ScheduleComments";
import ScheduleUpload from "../components/ScheduleUpload";
import { MainLayout } from "../components/layout";
import { useAuth } from "../context/AuthContext";

export default function SchedulePage() {
    const { user } = useAuth();
    const isBossOrAdmin = user?.role === 'boss' || user?.role === 'admin';
    const [viewMode, setViewMode] = useState<'calendar' | 'table'>('table');

    return (
        <MainLayout
            title="근무 시간표"
            description="전체 근무 일정을 확인하고 관리합니다."
            breadcrumbs={[
                { label: "홈", path: "/" },
                { label: "시간표" },
            ]}
        >
            {/* View Mode Toggle */}
            <div className="flex justify-end mb-4">
                <div className="bg-white dark:bg-[#1e2936] p-1 rounded-lg inline-flex shadow-sm border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${viewMode === 'table'
                            ? "bg-primary text-white"
                            : "text-slate-500 hover:text-primary"
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">table_chart</span>
                        표
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${viewMode === 'calendar'
                            ? "bg-primary text-white"
                            : "text-slate-500 hover:text-primary"
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        달력
                    </button>
                </div>
            </div>

            {/* Schedule View */}
            <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 md:p-6 mb-8 overflow-hidden">
                {viewMode === 'table' ? (
                    <ScheduleTableView />
                ) : (
                    <ScheduleCalendar />
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Admin Upload Section - Only visible to boss/admin */}
                {isBossOrAdmin && (
                    <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">upload_file</span>
                            시간표 업로드
                        </h2>
                        <ScheduleUpload />
                    </div>
                )}

                {/* Comments */}
                <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <ScheduleComments storeId="store1" />
                </div>
            </div>
        </MainLayout>
    );
}
