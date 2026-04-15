"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, LogIn, Mail, Lock } from "lucide-react";

export default function LoginPage() {
    const params = useParams();
    const role = params.role as string;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const roleLabel = role === "librarian" ? "Librarian" : "Student";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
                setLoading(false);
                return;
            }

            /* data.role is always "student" or "librarian" (from DB) */
            const target = !data.onboardingComplete
                ? `/onboarding/${data.role}`
                : `/${data.role}/dashboard`;
            window.location.href = target;
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
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark">
                        <BookOpen className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="mb-1 text-2xl font-bold text-white">Welcome back</h1>
                    <p className="text-sm text-muted">Sign in to your account</p>
                    <div className="mt-3 flex justify-center">
                        <span className="role-badge">{roleLabel}</span>
                    </div>
                </div>

                {error && <div className="auth-error mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="auth-label">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@university.edu"
                                className="auth-input pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="auth-label">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="auth-input pl-10"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="auth-btn">
                        <span className="flex items-center justify-center gap-2">
                            <LogIn className="h-4 w-4" />
                            {loading ? "Signing in…" : "Sign In"}
                        </span>
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted">
                    Don&apos;t have an account?{" "}
                    <Link href={`/auth/${role}/register`} className="auth-link">
                        Create one
                    </Link>
                </p>

                <p className="mt-3 text-center text-xs text-muted/60">
                    {role === "student" ? (
                        <Link href="/auth/librarian/login" className="auth-link text-xs">
                            Sign in as Librarian →
                        </Link>
                    ) : (
                        <Link href="/auth/student/login" className="auth-link text-xs">
                            Sign in as Student →
                        </Link>
                    )}
                </p>
            </div>
        </div>
    );
}
