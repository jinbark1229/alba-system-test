// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login, listUsers, isNameAllowed } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Get users from context (loaded from Supabase)
        const existingUsers = listUsers();
        const foundUser = existingUsers.find((u) =>
            u.email === identifier || u.name === identifier
        );

        if (foundUser) {
            // Boss and admin can always log in
            const isBossOrAdmin = foundUser.role === "boss" || foundUser.role === "admin";
            if (!isBossOrAdmin && !isNameAllowed(foundUser.name)) {
                alert("더 이상 로그인 권한이 없습니다.\n사장님에게 문의하세요.");
                return;
            }

            if (foundUser.password && foundUser.password !== password) {
                alert("비밀번호가 일치하지 않습니다.");
                return;
            }

            login(foundUser);
            navigate("/");
        } else {
            alert("사용자를 찾을 수 없습니다.");
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
            <div className="absolute top-6 left-6 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-slate-500 hover:text-primary transition-colors text-sm font-medium"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    뒤로
                </button>
                <Link
                    to="/"
                    className="flex items-center gap-1 text-slate-500 hover:text-primary transition-colors text-sm font-medium"
                >
                    <span className="material-symbols-outlined text-lg">home</span>
                    홈
                </Link>
            </div>

            <div className="bg-white dark:bg-[#1e2936] w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">로그인</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        알바시스템에 오신 것을 환영합니다.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            이름 (또는 이메일)
                        </label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="홍길동 또는 email@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all text-lg"
                    >
                        로그인
                    </button>
                </form>

                <div className="my-8 flex items-center gap-4">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                    <span className="text-xs font-medium text-slate-400">또는</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                </div>

                <div className="text-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">계정이 없으신가요? </span>
                    <Link
                        to="/register"
                        className="text-primary font-bold hover:underline ml-1 text-sm"
                    >
                        회원가입
                    </Link>
                </div>
            </div>
        </div>
    );
}
