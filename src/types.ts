// src/types.ts

export interface User {
    id: string;
    name: string;
    role: 'worker' | 'boss' | 'admin';
    token?: string;
    email?: string;
}

export interface Log {
    id: string;
    date: string; // YYYY-MM-DD
    start: string; // HH:MM
    end: string; // HH:MM
    break?: boolean;
    breakDuration?: number; // minutes
    breakStart?: string; // optional break start time
    breakEnd?: string; // optional break end time
    userName?: string;
}

export interface Notice {
    id: string;
    title: string;
    content: string;
    author: string;
    date: string; // YYYY-MM-DD
}

export interface ScheduleComment {
    id: string;
    storeId: string;
    comment: string;
    date: string;
}

export interface Schedule {
    id: string;
    name: string; // Employee name
    storeId: string;
    date: string;
    start: string;
    end: string;
}
