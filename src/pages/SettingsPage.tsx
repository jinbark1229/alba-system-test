// src/pages/SettingsPage.tsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { MainLayout } from "../components/layout";

export default function SettingsPage() {
    const { user, changePassword } = useAuth();
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPwd !== confirmPwd) {
            setMessage({ type: "error", text: "새 비밀번호가 일치하지 않습니다." });
            return;
        }

        setIsLoading(true);
        try {
            const result = await changePassword(currentPwd, newPwd);
            setMessage({
                type: result.success ? "success" : "error",
                text: result.message
            });

            if (result.success) {
                setCurrentPwd("");
                setNewPwd("");
                setConfirmPwd("");
            }
        } catch {
            setMessage({ type: "error", text: "오류가 발생했습니다." });
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleText = () => {
        switch (user?.role) {
            case "boss": return "사장님";
            case "manager": return "매니저";
            case "worker": return "알바생";
            case "admin": return "관리자";
            default: return "";
        }
    };

    const getStoreText = () => {
        switch (user?.storeId) {
            case "store1": return "연산점";
            case "store2": return "부전점";
            case "both": return "둘 다";
            default: return "미지정";
        }
    };

    return (
        <MainLayout
            title="설정"
            description="계정 설정을 관리합니다."
            breadcrumbs={[
                { label: "홈", path: "/" },
                { label: "설정" },
            ]}
        >
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Profile Info */}
                <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span>
                        내 정보
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400">이름</span>
                            <span className="font-bold text-slate-900 dark:text-white">{user?.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                            <span className="text-slate-500 dark:text-slate-400">역할</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.role === "boss" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" :
                                    user?.role === "manager" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                }`}>
                                {getRoleText()}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-slate-500 dark:text-slate-400">소속 매장</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{getStoreText()}</span>
                        </div>
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-500">lock</span>
                        비밀번호 변경
                    </h2>

                    {message && (
                        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === "success"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            }`}>
                            {message.type === "success" ? "✓ " : "✗ "}{message.text}
                        </div>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">현재 비밀번호</label>
                            <input
                                type="password"
                                value={currentPwd}
                                onChange={(e) => setCurrentPwd(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                placeholder="현재 비밀번호 입력"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">새 비밀번호</label>
                            <input
                                type="password"
                                value={newPwd}
                                onChange={(e) => setNewPwd(e.target.value)}
                                required
                                minLength={4}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                placeholder="새 비밀번호 (4자리 이상)"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">새 비밀번호 확인</label>
                            <input
                                type="password"
                                value={confirmPwd}
                                onChange={(e) => setConfirmPwd(e.target.value)}
                                required
                                minLength={4}
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                placeholder="새 비밀번호 다시 입력"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isLoading ? "변경 중..." : "비밀번호 변경"}
                        </button>
                    </form>
                </div>
            </div>
        </MainLayout>
    );
}
