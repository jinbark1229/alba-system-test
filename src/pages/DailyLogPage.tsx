// src/pages/DailyLogPage.tsx
import DailyLogForm from "../components/DailyLogForm.tsx";
import LogList from "../components/LogList.tsx";
import { MainLayout } from "../components/layout";

export default function DailyLogPage() {
    return (
        <MainLayout
            title="근무 일지"
            description="매일의 근무 내용을 기록하고 관리합니다."
            breadcrumbs={[
                { label: "홈", path: "/" },
                { label: "근무 일지" },
            ]}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-1">
                    <DailyLogForm />
                </div>

                {/* Right Column: List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">history</span>
                                최근 근무 내역
                            </h2>
                        </div>
                        <LogList />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
