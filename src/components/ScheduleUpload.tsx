// src/components/ScheduleUpload.tsx
import { useState } from "react";
import * as XLSX from "xlsx";
import { uploadSchedules } from "../services/api";

export default function ScheduleUpload() {
    const [file, setFile] = useState<File | null>(null);
    // const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [storeId, setStoreId] = useState<'store1' | 'store2'>('store1');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        try {
            let fileToUpload = file;

            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data);
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
                const blob = new Blob([csvOutput], { type: 'text/csv' });
                fileToUpload = new File([blob], "converted.csv", { type: "text/csv" });
            }

            await uploadSchedules(fileToUpload, storeId);
            alert(`${storeId === 'store1' ? '연산점' : '부전점'} 시간표가 업로드되었습니다.`);
            setFile(null);
            // const all = await getAllSchedules();
            // setSchedules(all);
        } catch (error) {
            console.error(error);
            alert("업로드 실패: " + error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg text-sm text-slate-600 dark:text-slate-400 mb-2">
                <p className="font-medium mb-1">📅 파일 형식 안내</p>
                <p>엑셀(.xlsx) 또는 CSV 파일 업로드 가능</p>
                <p>형식: 1행(날짜), 1열(이름), 셀(근무시간)</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-4 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-[#1a2632]">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">매장:</span>
                    <div className="flex gap-2">
                        <label className="flex items-center gap-2 cursor-pointer p-1">
                            <input
                                type="radio"
                                name="store"
                                value="store1"
                                checked={storeId === 'store1'}
                                onChange={() => setStoreId('store1')}
                                className="accent-primary w-4 h-4"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300">연산점</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-1">
                            <input
                                type="radio"
                                name="store"
                                value="store2"
                                checked={storeId === 'store2'}
                                onChange={() => setStoreId('store2')}
                                className="accent-primary w-4 h-4"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300">부전점</span>
                        </label>
                    </div>
                </div>

                <div className="flex-1">
                    <input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2.5 file:px-4
                            file:rounded-lg file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary/10 file:text-primary
                            hover:file:bg-primary/20
                            cursor-pointer"
                    />
                </div>
            </div>

            <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="w-full sm:w-auto bg-primary hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                {isUploading ? (
                    <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        업로드 중...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-sm">upload</span>
                        업로드 하기
                    </>
                )}
            </button>
        </div>
    );
}
