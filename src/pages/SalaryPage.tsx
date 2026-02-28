// src/pages/SalaryPage.tsx
import SalaryCalculator from "../components/SalaryCalculator";
import { MainLayout } from "../components/layout";

export default function SalaryPage() {
    return (
        <MainLayout
            title="급여 계산기"
            description="근무 기록을 바탕으로 예상 급여를 계산합니다."
            breadcrumbs={[
                { label: "홈", path: "/" },
                { label: "급여 계산기" },
            ]}
        >
            <div className="bg-white dark:bg-[#1e2936] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 lg:p-8">
                <SalaryCalculator />
            </div>
        </MainLayout>
    );
}
