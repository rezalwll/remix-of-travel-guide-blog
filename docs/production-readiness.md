# ماتریس آمادگی production

| حوزه | وضعیت | توضیح |
|---|---|---|
| React/Vite و Fastify core | READY | build و runtime موجود است |
| PostgreSQL و migration deploy | READY WITH LIMITATION | DB خارجی و backup retention مسئولیت deployment است |
| container/non-root/graceful shutdown | READY | targetهای API/proxy، کاربر non-root، smoke CI و bounded shutdown اضافه شد |
| health/version/log redaction | READY | live/ready/version و JSON log موجود است |
| backup/restore verification | READY WITH LIMITATION | ابزار ساخت/حذف DB disposable موجود است؛ اجرای دوره‌ای به pg tools و DB admin عملیاتی نیاز دارد |
| reverse proxy/TLS | READY WITH LIMITATION | Nginx نمونه است و certificate واقعی بیرونی است |
| rate limit | READY WITH LIMITATION | فقط single replica؛ distributed store نداریم |
| mock provider architecture | READY | fail-closed و sandbox |
| SMS واقعی | BLOCKED ON EXTERNAL CREDENTIALS | adapter/credential واقعی در repository نیست |
| payment واقعی | BLOCKED ON EXTERNAL CREDENTIALS | merchant/secret/contract لازم است |
| flight/hotel supplier واقعی | BLOCKED ON EXTERNAL CONTRACT/API | فقط mock فعال است |
| CI PostgreSQL integration | READY | service، migration و test API در CI موجود است |
| API-connected Playwright | READY | CI با PostgreSQL واقعی، migration، seed، API و Vite proxy اجرا می‌کند |
| admin panel | DEFERRED / OUT OF SCOPE | عمداً ساخته نمی‌شود |
| data retention automation | DEFERRED | تا تعیین legal/product policy حذف خودکار نداریم |
