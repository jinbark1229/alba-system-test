// src/services/api.ts
import { supabase, type DbWorkLog, type DbSchedule, type DbNotice } from "../lib/supabase";

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
    const { error } = await supabase
        .from('work_logs')
        .insert({
            user_name: log.userName || '',
            date: log.date,
            start_time: log.start,
            end_time: log.end,
            break_duration: log.breakDuration || 0,
            note: log.note || null
        });

    if (error) throw error;
};

export const getLogs = async (userName: string): Promise<WorkLog[]> => {
    const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_name', userName)
        .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map((log: DbWorkLog) => ({
        id: log.id,
        date: log.date,
        start: log.start_time,
        end: log.end_time,
        break: log.break_duration > 0,
        userName: log.user_name,
        breakDuration: log.break_duration,
        note: log.note || undefined
    }));
};

export const getAllLogs = async (): Promise<WorkLog[]> => {
    const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map((log: DbWorkLog) => ({
        id: log.id,
        date: log.date,
        start: log.start_time,
        end: log.end_time,
        break: log.break_duration > 0,
        userName: log.user_name,
        breakDuration: log.break_duration
    }));
};

export const deleteLog = async (logId: string) => {
    const { error } = await supabase
        .from('work_logs')
        .delete()
        .eq('id', logId);

    if (error) throw error;
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getSchedules = async (_userName: string): Promise<Schedule[]> => {
    const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('date', { ascending: true });

    if (error) throw error;

    return (data || []).map((s: DbSchedule) => ({
        id: s.id,
        name: s.name,
        date: s.date,
        start: s.start_time,
        end: s.end_time,
        storeId: s.store_id
    }));
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

                const newSchedules: Omit<DbSchedule, 'id'>[] = [];

                // Get existing schedules to check for duplicates
                const { data: existingSchedules } = await supabase
                    .from('schedules')
                    .select('name, date, store_id');

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

                                // Check for duplicate
                                const isDuplicate = existingSchedules?.some(
                                    s => s.name === name && s.date === dateMap[colIdx] && s.store_id === storeId
                                );

                                if (!isDuplicate) {
                                    newSchedules.push({
                                        name: name,
                                        date: dateMap[colIdx],
                                        start_time: formatTime(startDisplay),
                                        end_time: formatTime(endDisplay),
                                        store_id: storeId as 'store1' | 'store2'
                                    });
                                }
                            }
                        }
                    });
                }

                if (newSchedules.length > 0) {
                    const { error } = await supabase
                        .from('schedules')
                        .insert(newSchedules);

                    if (error) {
                        reject(error.message);
                        return;
                    }
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
    let query = supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

    if (storeId) {
        query = query.or(`store_id.eq.${storeId},store_id.eq.all`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map((n: DbNotice) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        author: n.author,
        storeId: n.store_id,
        priority: n.priority,
        imageUrls: n.image_urls || [],
        createdAt: n.created_at
    }));
};

export const createNotice = async (notice: Omit<Notice, 'id' | 'createdAt'>): Promise<Notice> => {
    const { data, error } = await supabase
        .from('notices')
        .insert({
            title: notice.title,
            content: notice.content,
            author: notice.author,
            store_id: notice.storeId,
            priority: notice.priority,
            image_urls: notice.imageUrls || []
        })
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        title: data.title,
        content: data.content,
        author: data.author,
        storeId: data.store_id,
        priority: data.priority,
        imageUrls: data.image_urls || [],
        createdAt: data.created_at
    };
};

export const deleteNotice = async (noticeId: string) => {
    const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', noticeId);

    if (error) throw error;
};

// ============ Schedule Comments (using notices for now) ============
export interface ScheduleComment {
    id: string;
    storeId: string;
    userName: string;
    content: string;
    createdAt: string;
}

// Using a simple local array for comments (can be extended to Supabase table if needed)
let scheduleComments: ScheduleComment[] = [];

export const getScheduleComments = async (storeId: string): Promise<ScheduleComment[]> => {
    return scheduleComments.filter(c => c.storeId === storeId);
};

export const addScheduleComment = async (comment: Omit<ScheduleComment, 'id' | 'createdAt'>): Promise<ScheduleComment> => {
    const newComment: ScheduleComment = {
        ...comment,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
    };
    scheduleComments = [newComment, ...scheduleComments];
    return newComment;
};

// ============ Export Functions ============
export const exportLogsZip = async (startDate: string, endDate: string): Promise<Blob> => {
    const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

    if (error) throw error;

    // Create CSV content
    let csvContent = "날짜,이름,시작시간,종료시간,휴게시간(분)\n";
    (data || []).forEach((log: DbWorkLog) => {
        csvContent += `${log.date},${log.user_name},${log.start_time},${log.end_time},${log.break_duration}\n`;
    });

    // Create blob
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    return blob;
};

// ============ Image Upload ============
export const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `notices/${fileName}`;

    const { error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

export const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
        const url = await uploadImage(file);
        urls.push(url);
    }
    return urls;
};
