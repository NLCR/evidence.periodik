Frontend rules:

- Use MUI elements when possible
- For data fetching, use tanstack react query
- Define form validation in a Zod schema and connect it to React Hook Form with `zodResolver`. Do not put validation in `Controller` or `register` rules.
- Avoid unnecessary partial type/DTO definitions
- Decompose properly
- Focus on maintainability and readability
- Respect project folder structure
- Use MUI icons, avoid creating your own
- All labels and texts must be localized into CZ, SK, EN using i18n
- Show errors, warnings, and other notifications as toasts. Never use custom banners, inline alerts, or strips for notifications.
- Keep HTTP error localization in `src/api/mapApiError.ts`: use explicit status and message or code matches, keep toast display separate, and never show raw backend error text to users.
- Do not write FE tests
- Avoid unnecessary useEffect hooks. Prefer using callbacks
- Avoid thin function wrappers
- Try to reuse existing types as much as possible
