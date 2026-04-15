# TODO

## Post-Development

- [ ] **Auth page session guard**: Add a server-side check on `/auth/[role]/login` and `/auth/[role]/register` pages to detect an existing valid session (JWT cookie). If a session exists, redirect the user to `/{role}/dashboard` instead of showing the auth form. This prevents authenticated users from seeing login/register pages.

- [ ] **Platform-wide notification system**: Design and implement a notification system across the entire platform (students + librarians). This includes a `notifications` table, real-time delivery (Supabase Realtime or polling), a notification bell with unread count, and a notification panel/dropdown. Notifications should cover events like: issue request approved/rejected, book due date reminders, procurement request updates, and overdue alerts.