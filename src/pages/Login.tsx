// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    verifyPassword,
    checkLoginAllowed,
    recordLoginFailure,
    recordLoginSuccess,
    sanitize,
} from "../utils/security";

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [lockMsg, setLockMsg] = useState("");
    const navigate = useNavigate();
    const { login, listUsers, isNameAllowed } = useAuth();

    // 잠금 상태 타이머 업데이트
    useEffect(() => {
        if (!lockMsg) return;
        const timer = setInterval(() => {
            const cleanId = sanitize(identifier.trim());
            const status = checkLoginAllowed(cleanId);
            if (status.allowed) {
                setLockMsg("");
                clearInterval(timer);
            } else {
                const mins = Math.ceil(status.remainingMs / 60000);
                setLockMsg(`계정이 잠겼습니다. ${mins}분 후 다시 시도하세요.`);
            }
        }, 10000);
        return () => clearInterval(timer);
    }, [lockMsg, identifier]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setLockMsg("");

        const cleanId = sanitize(identifier.trim());
        if (!cleanId) {
            setErrorMsg("이름 또는 이메일을 입력해주세요.");
            return;
        }

        // 브루트포스 방지: 로그인 허용 여부 확인
        const loginStatus = checkLoginAllowed(cleanId);
        if (!loginStatus.allowed) {
            const mins = Math.ceil(loginStatus.remainingMs / 60000);
            setLockMsg(`계정이 잠겼습니다. ${mins}분 후 다시 시도하세요.`);
            return;
        }

        setIsLoading(true);
        try {
            const existingUsers = listUsers();
            const foundUser = existingUsers.find((u) =>
                u.email === cleanId || u.name === cleanId
            );

            if (!foundUser) {
                // 사용자 없음 → 실패 기록 (사용자 존재 여부를 노출하지 않음)
                const result = recordLoginFailure(cleanId);
                if (result.locked) {
                    setLockMsg("로그인 시도가 너무 많습니다. 15분 후 다시 시도하세요.");
                } else {
                    setErrorMsg(`아이디 또는 비밀번호가 올바르지 않습니다. (남은 시도: ${result.attemptsLeft}회)`);
                }
                return;
            }

            // 허용된 이름인지 확인 (boss/admin 제외)
            const isBossOrAdmin = foundUser.role === "boss" || foundUser.role === "admin";
            if (!isBossOrAdmin && !isNameAllowed(foundUser.name)) {
                setErrorMsg("로그인 권한이 없습니다. 사장님에게 문의하세요.");
                return;
            }

            // 비밀번호 검증 (bcrypt 해시 지원)
            const pwdValid = foundUser.password
                ? await verifyPassword(password, foundUser.password)
                : password === "";

            if (!pwdValid) {
                const result = recordLoginFailure(cleanId);
                if (result.locked) {
                    setLockMsg("로그인 시도가 너무 많습니다. 15분 후 다시 시도하세요.");
                } else {
                    setErrorMsg(`아이디 또는 비밀번호가 올바르지 않습니다. (남은 시도: ${result.attemptsLeft}회)`);
                }
                return;
            }

            // 로그인 성공
            recordLoginSuccess(cleanId);
            login(foundUser);
            navigate("/");
        } finally {
            setIsLoading(false);
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

                {/* 잠금 경고 */}
                {lockMsg && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                        <span className="material-symbols-outlined text-lg">lock</span>
                        {lockMsg}
                    </div>
                )}

                {/* 에러 메시지 */}
                {errorMsg && !lockMsg && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
                        <span className="material-symbols-outlined text-lg">warning</span>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            이름 (또는 이메일)
                        </label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => { setIdentifier(e.target.value); setErrorMsg(""); }}
                            placeholder="홍길동 또는 email@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            required
                            disabled={isLoading || !!lockMsg}
                            autoComplete="username"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
                            placeholder="********"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            required
                            disabled={isLoading || !!lockMsg}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !!lockMsg}
                        className="w-full bg-primary hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 disabled:transform-none transition-all text-lg flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                확인 중...
                            </>
                        ) : (
                            "로그인"
                        )}
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

                {/* 포트폴리오 안내 */}
                <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl text-xs text-blue-600 dark:text-blue-400">
                    <p className="font-bold mb-1">💡 포트폴리오 데모 계정</p>
                    <p>이름: <code className="font-mono">사장님</code> / 비밀번호: <code className="font-mono">password123</code></p>
                    <p className="mt-1 text-blue-400 dark:text-blue-500">또는 홈 화면에서 방문자 모드로 둘러보세요.</p>
                </div>
            </div>
        </div>
    );
}
