// src/pages/AllowedNamesManagement.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type AllowedName } from "../context/AuthContext";
import { MainLayout } from "../components/layout";

export default function AllowedNamesManagement() {
    const { user, addAllowedName, removeAllowedName, getAllowedNames, listUsers, regenerateCode } = useAuth();
    const navigate = useNavigate();

    const [newName, setNewName] = useState("");
    const [newRole, setNewRole] = useState<"worker" | "manager" | "boss">("worker");
    const [newStoreId, setNewStoreId] = useState<"store1" | "store2" | "both">("store1");

    // Guard: only boss can access (직원 역할 부여는 사장님만 가능)
    if (!user || user.role !== "boss") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">접근 권한이 없습니다.</h2>
                <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    홈으로 돌아가기
                </button>
            </div>
        );
    }

    const allowedNames = getAllowedNames();
    const registeredUsers = listUsers();

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) {
            alert("이름을 입력해주세요.");
            return;
        }

        const result = await addAllowedName(newName.trim(), newRole, newStoreId);
        if (result.success) {
            alert(`"${newName}" 등록 완료!\n\n개인 인증코드: ${result.code}\n\n이 코드를 해당 직원에게 전달해주세요.`);
            setNewName("");
            setNewRole("worker");
            setNewStoreId("store1");
        } else {
            alert("이미 등록된 이름입니다.");
        }
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        alert("인증코드가 클립보드에 복사되었습니다!");
    };

    const handleRegenerateCode = (name: string) => {
        if (window.confirm(`"${name}"님의 인증코드를 재발급하시겠습니까?\n\n⚠️ 기존 코드는 더 이상 사용할 수 없게 됩니다.`)) {
            const newCode = regenerateCode(name);
            if (newCode) {
                alert(`새 인증코드: ${newCode}\n\n이 코드를 해당 직원에게 전달해주세요.`);
            }
        }
    };

    const handleRemove = (name: string) => {
        const isRegistered = registeredUsers.some(u => u.name === name);
        const message = isRegistered
            ? `"${name}"을(를) 화이트리스트에서 제거하시겠습니까?\n\n⚠️ 이 사용자는 이미 가입되어 있습니다.\n제거하면 더 이상 로그인할 수 없습니다.\n(근무 일지 데이터는 보존됩니다)`
            : `"${name}"을(를) 화이트리스트에서 제거하시겠습니까?`;

        if (window.confirm(message)) {
            removeAllowedName(name);
            alert(`"${name}"이(가) 제거되었습니다.`);
        }
    };

    const isUserRegistered = (name: string) => {
        return registeredUsers.some(u => u.name === name);
    };

    return (
        <MainLayout
            title="허용 이름 관리"
            description="회원가입 가능한 직원 명단을 관리합니다. 등록된 이름만 가입할 수 있습니다."
            breadcrumbs={[
                { label: "홈", path: "/" },
                { label: "관리", path: "/admin/export" },
                { label: "허용 이름 관리" },
            ]}
        >
            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary p-4 rounded-r-lg">
                <h3 className="text-primary font-bold mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>info</span>
                    개인 인증코드 시스템
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                    각 직원에게 <b>고유한 인증코드</b>가 발급됩니다.<br />
                    직원은 본인의 인증코드로만 회원가입이 가능합니다. (외부인 무단 가입 방지)
                </p>
            </div>

            {/* Add Name Form */}
            <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">새 이름 등록</h2>
                <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px] flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">이름</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="홍길동"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2936] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                        />
                    </div>
                    <div className="w-[120px] flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">역할</label>
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as "worker" | "manager" | "boss")}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2936] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="worker">알바생</option>
                            <option value="manager">매니저</option>
                            <option value="boss">사장님</option>
                        </select>
                    </div>
                    <div className="w-[120px] flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">소속 매장</label>
                        <select
                            value={newStoreId}
                            onChange={(e) => setNewStoreId(e.target.value as "store1" | "store2" | "both")}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2936] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="store1">연산점</option>
                            <option value="store2">부전점</option>
                            <option value="both">둘 다</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 h-[42px] bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        등록
                    </button>
                </form>
            </div>

            {/* Allowed Names List */}
            <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        등록된 이름 목록
                        <span className="ml-2 text-sm font-normal text-slate-500 dark:text-slate-400">({allowedNames.length}명)</span>
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                                <th className="py-4 px-6 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">이름</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">역할</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">매장</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">인증코드</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">가입 상태</th>
                                <th className="py-4 px-6 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {allowedNames.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                                        등록된 이름이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                allowedNames.map((item: AllowedName) => (
                                    <tr key={item.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="py-4 px-6 text-sm font-bold text-slate-900 dark:text-white">{item.name}</td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.role === "boss"
                                                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                                    : item.role === "manager"
                                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                    }`}
                                            >
                                                {item.role === "worker" ? "알바생" : item.role === "manager" ? "매니저" : "사장님"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.storeId === "store1"
                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                                : item.storeId === "store2"
                                                    ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                                                    : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                                                }`}>
                                                {item.storeId === "store1" ? "연산점" : item.storeId === "store2" ? "부전점" : "둘 다"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {item.registrationCode}
                                                </code>
                                                <button
                                                    onClick={() => handleCopyCode(item.registrationCode)}
                                                    className="p-1 text-slate-400 hover:text-primary transition-colors"
                                                    title="복사"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>content_copy</span>
                                                </button>
                                                <button
                                                    onClick={() => handleRegenerateCode(item.name)}
                                                    className="p-1 text-slate-400 hover:text-orange-500 transition-colors"
                                                    title="재발급"
                                                >
                                                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>refresh</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {isUserRegistered(item.name) ? (
                                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    가입완료
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 dark:text-slate-500">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                    미가입
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleRemove(item.name)}
                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium hover:underline transition-colors"
                                            >
                                                제거
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    );
}
