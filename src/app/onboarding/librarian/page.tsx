"use client";

import { useState } from "react";
import { Shield, ArrowRight, BadgeCheck } from "lucide-react";

export default function LibrarianOnboardingPage() {
    const [employeeId, setEmployeeId] = useState("");
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
                    role: "librarian",
                    employee_id: employeeId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Onboarding failed");
                setLoading(false);
                return;
            }

            window.location.href = "/librarian/dashboard";
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    }

    return (
        <div className="auth-gradient relative flex items-center justify-center overflow-hidden px-4">
            <div className="orb orb-1" />
            <div className="orb orb-2" />

            <div className="glass-card relative z-10 w-full max-w-md p-8 sm:p-10">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                        <Shield className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="mb-1 text-2xl font-bold text-white">
                        Librarian Setup
                    </h1>
                    <p className="text-sm text-muted">
                        Verify your employee identity to continue
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
                    <div>
                        <label htmlFor="employeeId" className="auth-label">
                            Employee ID <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                            <BadgeCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <input
                                id="employeeId"
                                type="text"
                                required
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder="e.g. LIB-2024-0042"
                                className="auth-input pl-10"
                            />
                        </div>
                        <p className="mt-1.5 text-xs text-muted/60">
                            Your employee ID issued by the institution
                        </p>
                    </div>

                    <button type="submit" disabled={loading} className="auth-btn">
                        <span className="flex items-center justify-center gap-2">
                            {loading ? "Verifying…" : "Continue to Dashboard"}
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}
