// src/components/ScheduleComments.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Comment {
    id: string;
    author: string;
    content: string;
    date: string;
    timestamp: number;
    storeId: 'store1' | 'store2';
}

interface ScheduleCommentsProps {
    storeId: 'store1' | 'store2';
}

export default function ScheduleComments({ storeId }: ScheduleCommentsProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>(() => {
        const saved = localStorage.getItem('schedule_comments');
        return saved ? JSON.parse(saved) : [];
    });
    const [newComment, setNewComment] = useState("");

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        const comment: Comment = {
            id: Date.now().toString(),
            author: user.name,
            content: newComment,
            date: new Date().toLocaleDateString(),
            timestamp: Date.now(),
            storeId: storeId,
        };

        const currentAllComments = JSON.parse(localStorage.getItem('schedule_comments') || '[]');
        const updatedAllComments = [comment, ...currentAllComments];

        setComments(updatedAllComments);
        localStorage.setItem('schedule_comments', JSON.stringify(updatedAllComments));
        setNewComment("");
    };

    const handleDelete = (id: string) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        const currentAllComments = JSON.parse(localStorage.getItem('schedule_comments') || '[]');
        const updatedComments = currentAllComments.filter((c: Comment) => c.id !== id);

        setComments(updatedComments);
        localStorage.setItem('schedule_comments', JSON.stringify(updatedComments));
    };

    const displayedComments = comments.filter(c =>
        (c.storeId === storeId) || (!c.storeId && storeId === 'store1')
    );

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">chat</span>
                    {storeId === 'store1' ? '연산점' : '부전점'} 대타/변경 요청
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    근무 변경이나 대타가 필요하면 자유롭게 남겨주세요.
                </p>
            </div>

            {user?.role !== 'boss' && (
                <form onSubmit={handleAddComment} className="mb-6 relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={`${storeId === 'store1' ? '연산점' : '부전점'} 대타 구합니다...`}
                        rows={3}
                        required
                        className="w-full px-4 py-3 pb-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a2632] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none shadow-inner"
                    />
                    <button
                        type="submit"
                        className="absolute bottom-3 right-3 bg-primary hover:bg-blue-600 text-white font-bold py-1.5 px-4 rounded-lg text-sm shadow-sm hover:shadow transition-all"
                    >
                        등록
                    </button>
                </form>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 max-h-[500px]">
                {displayedComments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 dark:border-slate-700/50 rounded-xl">
                        작성된 글이 없습니다.
                    </div>
                ) : (
                    displayedComments.map(comment => (
                        <div key={comment.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                        {comment.author.charAt(0)}
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{comment.author}</span>
                                    <span className="text-xs text-slate-400">{comment.date}</span>
                                </div>
                                {(user?.name === comment.author || user?.role === 'boss') && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                        title="삭제"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                )}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed pl-8">
                                {comment.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
