// src/components/ScheduleCalendar.tsx
import { useState, useEffect } from "react";
import { getSchedules, type Schedule } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ScheduleCalendar() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentStore, setCurrentStore] = useState<'store1' | 'store2'>('store1');
    const [logs, setLogs] = useState<Schedule[]>([]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const isBossOrAdmin = user?.role === 'boss' || user?.role === 'admin';

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!user) return;
            try {
                const schedules = await getSchedules(user.name);
                console.log("Fetched schedules:", schedules);
                setLogs(schedules);
            } catch (error) {
                console.error("Failed to fetch schedules", error);
            }
        };
        fetchSchedules();
    }, [year, month, user]);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const renderDays = () => {
        const days = [];

        // Empty cells for days before start of month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="min-h-[130px] border-b border-r border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"></div>);
        }

        // Days of the month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayLogs = logs.filter(log => {
                const dateMatches = log.date === dateStr;
                const storeMatches = !log.storeId || log.storeId === currentStore;
                // Workers only see their own schedules
                const userMatches = isBossOrAdmin || log.name === user?.name;
                return dateMatches && storeMatches && userMatches;
            });
            dayLogs.sort((a: Schedule, b: Schedule) => a.start.localeCompare(b.start));

            days.push(
                <div key={d} className={`min-h-[130px] border-b border-r border-slate-100 dark:border-slate-700 p-1.5 relative group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${dayLogs.length > 0 ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-1 ${new Date().toDateString() === new Date(year, month, d).toDateString()
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-600 dark:text-slate-400"
                        }`}>{d}</div>

                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] custom-scrollbar">
                        {dayLogs.map((log: Schedule, idx: number) => (
                            <div
                                key={idx}
                                className="text-xs bg-white dark:bg-[#1a2632] border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-1 rounded shadow-sm"
                                title={`${log.name}: ${log.start}~${log.end}`}
                            >
                                {isBossOrAdmin && <div className="font-bold text-blue-800 dark:text-blue-200">{log.name}</div>}
                                <div className="text-blue-600 dark:text-blue-300">{log.start}~{log.end}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    return (
        <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Store Toggle */}
            <div className="flex justify-center p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <div className="bg-white dark:bg-[#1e2936] p-1 rounded-xl inline-flex shadow-sm border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setCurrentStore('store1')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${currentStore === 'store1'
                            ? "bg-primary text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                    >
                        <span className="material-symbols-outlined text-base">storefront</span>
                        연산점
                    </button>
                    <button
                        onClick={() => setCurrentStore('store2')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${currentStore === 'store2'
                            ? "bg-primary text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                    >
                        <span className="material-symbols-outlined text-base">store</span>
                        부전점
                    </button>
                </div>
            </div>

            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">chevron_left</span>
                </button>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {year}년 {month + 1}월
                </h3>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">chevron_right</span>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                    <div key={day} className={`p-2 text-center text-sm font-bold border-b border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-700 dark:text-slate-300'}`}>
                        {day}
                    </div>
                ))}
                {renderDays()}
            </div>
        </div>
    );
}
