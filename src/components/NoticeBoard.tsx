// src/components/NoticeBoard.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { getNotices, createNotice, deleteNotice, uploadImages, type Notice } from "../services/api";
import { useAuth } from "../context/AuthContext";

const MAX_IMAGES = 6;

export default function NoticeBoard() {
    const { user } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [priority, setPriority] = useState<"normal" | "important" | "urgent">("normal");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isBoss = user?.role === "boss" || user?.role === "admin";

    const fetchNotices = useCallback(async () => {
        try {
            const data = await getNotices(user?.storeId);
            setNotices(data);
        } catch (error) {
            console.error("Failed to fetch notices", error);
        }
    }, [user?.storeId]);

    useEffect(() => {
        fetchNotices();
    }, [fetchNotices]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const remaining = MAX_IMAGES - selectedFiles.length;
        const newFiles = files.slice(0, remaining);

        if (files.length > remaining) {
            alert(`최대 ${MAX_IMAGES}장까지만 업로드할 수 있습니다.`);
        }

        const updatedFiles = [...selectedFiles, ...newFiles];
        setSelectedFiles(updatedFiles);

        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        setIsUploading(true);
        try {
            let imageUrls: string[] = [];
            if (selectedFiles.length > 0) {
                imageUrls = await uploadImages(selectedFiles);
            }

            await createNotice({
                title: newTitle,
                content: newContent,
                author: user?.name || "Unknown",
                storeId: user?.storeId || "all",
                priority,
                imageUrls
            });
            setNewTitle("");
            setNewContent("");
            setPriority("normal");
            setSelectedFiles([]);
            setPreviews([]);
            setIsWriting(false);
            fetchNotices();
        } catch (error) {
            console.error("Failed to create notice", error);
            alert("공지사항 등록에 실패했습니다.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("이 공지사항을 삭제하시겠습니까?")) return;
        try {
            await deleteNotice(id);
            setSelectedNotice(null);
            fetchNotices();
        } catch (error) {
            console.error("Failed to delete notice", error);
        }
    };

    const getPriorityBadge = (priorityLevel: string) => {
        switch (priorityLevel) {
            case "urgent":
                return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">긴급</span>;
            case "important":
                return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">중요</span>;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">campaign</span>
                    공지사항
                </h2>
                {isBoss && !isWriting && (
                    <button
                        onClick={() => setIsWriting(true)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        새 공지
                    </button>
                )}
            </div>

            {/* Write Form */}
            {isWriting && (
                <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4">
                    <input
                        type="text"
                        placeholder="제목"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2936] text-slate-900 dark:text-white"
                        required
                    />
                    <textarea
                        placeholder="내용"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2936] text-slate-900 dark:text-white resize-none"
                        required
                    />

                    {/* Image Upload Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-green-500">image</span>
                            이미지 첨부 (최대 {MAX_IMAGES}장)
                        </label>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="image/*"
                            multiple
                            className="hidden"
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={selectedFiles.length >= MAX_IMAGES}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined">add_photo_alternate</span>
                            이미지 추가 ({selectedFiles.length}/{MAX_IMAGES})
                        </button>

                        {previews.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {previews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined text-xs">close</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as "normal" | "important" | "urgent")}
                            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2936] text-slate-900 dark:text-white"
                        >
                            <option value="normal">일반</option>
                            <option value="important">중요</option>
                            <option value="urgent">긴급</option>
                        </select>
                        <div className="flex-1"></div>
                        <button
                            type="button"
                            onClick={() => { setIsWriting(false); setSelectedFiles([]); setPreviews([]); }}
                            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isUploading && <span className="material-symbols-outlined animate-spin text-sm">refresh</span>}
                            {isUploading ? "업로드 중..." : "등록"}
                        </button>
                    </div>
                </form>
            )}

            {/* Notice List */}
            {notices.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                    <p>등록된 공지사항이 없습니다.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {notices.map((notice) => (
                        <button
                            key={notice.id}
                            onClick={() => setSelectedNotice(notice)}
                            className="w-full text-left bg-white dark:bg-[#1e2936] rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {getPriorityBadge(notice.priority)}
                                <h3 className="font-bold text-slate-900 dark:text-white flex-1 truncate">{notice.title}</h3>
                                {notice.imageUrls && notice.imageUrls.length > 0 && (
                                    <span className="material-symbols-outlined text-slate-400 text-sm">image</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                <span>{notice.author}</span>
                                <span>•</span>
                                <span>{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Notice Detail Modal */}
            {selectedNotice && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedNotice(null)}>
                    <div
                        className="bg-white dark:bg-[#1e2936] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {getPriorityBadge(selectedNotice.priority)}
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{selectedNotice.title}</h3>
                                </div>
                                <div className="text-xs text-slate-400">
                                    {selectedNotice.author} • {new Date(selectedNotice.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                            <button onClick={() => setSelectedNotice(null)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 overflow-y-auto flex-1">
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-4">{selectedNotice.content}</p>

                            {/* Images */}
                            {selectedNotice.imageUrls && selectedNotice.imageUrls.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                    {selectedNotice.imageUrls.map((url, index) => (
                                        <img
                                            key={index}
                                            src={url}
                                            alt={`이미지 ${index + 1}`}
                                            className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setExpandedImage(url)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer - Delete Button for Boss */}
                        {isBoss && (
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => handleDelete(selectedNotice.id)}
                                    className="w-full py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    삭제
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Image Lightbox */}
            {expandedImage && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={() => setExpandedImage(null)}>
                    <img src={expandedImage} alt="확대 이미지" className="max-w-full max-h-full object-contain" />
                    <button className="absolute top-4 right-4 text-white" onClick={() => setExpandedImage(null)}>
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>
            )}
        </div>
    );
}
