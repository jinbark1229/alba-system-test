// src/components/LogList.tsx
import { useEffect, useState } from "react";
import { getLogs, deleteLog, type WorkLog } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LogList() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<WorkLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        if (!user) return;
        try {
            const data = await getLogs(user.name);
            setLogs(data);
        } catch (e) {
            console.error("Failed to fetch logs", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleDelete = async (logId: string) => {
        if (!window.confirm("이 근무 일지를 삭제하시겠습니까?")) return;
        try {
            await deleteLog(logId);
            await fetchLogs();
        } catch (e) {
            console.error("Failed to delete log", e);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

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
                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">시작</th>
                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">종료</th>
                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap text-center">휴게</th>
                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">특이사항</th>
                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap text-right">관리</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
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
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                        <span className="material-symbols-outlined text-xs">check</span>
                                        {log.breakDuration}분
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                                        <span className="material-symbols-outlined text-sm">remove</span>
                                    </span>
                                )}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 max-w-[150px] truncate">
                                {log.note || "-"}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <button
                                    onClick={() => handleDelete(log.id)}
                                    className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="삭제"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
