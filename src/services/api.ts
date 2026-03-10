// src/services/api.ts

// Helper function to safely parse localStorage
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

// ============ Mock Data Initializers ============

const initMockData = () => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const todayStr = formatDate(today);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    if (!localStorage.getItem('alba_work_logs')) {
        setStorage('alba_work_logs', [
            { id: 'log1', date: todayStr, start: '09:00', end: '18:00', break: true, userName: '김철수', breakDuration: 60, note: '정상출근' },
            { id: 'log2', date: yesterdayStr, start: '14:00', end: '22:00', break: true, userName: '이영희', breakDuration: 30, note: '물품 정리 완료' }
        ]);
    }

    if (!localStorage.getItem('alba_schedules')) {
        setStorage('alba_schedules', [
            { id: 'sch1', name: '김철수', date: todayStr, start: '09:00', end: '18:00', storeId: 'store1' },
            { id: 'sch2', name: '이영희', date: todayStr, start: '14:00', end: '22:00', storeId: 'store2' }
        ]);
    }

    if (!localStorage.getItem('alba_notices')) {
        setStorage('alba_notices', [
            {
                id: 'not1', title: '이번 주말 매장 청소 안내', content: '이번 주말 마감 타임은 창고 청소 부탁드립니다.',
                author: '사장님', storeId: 'both', priority: 'important', imageUrls: [], createdAt: new Date().toISOString()
            },
            {
                id: 'not2', title: '신메뉴 레시피 업데이트', content: '포스기 옆 레시피 북 업데이트 되었습니다. 확인해주세요.',
                author: '사장님', storeId: 'store1', priority: 'normal', imageUrls: [], createdAt: new Date(Date.now() - 86400000).toISOString()
            }
        ]);
    }

    if (!localStorage.getItem('alba_comments')) {
        setStorage('alba_comments', []);
    }
};

initMockData();

// ============ Work Logs ============
export interface WorkLog {
    id: string;
    date: string;
    start: string;
    end: string;
    break: boolean;
    userName: string;
    breakDuration?: number;
    note?: string;
}

export const createLog = async (log: { date: string; start: string; end: string; break: boolean; userName?: string; breakDuration?: number; note?: string }) => {
    const logs = getStorage<WorkLog[]>('alba_work_logs', []);
    const newLog: WorkLog = {
        ...log,
        id: Math.random().toString(36).substr(2, 9),
        userName: log.userName || '알 수 없음',
    };
    logs.unshift(newLog); // 최신을 앞에
    setStorage('alba_work_logs', logs);
};

export const getLogs = async (userName: string): Promise<WorkLog[]> => {
    const logs = getStorage<WorkLog[]>('alba_work_logs', []);
    return logs.filter(l => l.userName === userName).sort((a, b) => b.date.localeCompare(a.date));
};

export const getAllLogs = async (): Promise<WorkLog[]> => {
    const logs = getStorage<WorkLog[]>('alba_work_logs', []);
    return logs.sort((a, b) => b.date.localeCompare(a.date));
};

export const deleteLog = async (logId: string) => {
    let logs = getStorage<WorkLog[]>('alba_work_logs', []);
    logs = logs.filter(l => l.id !== logId);
    setStorage('alba_work_logs', logs);
};

// ============ Schedules ============
export interface Schedule {
    id: string;
    name: string;
    date: string;
    start: string;
    end: string;
    storeId?: string;
}

export const getSchedules = async (_userName?: string): Promise<Schedule[]> => {
    const schedules = getStorage<Schedule[]>('alba_schedules', []);
    return schedules.sort((a, b) => a.date.localeCompare(b.date));
};

export const uploadSchedules = async (file: File, storeId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const csvText = e.target?.result as string;
                const lines = csvText.split("\n").map(l => l.trim()).filter(l => l);

                if (lines.length < 2) {
                    reject("CSV 파일이 비어있거나 형식이 올바르지 않습니다.");
                    return;
                }

                const headerCols = lines[0].split(",").map(c => c.trim());
                const dateMap: { [index: number]: string } = {};
                const currentYear = new Date().getFullYear();

                headerCols.forEach((col, idx) => {
                    const dateMatch = col.match(/(\d+)월\s*(\d+)일/);
                    if (dateMatch) {
                        const month = dateMatch[1].padStart(2, '0');
                        const day = dateMatch[2].padStart(2, '0');
                        dateMap[idx] = `${currentYear}-${month}-${day}`;
                    }
                });

                const existingSchedules = getStorage<Schedule[]>('alba_schedules', []);
                const newSchedules: Schedule[] = [];

                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(",").map(c => c.trim());
                    if (cols.length === 0) continue;

                    const name = cols[0];
                    if (!name) continue;

                    cols.forEach((cell, colIdx) => {
                        if (colIdx === 0) return;
                        if (!dateMap[colIdx]) return;
                        if (!cell) return;

                        const rangeParts = cell.split("~");
                        if (rangeParts.length === 2) {
                            const startDisplay = parseFloat(rangeParts[0]);
                            const endDisplay = parseFloat(rangeParts[1]);

                            if (!isNaN(startDisplay) && !isNaN(endDisplay)) {
                                const formatTime = (decimalTime: number) => {
                                    const hours = Math.floor(decimalTime);
                                    const minutes = (decimalTime - hours) * 60;
                                    return `${String(hours).padStart(2, '0')}:${String(Math.round(minutes)).padStart(2, '0')}`;
                                };

                                const isDuplicate = existingSchedules.some(
                                    s => s.name === name && s.date === dateMap[colIdx] && s.storeId === storeId
                                );

                                if (!isDuplicate) {
                                    newSchedules.push({
                                        id: Math.random().toString(36).substr(2, 9),
                                        name: name,
                                        date: dateMap[colIdx],
                                        start: formatTime(startDisplay),
                                        end: formatTime(endDisplay),
                                        storeId: storeId
                                    });
                                }
                            }
                        }
                    });
                }

                if (newSchedules.length > 0) {
                    setStorage('alba_schedules', [...existingSchedules, ...newSchedules]);
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject("파일을 읽는 중 오류가 발생했습니다.");
        reader.readAsText(file);
    });
};

// ============ Notices ============
export interface Notice {
    id: string;
    title: string;
    content: string;
    author: string;
    storeId: string;
    priority: "normal" | "important" | "urgent";
    imageUrls: string[];
    createdAt: string;
}

export const getNotices = async (storeId?: string): Promise<Notice[]> => {
    let notices = getStorage<Notice[]>('alba_notices', []);

    if (storeId) {
        notices = notices.filter(n => n.storeId === storeId || n.storeId === 'both' || n.storeId === 'all');
    }

    return notices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createNotice = async (notice: Omit<Notice, 'id' | 'createdAt'>): Promise<Notice> => {
    const notices = getStorage<Notice[]>('alba_notices', []);
    const newNotice: Notice = {
        ...notice,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
    };
    notices.unshift(newNotice);
    setStorage('alba_notices', notices);
    return newNotice;
};

export const deleteNotice = async (noticeId: string) => {
    let notices = getStorage<Notice[]>('alba_notices', []);
    notices = notices.filter(n => n.id !== noticeId);
    setStorage('alba_notices', notices);
};

// ============ Schedule Comments ============
export interface ScheduleComment {
    id: string;
    storeId: string;
    userName: string;
    content: string;
    createdAt: string;
}

export const getScheduleComments = async (storeId: string): Promise<ScheduleComment[]> => {
    const comments = getStorage<ScheduleComment[]>('alba_comments', []);
    return comments.filter(c => c.storeId === storeId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addScheduleComment = async (comment: Omit<ScheduleComment, 'id' | 'createdAt'>): Promise<ScheduleComment> => {
    const comments = getStorage<ScheduleComment[]>('alba_comments', []);
    const newComment: ScheduleComment = {
        ...comment,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
    };
    comments.unshift(newComment);
    setStorage('alba_comments', comments);
    return newComment;
};

export const deleteScheduleComment = async (commentId: string): Promise<void> => {
    let comments = getStorage<ScheduleComment[]>('alba_comments', []);
    comments = comments.filter(c => c.id !== commentId);
    setStorage('alba_comments', comments);
};

// ============ Export Functions ============
export const exportLogsZip = async (startDate: string, endDate: string): Promise<Blob> => {
    const JSZip = (await import('jszip')).default;
    const logs = getStorage<WorkLog[]>('alba_work_logs', []);
    const filtered = logs
        .filter(l => l.date >= startDate && l.date <= endDate)
        .sort((a, b) => a.date.localeCompare(b.date));

    // Group by userName
    const byUser: Record<string, WorkLog[]> = {};
    filtered.forEach(log => {
        const name = log.userName || '알수없음';
        if (!byUser[name]) byUser[name] = [];
        byUser[name].push(log);
    });

    const zip = new JSZip();

    if (Object.keys(byUser).length === 0) {
        // Empty zip with a readme
        zip.file('README.txt', `${startDate} ~ ${endDate} 기간에 근무 기록이 없습니다.`);
    } else {
        Object.entries(byUser).forEach(([userName, userLogs]) => {
            const BOM = '\uFEFF';
            let csv = BOM + '날짜,이름,시작시간,종료시간,휴게여부,휴게시간(분),특이사항\n';
            userLogs.forEach(log => {
                csv += `${log.date},${log.userName},${log.start},${log.end},${log.break ? '있음' : '없음'},${log.breakDuration || 0},${log.note || ''}\n`;
            });
            zip.file(`${userName}_근무일지.csv`, csv);
        });
    }

    return await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
};

// ============ Image Upload ============
export const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target?.result as string); // Save as Base64 in local storage
        };
        reader.readAsDataURL(file);
    });
};

export const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
        const url = await uploadImage(file);
        urls.push(url);
    }
    return urls;
};
