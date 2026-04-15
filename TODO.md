# TODO

## Post-Development

- [ ] **Auth page session guard**: Add a server-side check on `/auth/[role]/login` and `/auth/[role]/register` pages to detect an existing valid session (JWT cookie). If a session exists, redirect the user to `/{role}/dashboard` instead of showing the auth form. This prevents authenticated users from seeing login/register pages.
