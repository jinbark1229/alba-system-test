// src/pages/AdminExportPage.tsx
import { useState } from "react";
import { MainLayout } from "../components/layout";
import { exportLogsZip } from "../services/api";

export default function AdminExportPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!startDate || !endDate) {
            alert("시작일과 종료일을 선택해주세요.");
            return;
        }
        setIsExporting(true);
        try {
            const blob = await exportLogsZip(startDate, endDate);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `근무일지_${startDate}_${endDate}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            alert("내보내기 중 오류가 발생했습니다.");
            console.error(error);
        } finally {
            setIsExporting(false);
        }
    };

    const setQuickRange = (type: "today" | "thisMonth" | "lastMonth") => {
        const now = new Date();
        let start: Date, end: Date;

        if (type === "today") {
            start = end = now;
        } else if (type === "thisMonth") {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
        }

        setStartDate(start.toISOString().slice(0, 10));
        setEndDate(end.toISOString().slice(0, 10));
    };

    return (
        <MainLayout
            title="데이터 내보내기"
            description="직원들의 근무 기록과 급여 내역을 선택한 기간에 맞춰 CSV 파일로 다운로드합니다."
            breadcrumbs={[
                { label: "홈", path: "/" },
                { label: "설정", path: "/admin/export" },
                { label: "데이터 내보내기" },
            ]}
        >
            {/* Main Action Card */}
            <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Date Picker Section */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">date_range</span>
                            기간 선택
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setQuickRange("today")}
                                className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                오늘
                            </button>
                            <button
                                onClick={() => setQuickRange("thisMonth")}
                                className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                이번 달
                            </button>
                            <button
                                onClick={() => setQuickRange("lastMonth")}
                                className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                                지난 달
                            </button>
                        </div>
                    </div>

                    {/* Date Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">시작일</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2936] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">종료일</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2936] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats & Action */}
                <div className="p-6 bg-slate-50 dark:bg-[#1a2632]">
                    {/* Stats Grid */}
                    {startDate && endDate && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="flex flex-col gap-1 p-5 rounded-lg bg-white dark:bg-[#1e2936] border border-slate-200 dark:border-slate-700 shadow-sm">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">선택 기간</p>
                                <p className="text-slate-900 dark:text-white text-lg font-bold">
                                    {startDate.replace(/-/g, ".")} - {endDate.replace(/-/g, ".").slice(5)}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1 p-5 rounded-lg bg-white dark:bg-[#1e2936] border border-slate-200 dark:border-slate-700 shadow-sm">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">총 일수</p>
                                <div className="flex items-end gap-2">
                                    <p className="text-slate-900 dark:text-white text-2xl font-bold leading-none">
                                        {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                                    </p>
                                    <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">일</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Area */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col gap-1.5 max-w-md">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-sm font-medium">
                                <span className="material-symbols-outlined text-amber-500" style={{ fontSize: "20px" }}>info</span>
                                <span>주의사항</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                다운로드된 파일은 암호화되지 않았습니다. 개인정보가 포함되어 있으니 파일 관리에 유의해 주세요.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={handleExport}
                                disabled={isExporting || !startDate || !endDate}
                                className="flex-1 sm:flex-none h-[48px] bg-primary hover:bg-blue-600 disabled:bg-slate-400 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">download</span>
                                <span>{isExporting ? "내보내는 중..." : "ZIP 내보내기"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">바로가기</h3>
                <div className="flex flex-wrap gap-3">
                    <a
                        href="/schedule"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>calendar_month</span>
                        시간표 보기
                    </a>
                    <a
                        href="/notices"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>campaign</span>
                        공지사항
                    </a>
                    <a
                        href="/admin/allowed-names"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>person_add</span>
                        허용 이름 관리
                    </a>
                </div>
            </div>
        </MainLayout>
    );
}
