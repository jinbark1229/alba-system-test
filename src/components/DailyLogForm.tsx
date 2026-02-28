// src/components/DailyLogForm.tsx
import { useState } from "react";
import { createLog } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface LogPayload {
    date: string;
    start: string;
    end: string;
    break: boolean;
    userName?: string;
    breakDuration?: number;
    note?: string;
}

// Generate time options (30 min intervals)
const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            options.push(time);
        }
    }
    return options;
};

const TIME_OPTIONS = generateTimeOptions();

// Quick time presets for common work hours
const QUICK_START_TIMES = ["08:00", "08:30", "09:00", "13:00", "14:00", "15:00", "18:00", "20:00"];
const QUICK_END_TIMES = ["14:00", "15:00", "17:00", "18:00", "20:00", "21:00", "22:00", "23:00"];

type InputMode = "dropdown" | "buttons" | "picker";

export default function DailyLogForm() {
    const [date, setDate] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [breakFlag, setBreakFlag] = useState(false);
    const [breakDuration, setBreakDuration] = useState("60");
    const [note, setNote] = useState("");
    const [inputMode, setInputMode] = useState<InputMode>("dropdown");
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: LogPayload = { date, start, end, break: breakFlag, userName: user?.name, note: note || undefined };
        if (breakFlag) {
            payload.breakDuration = Number(breakDuration);
        }

        try {
            await createLog(payload);
            alert("일지가 저장되었습니다.");
            setDate("");
            setStart("");
            setEnd("");
            setBreakFlag(false);
            setBreakDuration("60");
            setNote("");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    // Render time input based on selected mode
    const renderTimeInput = (
        label: string,
        value: string,
        setValue: (v: string) => void,
        quickOptions: string[]
    ) => {
        return (
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>

                {inputMode === "dropdown" && (
                    <select
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    >
                        <option value="">선택하세요</option>
                        {TIME_OPTIONS.map((time) => (
                            <option key={time} value={time}>
                                {time}
                            </option>
                        ))}
                    </select>
                )}

                {inputMode === "buttons" && (
                    <div className="flex flex-wrap gap-2">
                        {quickOptions.map((time) => (
                            <button
                                key={time}
                                type="button"
                                onClick={() => setValue(time)}
                                className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${value === time
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                        {/* Custom input for buttons mode */}
                        <input
                            type="time"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white"
                            placeholder="직접 입력"
                        />
                    </div>
                )}

                {inputMode === "picker" && (
                    <input
                        type="time"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                )}
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500">edit_note</span>
                근무 기록하기
            </h2>

            {/* Input Mode Selector */}
            <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">시간 입력 방식</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setInputMode("dropdown")}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${inputMode === "dropdown"
                            ? "bg-white dark:bg-[#1e2936] text-primary shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
                        드롭다운
                    </button>
                    <button
                        type="button"
                        onClick={() => setInputMode("buttons")}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${inputMode === "buttons"
                            ? "bg-white dark:bg-[#1e2936] text-primary shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">grid_view</span>
                        버튼
                    </button>
                    <button
                        type="button"
                        onClick={() => setInputMode("picker")}
                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 ${inputMode === "picker"
                            ? "bg-white dark:bg-[#1e2936] text-primary shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        시계
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">날짜</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {renderTimeInput("시작 시간", start, setStart, QUICK_START_TIMES)}
                    {renderTimeInput("종료 시간", end, setEnd, QUICK_END_TIMES)}
                </div>

                <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">휴게 시간</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setBreakFlag(true)}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${breakFlag
                                ? "bg-white dark:bg-[#1e2936] text-primary shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                        >
                            있음
                        </button>
                        <button
                            type="button"
                            onClick={() => setBreakFlag(false)}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!breakFlag
                                ? "bg-white dark:bg-[#1e2936] text-primary shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                        >
                            없음
                        </button>
                    </div>
                </div>

                {breakFlag && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                            휴게 시간 (분)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={breakDuration}
                                onChange={(e) => setBreakDuration(e.target.value)}
                                required
                                min="0"
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">분</span>
                        </div>
                    </div>
                )}

                {/* 특이사항 입력 */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500 text-lg">note_alt</span>
                        특이사항 (선택)
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="지각, 조퇴, 시간 변경 등 특이사항을 입력하세요"
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-slate-400">예: 지각 10분, 조퇴 (병원), 시간 변경 요청 등</p>
                </div>

                <button
                    type="submit"
                    className="mt-2 w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] transition-all"
                >
                    저장하기
                </button>
            </form>
        </div>
    );
}
