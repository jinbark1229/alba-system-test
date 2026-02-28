// src/components/LogList.tsx
import { useEffect, useState } from "react";
import { getLogs, type WorkLog } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LogList() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<WorkLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            if (!user) return;
            try {
                const data = await getLogs(user.name);
                setLogs(data);
            } catch (e) {
                console.error("Failed to fetch logs", e);
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, [user]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <span className="material-symbols-outlined animate-spin text-3xl mb-2">progress_activity</span>
                <p className="text-sm">데이터를 불러오는 중...</p>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                <p className="text-sm font-medium">아직 작성된 일지가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">날짜</th>
                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">시작 시간</th>
                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">종료 시간</th>
                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap text-center">휴게 여부</th>
                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap text-right">휴게 시간</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4 text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                {log.date}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {log.start}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                {log.end}
                            </td>
                            <td className="py-3 px-4 text-center">
                                {log.break ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </span>
                                )}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400 text-right whitespace-nowrap">
                                {log.break ? `${log.breakDuration}분` : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
