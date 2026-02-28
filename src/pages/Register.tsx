// src/pages/Register.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [isCodeValid, setIsCodeValid] = useState<boolean | null>(null);
    const [isBossMode, setIsBossMode] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const navigate = useNavigate();
    const { login, validatePersonalCode, addUser, listUsers, validateRegistrationCode } = useAuth();

    // Auto-fill name when code is entered
    useEffect(() => {
        if (code.trim().length >= 6) {
            // Check if it's a boss code
            const isBoss = validateRegistrationCode("boss", code.trim());
            if (isBoss) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsBossMode(true);
                setIsCodeValid(true);
                setName(""); // Boss enters their own name
                return;
            }

            // Check personal code
            const entry = validatePersonalCode(code.trim());
            if (entry) {
                setIsCodeValid(true);
                setName(entry.name);
                setIsBossMode(false);
            } else {
                setIsCodeValid(false);
                setIsBossMode(false);
            }
        } else {
            setIsCodeValid(null);
            setIsBossMode(false);
        }
    }, [code, validatePersonalCode, validateRegistrationCode]);

    const handleVerifyEmail = () => {
        if (!email) {
            alert("이메일을 입력해주세요.");
            return;
        }
        alert(`인증 코드가 ${email}로 전송되었습니다. (모의 과정: 자동 인증됨)`);
        setIsEmailVerified(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isCodeValid) {
            alert("유효한 인증코드를 입력해주세요.");
            return;
        }

        let assignedRole: "worker" | "manager" | "boss";
        let assignedStoreId: "store1" | "store2" | "both";
        let finalName = name.trim();

        if (isBossMode) {
            if (!finalName) {
                alert("사장님 이름을 입력해주세요.");
                return;
            }
            assignedRole = "boss";
            assignedStoreId = "store1";
        } else {
            const allowedEntry = validatePersonalCode(code.trim());
            if (!allowedEntry) {
                alert("유효하지 않은 인증 코드입니다.");
                return;
            }
            assignedRole = allowedEntry.role;
            assignedStoreId = allowedEntry.storeId;
            finalName = allowedEntry.name;
        }

        const existingUsers = listUsers();

        // Check for duplicate Name
        if (existingUsers.some(u => u.name === finalName)) {
            alert("이미 가입된 이름입니다.");
            return;
        }

        // Check for duplicate Email (only if email is provided)
        if (email && existingUsers.some(u => u.email === email)) {
            alert("이미 가입된 이메일입니다. 다른 이메일을 사용해주세요.");
            return;
        }

        // Prepare new user object
        const newUserProfile = {
            name: finalName,
            role: assignedRole,
            storeId: assignedStoreId,
            token: "fake-jwt-token",
            email: email || undefined,
            password: password
        };

        const createdUser = await addUser(newUserProfile);
        login(createdUser);

        const roleText = assignedRole === "boss" ? "사장님" : assignedRole === "manager" ? "매니저" : "알바생";
        const storeText = assignedStoreId === 'store1' ? '연산점' : assignedStoreId === 'store2' ? '부전점' : '둘 다';
        alert(`${roleText} 권한으로 회원가입이 완료되었습니다!\n(소속: ${storeText})`);
        navigate(assignedRole === "boss" ? "/admin/export" : "/daily-log");
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
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">회원가입</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        사장님에게 받은 인증코드를 입력하세요
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* Step 1: Code Input (First!) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">1</span>
                            인증코드 입력
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="사장님에게 받은 코드를 입력하세요"
                                className={`w-full px-4 py-3 rounded-xl border ${isCodeValid === true
                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                    : isCodeValid === false
                                        ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2632]"
                                    } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-lg tracking-wider`}
                                required
                            />
                            {isCodeValid === true && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                                    <span className="material-symbols-outlined">check_circle</span>
                                </span>
                            )}
                            {isCodeValid === false && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
                                    <span className="material-symbols-outlined">error</span>
                                </span>
                            )}
                        </div>
                        {isCodeValid === false && (
                            <p className="text-xs text-red-500">유효하지 않은 코드입니다</p>
                        )}
                        {isBossMode && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                ✨ 사장님 코드가 확인되었습니다
                            </p>
                        )}
                    </div>

                    {/* Step 2: Name (Auto-filled or manual for boss) */}
                    {isCodeValid && (
                        <div className="flex flex-col gap-2 animate-fadeIn">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">2</span>
                                이름
                                {!isBossMode && (
                                    <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 ml-2">
                                        (자동 입력됨)
                                    </span>
                                )}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => isBossMode && setName(e.target.value)}
                                placeholder={isBossMode ? "사장님 이름을 입력하세요" : ""}
                                className={`w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 ${!isBossMode
                                    ? "bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                                    : "bg-slate-50 dark:bg-[#1a2632]"
                                    } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium`}
                                readOnly={!isBossMode}
                                required
                            />
                        </div>
                    )}

                    {/* Step 3: Password */}
                    {isCodeValid && (
                        <div className="flex flex-col gap-2 animate-fadeIn">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">3</span>
                                비밀번호 설정
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="사용할 비밀번호를 입력하세요"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                required
                            />
                        </div>
                    )}

                    {/* Optional: Email */}
                    {isCodeValid && (
                        <div className="flex flex-col gap-2 animate-fadeIn">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                이메일 (선택)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setIsEmailVerified(false);
                                    }}
                                    placeholder="example@email.com"
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                                {email && !isEmailVerified && (
                                    <button
                                        type="button"
                                        onClick={handleVerifyEmail}
                                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors whitespace-nowrap"
                                    >
                                        인증
                                    </button>
                                )}
                                {isEmailVerified && (
                                    <span className="flex items-center text-emerald-500 text-xl px-2">
                                        <span className="material-symbols-outlined">check_circle</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {isCodeValid && (
                        <button
                            type="submit"
                            className="mt-2 w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all text-lg animate-fadeIn"
                        >
                            회원가입 완료
                        </button>
                    )}
                </form>

                <div className="text-center mt-8">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">이미 계정이 있으신가요? </span>
                    <Link
                        to="/login"
                        className="text-primary font-bold hover:underline ml-1 text-sm"
                    >
                        로그인
                    </Link>
                </div>
            </div>
        </div>
    );
}
