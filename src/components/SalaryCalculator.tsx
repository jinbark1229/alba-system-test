// src/components/SalaryCalculator.tsx
import { useState, useEffect, useMemo } from "react";
import { getLogs, type WorkLog } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { calculateDuration, formatCurrency } from "../utils/timeUtils";

export default function SalaryCalculator() {
    const { user } = useAuth();
    const [hourlyWage, setHourlyWage] = useState(9860);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [logs, setLogs] = useState<WorkLog[]>([]);

    const totalHours = useMemo(() => {
        let hours = 0;
        logs.forEach(log => {
            const duration = calculateDuration(
                log.start,
                log.end,
                log.break ? (log.breakDuration || 60) : 0
            );
            hours += duration;
        });
        return hours;
    }, [logs]);

    const totalSalary = useMemo(() => Math.floor(totalHours * hourlyWage), [totalHours, hourlyWage]);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!user) return;
            try {
                const allLogs = await getLogs(user.name);
                const filteredLogs = allLogs.filter((log: WorkLog) =>
                    log.date.startsWith(selectedMonth)
                );
                setLogs(filteredLogs);
            } catch (error) {
                console.error("Failed to fetch logs", error);
            }
        };
        fetchLogs();
    }, [selectedMonth, user]);

    return (
        <div className="flex flex-col gap-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500">payments</span>
                급여 계산
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">기준 월</label>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">시급 (원)</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={hourlyWage}
                            onChange={(e) => setHourlyWage(Number(e.target.value))}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">원</span>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/30">
                <p className="text-blue-100 font-medium mb-1">예상 급여 총액</p>
                <h3 className="text-4xl font-black mb-4 tracking-tight">
                    {formatCurrency(totalSalary)}
                </h3>
                <div className="flex items-center gap-4 text-sm text-blue-100 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                    <div className="flex flex-col">
                        <span className="opacity-70 text-xs">총 근무 시간</span>
                        <span className="font-bold text-lg">{totalHours.toFixed(1)}시간</span>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="flex flex-col">
                        <span className="opacity-70 text-xs">적용 시급</span>
                        <span className="font-bold text-lg">{formatCurrency(hourlyWage).replace('원', '')}</span>
                    </div>
                </div>
                <p className="mt-4 text-xs text-blue-200 opacity-80">
                    * 주휴수당 및 세금은 포함되지 않은 단순 계산 금액입니다.
                </p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">calendar_month</span>
                    {parseInt(selectedMonth.split('-')[1])}월 근무 상세 내역
                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-auto">총 {logs.length}건</span>
                </h3>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    {logs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                            해당 월의 근무 기록이 없습니다.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {logs.map((log, idx) => (
                                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white dark:hover:bg-[#1a2632] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                                            {log.date.split('-')[2]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{log.date}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {log.start} - {log.end}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {log.break && (
                                            <span className="text-xs px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                                                휴게 {log.breakDuration || 60}분
                                            </span>
                                        )}
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {calculateDuration(log.start, log.end, log.break ? log.breakDuration || 60 : 0).toFixed(1)} 시간
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
