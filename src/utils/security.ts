// src/utils/security.ts
// =====================================================
// 보안 유틸리티 - 클라이언트 사이드 보안 처리
// =====================================================

import bcrypt from 'bcryptjs';
import DOMPurify from 'dompurify';

const BCRYPT_ROUNDS = 10;

// ──────────────────────────────────────────
// 1. 비밀번호 해시 처리
// ──────────────────────────────────────────
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    return bcrypt.hash(password, salt);
};

export const verifyPassword = async (plain: string, hashed: string): Promise<boolean> => {
    // 기존 평문 비밀번호 호환성 지원 (마이그레이션 기간)
    if (!hashed.startsWith('$2')) {
        return plain === hashed; // legacy 평문 비교
    }
    return bcrypt.compare(plain, hashed);
};

// ──────────────────────────────────────────
// 2. XSS 방지 - 입력 새니타이징
// ──────────────────────────────────────────
export const sanitize = (input: string): string => {
    return DOMPurify.sanitize(input.trim(), {
        ALLOWED_TAGS: [],      // HTML 태그 모두 제거
        ALLOWED_ATTR: [],      // 속성 모두 제거
    });
};

export const sanitizeHtml = (input: string): string => {
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
        ALLOWED_ATTR: [],
    });
};

// ──────────────────────────────────────────
// 3. 브루트포스 방지 - 로그인 시도 제한
// ──────────────────────────────────────────
const FAILED_KEY = 'alba_login_failed';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15분

interface FailRecord {
    count: number;
    lockedUntil: number | null;
    lastAttempt: number;
}

const getFailRecord = (identifier: string): FailRecord => {
    try {
        const raw = localStorage.getItem(`${FAILED_KEY}_${identifier}`);
        return raw ? JSON.parse(raw) : { count: 0, lockedUntil: null, lastAttempt: 0 };
    } catch {
        return { count: 0, lockedUntil: null, lastAttempt: 0 };
    }
};

const setFailRecord = (identifier: string, record: FailRecord) => {
    localStorage.setItem(`${FAILED_KEY}_${identifier}`, JSON.stringify(record));
};

export const checkLoginAllowed = (identifier: string): { allowed: boolean; remainingMs: number; attemptsLeft: number } => {
    const record = getFailRecord(identifier);
    const now = Date.now();

    // 잠금 해제 확인
    if (record.lockedUntil && now >= record.lockedUntil) {
        setFailRecord(identifier, { count: 0, lockedUntil: null, lastAttempt: 0 });
        return { allowed: true, remainingMs: 0, attemptsLeft: MAX_ATTEMPTS };
    }

    if (record.lockedUntil && now < record.lockedUntil) {
        return {
            allowed: false,
            remainingMs: record.lockedUntil - now,
            attemptsLeft: 0,
        };
    }

    return {
        allowed: true,
        remainingMs: 0,
        attemptsLeft: MAX_ATTEMPTS - record.count,
    };
};

export const recordLoginFailure = (identifier: string): { locked: boolean; attemptsLeft: number } => {
    const record = getFailRecord(identifier);
    const newCount = record.count + 1;

    if (newCount >= MAX_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        setFailRecord(identifier, { count: newCount, lockedUntil, lastAttempt: Date.now() });
        return { locked: true, attemptsLeft: 0 };
    }

    setFailRecord(identifier, { count: newCount, lockedUntil: null, lastAttempt: Date.now() });
    return { locked: false, attemptsLeft: MAX_ATTEMPTS - newCount };
};

export const recordLoginSuccess = (identifier: string) => {
    localStorage.removeItem(`${FAILED_KEY}_${identifier}`);
};

// ──────────────────────────────────────────
// 4. 세션 토큰 유효기간 관리 (8시간)
// ──────────────────────────────────────────
const SESSION_KEY = 'authUser';
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8시간

interface SessionUser {
    id: string;
    name: string;
    role: string;
    token: string;
    _loginAt?: number;
    _expiresAt?: number;
    [key: string]: unknown;
}

export const saveSession = (user: SessionUser) => {
    const now = Date.now();
    const sessionUser = {
        ...user,
        _loginAt: now,
        _expiresAt: now + SESSION_MAX_AGE_MS,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
};

export const loadSession = (): SessionUser | null => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;

        const user: SessionUser = JSON.parse(raw);

        // 방문자(포트폴리오용) 세션은 만료 없음
        if (user.id === 'guest-viewer') return user;

        // 세션 만료 확인
        if (user._expiresAt && Date.now() > user._expiresAt) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }

        return user;
    } catch {
        return null;
    }
};

export const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
};

// ──────────────────────────────────────────
// 5. 입력 유효성 검사
// ──────────────────────────────────────────
export const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 6) {
        return { valid: false, message: '비밀번호는 6자 이상이어야 합니다.' };
    }
    if (password.length > 100) {
        return { valid: false, message: '비밀번호가 너무 깁니다.' };
    }
    return { valid: true, message: '' };
};

export const validateName = (name: string): { valid: boolean; message: string } => {
    const clean = sanitize(name);
    if (clean.length < 2) {
        return { valid: false, message: '이름은 2자 이상이어야 합니다.' };
    }
    if (clean.length > 20) {
        return { valid: false, message: '이름은 20자 이하여야 합니다.' };
    }
    if (!/^[가-힣a-zA-Z\s]+$/.test(clean)) {
        return { valid: false, message: '이름에 특수문자를 사용할 수 없습니다.' };
    }
    return { valid: true, message: '' };
};
