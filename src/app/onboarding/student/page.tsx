"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react";

const COURSES = ["B.Tech", "M.Tech", "B.Sc", "M.Sc", "BCA", "MCA", "MBA", "Ph.D"];
const BRANCHES = [
    "Computer Science",
    "Electrical",
    "Mechanical",
    "Civil",
    "Electronics",
    "Information Technology",
    "Chemical",
    "Biotechnology",
];
const YEARS = [1, 2, 3, 4, 5];

export default function StudentOnboardingPage() {
    const router = useRouter();

    const [rollNumber, setRollNumber] = useState("");
    const [course, setCourse] = useState("");
    const [branch, setBranch] = useState("");
    const [year, setYear] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    role: "student",
                    roll_number: rollNumber,
                    course,
                    branch,
                    year: year ? Number(year) : null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Onboarding failed");
                return;
            }

            router.push("/student/dashboard");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-gradient relative flex items-center justify-center overflow-hidden px-4">
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            <div className="glass-card relative z-10 w-full max-w-lg p-8 sm:p-10">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                        <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="mb-1 text-2xl font-bold text-white">
                        Complete your profile
                    </h1>
                    <p className="text-sm text-muted">
                        A few more details to get you started
                    </p>

                    {/* Step indicator */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="step-dot active" />
                        <div className="h-px w-8 bg-white/20" />
                        <span className="step-dot" />
                    </div>
                </div>

                {error && <div className="auth-error mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Roll number */}
                    <div>
                        <label htmlFor="rollNumber" className="auth-label">
                            Roll Number <span className="text-error">*</span>
                        </label>
                        <input
                            id="rollNumber"
                            type="text"
                            required
                            value={rollNumber}
                            onChange={(e) => setRollNumber(e.target.value)}
                            placeholder="e.g. 21CS1044"
                            className="auth-input"
                        />
                    </div>

                    {/* Course */}
                    <div>
                        <label htmlFor="course" className="auth-label">
                            Course
                        </label>
                        <select
                            id="course"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            className="auth-select"
                        >
                            <option value="">Select course</option>
                            {COURSES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Branch */}
                    <div>
                        <label htmlFor="branch" className="auth-label">
                            Branch
                        </label>
                        <select
                            id="branch"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className="auth-select"
                        >
                            <option value="">Select branch</option>
                            {BRANCHES.map((b) => (
                                <option key={b} value={b}>
                                    {b}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Year */}
                    <div>
                        <label htmlFor="year" className="auth-label">
                            Year
                        </label>
                        <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="auth-select"
                        >
                            <option value="">Select year</option>
                            {YEARS.map((y) => (
                                <option key={y} value={y}>
                                    Year {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" disabled={loading} className="auth-btn">
                        <span className="flex items-center justify-center gap-2">
                            {loading ? "Saving…" : "Continue to Dashboard"}
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}
