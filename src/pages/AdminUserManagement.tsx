// src/pages/AdminUserManagement.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MainLayout } from "../components/layout";

export default function AdminUserManagement() {
    const { user, addUser, removeUser, listUsers } = useAuth();
    const navigate = useNavigate();

    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState<"worker" | "boss" | "admin">("worker");

    if (!user || user.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col bg-background-light dark:bg-background-dark p-4">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">lock</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">접근 권한이 없습니다.</h2>
                <button
                    onClick={() => navigate("/")}
                    className="bg-primary text-white font-bold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                    홈으로 돌아가기
                </button>
            </div>
        );
    }

    const users = listUsers();

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newName || !newPassword) {
            alert("이름과 비밀번호는 필수입니다.");
            return;
        }

        if (users.some(u => u.name === newName)) {
            alert("이미 존재하는 이름입니다.");
            return;
        }
        if (newEmail && users.some(u => u.email === newEmail)) {
            alert("이미 존재하는 이메일입니다.");
            return;
        }

        addUser({
            name: newName,
            email: newEmail || undefined,
            password: newPassword,
            role: newRole,
            token: "generated-by-admin-" + Date.now()
        });

        alert("사용자가 추가되었습니다.");
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("worker");
    };

    const handleDeleteUser = (userId: string, userName: string) => {
        if (window.confirm(`${userName} 사용자를 삭제하시겠습니까?`)) {
            removeUser(userId);
        }
    };

    return (
        <MainLayout
            title="사용자 관리"
            description="시스템 사용자를 추가하고 권한을 관리합니다."
            breadcrumbs={[
                { label: "홈", path: "/" },
                { label: "사용자 관리" },
            ]}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Add User Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">person_add</span>
                            새 사용자 추가
                        </h2>

                        <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">이름 (필수)</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="홍길동"
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">비밀번호 (필수)</label>
                                <input
                                    type="text"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="초기 비밀번호"
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">이메일 (선택)</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">역할</label>
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as "worker" | "boss" | "admin")}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                >
                                    <option value="worker">알바생</option>
                                    <option value="boss">사장님</option>
                                    <option value="admin">관리자</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="mt-4 w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
                            >
                                사용자 추가
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: User List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500">group</span>
                            등록된 사용자 목록 ({users.length}명)
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">이름</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">역할</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap">이메일</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                                                등록된 사용자가 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="py-4 px-4 text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                    {u.name}
                                                    {u.id === user?.id && <span className="ml-2 text-xs font-normal text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">나</span>}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === "admin"
                                                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                                                            : u.role === "boss"
                                                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400"
                                                        }`}>
                                                        {u.role === "admin" ? "관리자" : u.role === "boss" ? "사장님" : "알바생"}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    {u.email || "-"}
                                                </td>
                                                <td className="py-4 px-4 text-right whitespace-nowrap">
                                                    {u.id !== user?.id && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id, u.name)}
                                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all"
                                                            title="삭제"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
