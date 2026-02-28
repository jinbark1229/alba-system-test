// src/components/ScheduleTableView.tsx
import { useState, useEffect, useMemo } from "react";
import { getSchedules, type Schedule } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ScheduleTableView() {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [currentStore, setCurrentStore] = useState<'store1' | 'store2'>('store1');
    const [weekOffset, setWeekOffset] = useState(0);

    const isBossOrAdmin = user?.role === 'boss' || user?.role === 'admin';

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!user) return;
            try {
                const data = await getSchedules(user.name);
                setSchedules(data);
            } catch (error) {
                console.error("Failed to fetch schedules", error);
            }
        };
        fetchSchedules();
    }, [user]);

    // Get week dates
    const weekDates = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayOfWeek + 1 + (weekOffset * 7));

        const dates: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(d);
        }
        return dates;
    }, [weekOffset]);

    // Get unique employee names from schedules
    const employees = useMemo(() => {
        const storeSchedules = schedules.filter(s => !s.storeId || s.storeId === currentStore);
        const names = [...new Set(storeSchedules.map(s => s.name))];

        // If not boss, only show current user
        if (!isBossOrAdmin && user) {
            return [user.name];
        }
        return names.sort();
    }, [schedules, currentStore, isBossOrAdmin, user]);

    // Format date for comparison
    const formatDate = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // Get schedule for employee on specific date
    const getEmployeeSchedule = (employeeName: string, date: Date) => {
        const dateStr = formatDate(date);
        return schedules.find(s =>
            s.name === employeeName &&
            s.date === dateStr &&
            (!s.storeId || s.storeId === currentStore)
        );
    };

    // Format time display (09:00 -> 9)
    const formatTime = (time: string) => {
        const [hour, min] = time.split(':').map(Number);
        if (min === 0) return hour.toString();
        if (min === 30) return `${hour}.5`;
        return `${hour}:${min}`;
    };

    const getDayLabel = (date: Date) => {
        return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Store Toggle */}
            <div className="flex justify-center">
                <div className="bg-white dark:bg-[#1e2936] p-1 rounded-xl inline-flex shadow-sm border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setCurrentStore('store1')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${currentStore === 'store1'
                            ? "bg-primary text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-primary"
                            }`}
                    >
                        연산점
                    </button>
                    <button
                        onClick={() => setCurrentStore('store2')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${currentStore === 'store2'
                            ? "bg-primary text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-primary"
                            }`}
                    >
                        부전점
                    </button>
                </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setWeekOffset(prev => prev - 1)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">chevron_left</span>
                </button>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {getDayLabel(weekDates[0])} ~ {getDayLabel(weekDates[6])}
                </h3>
                <button
                    onClick={() => setWeekOffset(prev => prev + 1)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                    <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">chevron_right</span>
                </button>
            </div>

            {/* Today Button */}
            {weekOffset !== 0 && (
                <button
                    onClick={() => setWeekOffset(0)}
                    className="text-sm text-primary font-medium text-center"
                >
                    이번 주로
                </button>
            )}

            {/* Schedule Table */}
            <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full min-w-[600px] border-collapse text-sm">
                    <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800">
                            <th className="border border-slate-300 dark:border-slate-600 p-2 text-left font-bold text-slate-700 dark:text-slate-300 sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 w-20">
                                이름
                            </th>
                            {weekDates.map((date, i) => {
                                const isToday = formatDate(date) === formatDate(new Date());
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                return (
                                    <th
                                        key={i}
                                        className={`border border-slate-300 dark:border-slate-600 p-2 text-center font-bold ${isToday ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                            isWeekend ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        <div className="text-[10px]">{date.getMonth() + 1}/{date.getDate()}</div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="border border-slate-300 dark:border-slate-600 p-8 text-center text-slate-400">
                                    이번 주 시간표가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            employees.map((employee) => (
                                <tr key={employee} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="border border-slate-300 dark:border-slate-600 p-2 font-bold text-slate-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-[#1e2936] z-10">
                                        {employee}
                                    </td>
                                    {weekDates.map((date, i) => {
                                        const schedule = getEmployeeSchedule(employee, date);
                                        const isToday = formatDate(date) === formatDate(new Date());
                                        return (
                                            <td
                                                key={i}
                                                className={`border border-slate-300 dark:border-slate-600 p-1.5 text-center ${isToday ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                                                    }`}
                                            >
                                                {schedule ? (
                                                    <span className="text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap text-xs">
                                                        {formatTime(schedule.start)}~{formatTime(schedule.end)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-600">-</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
