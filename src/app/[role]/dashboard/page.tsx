import { BookOpen, Library, Users, Clock } from "lucide-react";

export default async function DashboardPage({
    params,
}: {
    params: Promise<{ role: string }>;
}) {
    const { role } = await params;
    const isLibrarian = role === "librarian";

    return (
        <>
            {/* Header */}
            <header className="border-b border-white/10 px-6 py-4">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5]">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold">LibraryMS</span>
                    </div>
                    <span className="role-badge">
                        {isLibrarian ? "Librarian" : "Student"}
                    </span>
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto max-w-7xl px-6 py-10">
                <h1 className="mb-2 text-3xl font-bold">
                    {isLibrarian ? "Admin Dashboard" : "Student Dashboard"}
                </h1>
                <p className="mb-8 text-[#94a3b8]">
                    Welcome to the Library Management System
                </p>

                {/* Stat cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            label: "Total Books",
                            value: "—",
                            icon: Library,
                            gradient: "from-[#6366f1] to-[#4f46e5]",
                        },
                        {
                            label: "Active Members",
                            value: "—",
                            icon: Users,
                            gradient: "from-[#06b6d4] to-[#0891b2]",
                        },
                        {
                            label: "Issued Today",
                            value: "—",
                            icon: BookOpen,
                            gradient: "from-[#8b5cf6] to-[#7c3aed]",
                        },
                        {
                            label: "Overdue",
                            value: "—",
                            icon: Clock,
                            gradient: "from-[#f59e0b] to-[#d97706]",
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm text-[#94a3b8]">{stat.label}</span>
                                <div
                                    className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient}`}
                                >
                                    <stat.icon className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
}
