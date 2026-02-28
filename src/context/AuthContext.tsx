/* eslint-disable react-refresh/only-export-components */
// src/context/AuthContext.tsx
import { createContext, useState, useEffect, type ReactNode } from "react";
import { supabase, type DbUser, type DbAllowedName } from "../lib/supabase";

interface User {
    id: string;
    name: string;
    email?: string;
    password?: string;
    role: "worker" | "manager" | "boss" | "admin";
    storeId?: "store1" | "store2" | "both";
    token: string;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem("authUser");
        return stored ? JSON.parse(stored) : null;
    });

    const [users, setUsers] = useState<User[]>([]);
    const [allowedNames, setAllowedNames] = useState<AllowedName[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const SERVER_ADMIN_CODE = "admin1234";

    // Generate random registration code
    const generateCode = (length: number = 12): string => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    // Load data from Supabase on mount
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Load users
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('*');

                if (usersError) throw usersError;

                const mappedUsers: User[] = (usersData || []).map((u: DbUser) => ({
                    id: u.id,
                    name: u.name,
                    password: u.password,
                    role: u.role,
                    storeId: u.store_id || undefined,
                    token: `token-${u.id}`
                }));
                setUsers(mappedUsers);

                // Load allowed names
                const { data: allowedData, error: allowedError } = await supabase
                    .from('allowed_names')
                    .select('*');

                if (allowedError) throw allowedError;

                const mappedAllowed: AllowedName[] = (allowedData || []).map((a: DbAllowedName) => ({
                    name: a.name,
                    role: a.role,
                    storeId: a.store_id,
                    addedAt: a.added_at,
                    registrationCode: a.registration_code
                }));
                setAllowedNames(mappedAllowed);

            } catch (error) {
                console.error('Error loading data from Supabase:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("authUser", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("authUser");
    };

    const withdraw = async () => {
        if (!user) return;
        await supabase.from('users').delete().eq('id', user.id);
        setUsers(users.filter(u => u.id !== user.id));
        logout();
    };

    const changePassword = async (currentPwd: string, newPwd: string): Promise<{ success: boolean; message: string }> => {
        if (!user) {
            return { success: false, message: "로그인이 필요합니다." };
        }

        const currentUser = users.find(u => u.id === user.id);
        if (!currentUser) {
            return { success: false, message: "사용자를 찾을 수 없습니다." };
        }

        if (currentUser.password !== currentPwd) {
            return { success: false, message: "현재 비밀번호가 일치하지 않습니다." };
        }

        if (newPwd.length < 4) {
            return { success: false, message: "새 비밀번호는 4자리 이상이어야 합니다." };
        }

        const { error } = await supabase
            .from('users')
            .update({ password: newPwd })
            .eq('id', user.id);

        if (error) {
            return { success: false, message: "비밀번호 변경 중 오류가 발생했습니다." };
        }

        setUsers(users.map(u => u.id === user.id ? { ...u, password: newPwd } : u));
        return { success: true, message: "비밀번호가 성공적으로 변경되었습니다." };
    };

    const addUser = async (newUser: Omit<User, "id">): Promise<User> => {
        const { data, error } = await supabase
            .from('users')
            .insert({
                name: newUser.name,
                password: newUser.password || '',
                role: newUser.role,
                store_id: newUser.storeId || null
            })
            .select()
            .single();

        if (error) throw error;

        const userWithId: User = {
            id: data.id,
            name: data.name,
            password: data.password,
            role: data.role,
            storeId: data.store_id,
            token: `token-${data.id}`
        };
        setUsers([...users, userWithId]);
        return userWithId;
    };

    const removeUser = async (userId: string) => {
        await supabase.from('users').delete().eq('id', userId);
        setUsers(users.filter(u => u.id !== userId));
    };

    const listUsers = () => users;

    const addAllowedName = async (name: string, role: "worker" | "manager" | "boss", storeId: "store1" | "store2" | "both"): Promise<{ success: boolean; code?: string }> => {
        if (allowedNames.some(a => a.name === name)) {
            return { success: false };
        }

        const codeLength = role === "boss" ? 16 : 12;
        const newCode = generateCode(codeLength);

        const { error } = await supabase
            .from('allowed_names')
            .insert({
                name,
                role,
                store_id: storeId,
                registration_code: newCode
            });

        if (error) {
            console.error('Error adding allowed name:', error);
            return { success: false };
        }

        const newAllowed: AllowedName = {
            name,
            role,
            storeId,
            addedAt: new Date().toISOString().slice(0, 10),
            registrationCode: newCode
        };
        setAllowedNames([...allowedNames, newAllowed]);
        return { success: true, code: newCode };
    };

    const removeAllowedName = async (name: string) => {
        await supabase.from('allowed_names').delete().eq('name', name);
        await supabase.from('users').delete().eq('name', name);
        setAllowedNames(allowedNames.filter(a => a.name !== name));
        setUsers(users.filter(u => u.name !== name));
    };

    const getAllowedNames = () => allowedNames;

    const isNameAllowed = (name: string) => allowedNames.some(a => a.name === name);

    const validatePersonalCode = (code: string): AllowedName | null => {
        return allowedNames.find(a => a.registrationCode === code) || null;
    };

    const regenerateCode = async (name: string): Promise<string | null> => {
        const entry = allowedNames.find(a => a.name === name);
        if (!entry) return null;

        const codeLength = entry.role === "boss" ? 16 : 12;
        const newCode = generateCode(codeLength);

        const { error } = await supabase
            .from('allowed_names')
            .update({ registration_code: newCode })
            .eq('name', name);

        if (error) return null;

        setAllowedNames(allowedNames.map(a =>
            a.name === name ? { ...a, registrationCode: newCode } : a
        ));
        return newCode;
    };

    const validateRegistrationCode = (role: "worker" | "manager" | "boss", code: string): boolean => {
        if (role === "boss") {
            return code === SERVER_ADMIN_CODE;
        }
        return allowedNames.some(a => a.registrationCode === code);
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
