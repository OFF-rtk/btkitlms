"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, UserPlus, Mail, Lock, User, CheckCircle } from "lucide-react";

export default function RegisterPage() {
    const params = useParams();
    const role = params.role as string;

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const roleLabel = role === "librarian" ? "Librarian" : "Student";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: fullName,
                    email,
                    password,
                    role, /* "student" or "librarian" — sent as-is */
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Registration failed");
                setLoading(false);
                return;
            }

            /* Email confirmation required */
            if (data.emailConfirmation) {
                setEmailSent(true);
                setLoading(false);
                return;
            }

            /* No email confirmation — go straight to onboarding */
            window.location.href = `/onboarding/${role}`;
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    }

    /* ── Registration complete screen ── */
    if (emailSent) {
        return (
            <div className="auth-gradient relative flex items-center justify-center overflow-hidden px-4">
                <div className="orb orb-1" />
                <div className="orb orb-2" />

                <div className="glass-card relative z-10 w-full max-w-md p-8 sm:p-10 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 ring-1 ring-green-500/30">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-white">
                        Registration Complete
                    </h1>
                    <p className="mb-6 text-sm text-muted leading-relaxed">
                        Your account has been created successfully.
                        <br />
                        Continue to set up your profile.
                    </p>
                    {/* TODO: Re-enable when email verification is turned back on
                    <p className="mb-6 text-sm text-muted leading-relaxed">
                        We&apos;ve sent a confirmation link to{" "}
                        <span className="font-medium text-white">{email}</span>.
                        Please verify your email to activate your account.
                    </p>
                    */}
                    <a href={`/onboarding/${role}`} className="auth-btn inline-block text-center">
                        Continue to Onboarding
                    </a>
                </div>
            </div>
        );
    }

    /* ── Registration form ── */
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
                    <h1 className="mb-1 text-2xl font-bold text-white">
                        Create your account
                    </h1>
                    <p className="text-sm text-muted">Join the library management system</p>
                    <div className="mt-3 flex justify-center">
                        <span className="role-badge">{roleLabel}</span>
                    </div>
                </div>

                {error && <div className="auth-error mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="fullName" className="auth-label">
                            Full name
                        </label>
                        <div className="relative">
                            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                            <input
                                id="fullName"
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Jane Doe"
                                className="auth-input pl-10"
                            />
                        </div>
                    </div>

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
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Min. 6 characters"
                                className="auth-input pl-10"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="auth-btn">
                        <span className="flex items-center justify-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            {loading ? "Creating account…" : "Create Account"}
                        </span>
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted">
                    Already have an account?{" "}
                    <Link href={`/auth/${role}/login`} className="auth-link">
                        Sign in
                    </Link>
                </p>

                <p className="mt-3 text-center text-xs text-muted/60">
                    {role === "student" ? (
                        <Link href="/auth/librarian/register" className="auth-link text-xs">
                            Register as Librarian →
                        </Link>
                    ) : (
                        <Link href="/auth/student/register" className="auth-link text-xs">
                            Register as Student →
                        </Link>
                    )}
                </p>
            </div>
        </div>
    );
}
