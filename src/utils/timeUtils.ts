// src/utils/timeUtils.ts

export const calculateDuration = (start: string, end: string, breakDurationMinutes: number = 0): number => {
    if (!start || !end) return 0;

    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    const startDate = new Date(0, 0, 0, startH, startM);
    const endDate = new Date(0, 0, 0, endH, endM);

    // If end time is before start time, assume it's next day
    if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
    }

    let durationMs = endDate.getTime() - startDate.getTime();

    // Subtract break duration (convert minutes to ms)
    if (breakDurationMinutes > 0) {
        durationMs -= breakDurationMinutes * 60 * 1000;
    }

    // Return hours (decimal)
    return Math.max(0, durationMs / (1000 * 60 * 60));
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
};
