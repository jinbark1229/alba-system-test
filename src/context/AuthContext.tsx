/* eslint-disable react-refresh/only-export-components */
// src/context/AuthContext.tsx
import { createContext, useState, useEffect, type ReactNode } from "react";
import {
    hashPassword,
    verifyPassword,
    saveSession,
    loadSession,
    clearSession,
    sanitize,
} from "../utils/security";

interface User {
    id: string;
    name: string;
    email?: string;
    password?: string;
    role: "worker" | "manager" | "boss" | "admin";
    storeId?: "store1" | "store2" | "both";
    token: string;
    _loginAt?: number;
    _expiresAt?: number;
}

export interface AllowedName {
    name: string;
    role: "worker" | "manager" | "boss";
    storeId: "store1" | "store2" | "both";
    addedAt: string;
    registrationCode: string;
}

interface AuthContextProps {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    withdraw: () => void;
    changePassword: (currentPwd: string, newPwd: string) => Promise<{ success: boolean; message: string }>;
    addUser: (newUser: Omit<User, "id">) => Promise<User>;
    removeUser: (userId: string) => Promise<void>;
    listUsers: () => User[];
    addAllowedName: (name: string, role: "worker" | "manager" | "boss", storeId: "store1" | "store2" | "both") => Promise<{ success: boolean; code?: string }>;
    removeAllowedName: (name: string) => Promise<void>;
    getAllowedNames: () => AllowedName[];
    isNameAllowed: (name: string) => boolean;
    validatePersonalCode: (code: string) => AllowedName | null;
    regenerateCode: (name: string) => Promise<string | null>;
    validateRegistrationCode: (role: "worker" | "manager" | "boss", code: string) => boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Helper - localStorage 안전 파싱
const getStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const setStorage = <T,>(key: string, value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // 세션 유효기간 검사 포함한 초기 사용자 로드
    const [user, setUser] = useState<User | null>(() => {
        const session = loadSession();
        if (session) return session as User;

        // 방문자를 위한 임시 계정 (모든 권한 허용) - 포트폴리오용
        return {
            id: "guest-viewer",
            name: "방문자(포트폴리오용)",
            role: "admin",
            storeId: "both",
            token: "guest-token"
        };
    });

    const [users, setUsers] = useState<User[]>([]);
    const [allowedNames, setAllowedNames] = useState<AllowedName[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 관리자 코드 - 환경변수 우선, 없으면 기본값 (실제 배포 시 반드시 환경변수 설정)
    const SERVER_ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || "admin1234";

    // 랜덤 코드 생성
    const generateCode = (length: number = 12): string => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    // 포트폴리오용 목업 데이터 초기화
    const initMockData = async () => {
        if (!localStorage.getItem('alba_users')) {
            // 포트폴리오용 계정: 비밀번호도 해시 저장
            const pw = await hashPassword('password123');
            setStorage('alba_users', [
                { id: 'u1', name: '사장님', password: pw, role: 'boss', storeId: 'both', token: 'token-u1' },
                { id: 'u2', name: '김철수', password: pw, role: 'worker', storeId: 'store1', token: 'token-u2' },
                { id: 'u3', name: '이영희', password: pw, role: 'manager', storeId: 'store2', token: 'token-u3' }
            ]);
        }
        if (!localStorage.getItem('alba_allowed_names')) {
            setStorage('alba_allowed_names', [
                { name: '사장님', role: 'boss', storeId: 'both', addedAt: new Date().toISOString().slice(0, 10), registrationCode: 'AUTHOR_BOSS_CODE' },
                { name: '김철수', role: 'worker', storeId: 'store1', addedAt: new Date().toISOString().slice(0, 10), registrationCode: generateCode() },
                { name: '이영희', role: 'manager', storeId: 'store2', addedAt: new Date().toISOString().slice(0, 10), registrationCode: generateCode() }
            ]);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await initMockData();
                const localUsers = getStorage<User[]>('alba_users', []);
                setUsers(localUsers);
                const localAllowed = getStorage<AllowedName[]>('alba_allowed_names', []);
                setAllowedNames(localAllowed);
            } catch (error) {
                console.error('Error loading data from LocalStorage:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        saveSession(userData as Parameters<typeof saveSession>[0]);  // 세션 만료 시간 포함하여 저장
    };

    const logout = () => {
        setUser(null);
        clearSession();
    };

    const withdraw = async () => {
        if (!user) return;
        const newUsers = users.filter(u => u.id !== user.id);
        setStorage('alba_users', newUsers);
        setUsers(newUsers);
        logout();
    };

    const changePassword = async (currentPwd: string, newPwd: string): Promise<{ success: boolean; message: string }> => {
        if (!user) return { success: false, message: "로그인이 필요합니다." };

        const currentUser = users.find(u => u.id === user.id);
        if (!currentUser) return { success: false, message: "사용자를 찾을 수 없습니다." };

        // 비밀번호 검증 (해시 & 평문 모두 지원 - 마이그레이션 호환)
        const isValid = await verifyPassword(currentPwd, currentUser.password || '');
        if (!isValid) return { success: false, message: "현재 비밀번호가 일치하지 않습니다." };

        if (newPwd.length < 6) return { success: false, message: "새 비밀번호는 6자리 이상이어야 합니다." };

        // 새 비밀번호 해시화
        const newHashedPwd = await hashPassword(newPwd);
        const updatedUsers = users.map(u => u.id === user.id ? { ...u, password: newHashedPwd } : u);
        setStorage('alba_users', updatedUsers);
        setUsers(updatedUsers);

        return { success: true, message: "비밀번호가 성공적으로 변경되었습니다." };
    };

    const addUser = async (newUser: Omit<User, "id">): Promise<User> => {
        // 비밀번호 해시화
        const hashedPwd = newUser.password ? await hashPassword(newUser.password) : undefined;
        // 이름 새니타이즈
        const cleanName = sanitize(newUser.name);

        const userWithId: User = {
            ...newUser,
            name: cleanName,
            password: hashedPwd,
            id: Math.random().toString(36).substr(2, 9),
            token: `token-${Date.now()}`
        };
        const updatedUsers = [...users, userWithId];
        setStorage('alba_users', updatedUsers);
        setUsers(updatedUsers);
        return userWithId;
    };

    const removeUser = async (userId: string) => {
        const updatedUsers = users.filter(u => u.id !== userId);
        setStorage('alba_users', updatedUsers);
        setUsers(updatedUsers);
    };

    const listUsers = () => users;

    const addAllowedName = async (name: string, role: "worker" | "manager" | "boss", storeId: "store1" | "store2" | "both"): Promise<{ success: boolean; code?: string }> => {
        const cleanName = sanitize(name);
        if (allowedNames.some(a => a.name === cleanName)) return { success: false };

        const codeLength = role === "boss" ? 16 : 12;
        const newCode = generateCode(codeLength);

        const newAllowed: AllowedName = {
            name: cleanName,
            role,
            storeId,
            addedAt: new Date().toISOString().slice(0, 10),
            registrationCode: newCode
        };
        const updatedAllowed = [...allowedNames, newAllowed];
        setStorage('alba_allowed_names', updatedAllowed);
        setAllowedNames(updatedAllowed);
        return { success: true, code: newCode };
    };

    const removeAllowedName = async (name: string) => {
        const updatedAllowed = allowedNames.filter(a => a.name !== name);
        const updatedUsers = users.filter(u => u.name !== name);
        setStorage('alba_allowed_names', updatedAllowed);
        setStorage('alba_users', updatedUsers);
        setAllowedNames(updatedAllowed);
        setUsers(updatedUsers);
    };

    const getAllowedNames = () => allowedNames;
    const isNameAllowed = (name: string) => allowedNames.some(a => a.name === name);

    const validatePersonalCode = (code: string): AllowedName | null => {
        const cleanCode = sanitize(code);
        return allowedNames.find(a => a.registrationCode === cleanCode) || null;
    };

    const regenerateCode = async (name: string): Promise<string | null> => {
        const entry = allowedNames.find(a => a.name === name);
        if (!entry) return null;

        const codeLength = entry.role === "boss" ? 16 : 12;
        const newCode = generateCode(codeLength);

        const updatedAllowed = allowedNames.map(a =>
            a.name === name ? { ...a, registrationCode: newCode } : a
        );
        setStorage('alba_allowed_names', updatedAllowed);
        setAllowedNames(updatedAllowed);
        return newCode;
    };

    const validateRegistrationCode = (role: "worker" | "manager" | "boss", code: string): boolean => {
        const cleanCode = sanitize(code);
        if (role === "boss") return cleanCode === SERVER_ADMIN_CODE;
        return allowedNames.some(a => a.registrationCode === cleanCode);
    };

    return (
        <AuthContext.Provider value={{
            user, login, logout, withdraw, changePassword, addUser, removeUser, listUsers,
            addAllowedName, removeAllowedName, getAllowedNames, isNameAllowed,
            validatePersonalCode, regenerateCode, validateRegistrationCode, isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };
export { useAuth } from "../hooks/useAuth";
