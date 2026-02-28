// src/pages/NoticePage.tsx
import NoticeBoard from "../components/NoticeBoard";
import { MainLayout } from "../components/layout";

export default function NoticePage() {
    return (
        <MainLayout
            title="공지사항"
            description="중요한 소식과 업데이트를 확인하세요."
            breadcrumbs={[
                { label: "홈", path: "/" },
                { label: "공지사항" },
            ]}
        >
            <NoticeBoard />
        </MainLayout>
    );
}
