import { BookOpen, Library, Users, Clock } from "lucide-react";

export default function LibrarianDashboardPage() {
    return (
        <div className="p-8">
            <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
            <p className="mb-8 text-slate-400">
                Welcome to the Library Management System
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Total Books", icon: Library, gradient: "from-indigo-500 to-indigo-700" },
                    { label: "Active Members", icon: Users, gradient: "from-cyan-500 to-cyan-700" },
                    { label: "Issued Today", icon: BookOpen, gradient: "from-violet-500 to-violet-700" },
                    { label: "Overdue", icon: Clock, gradient: "from-amber-500 to-amber-700" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-2xl border border-white/10 bg-white/5 p-6"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm text-slate-400">{stat.label}</span>
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                                <stat.icon className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold">—</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
