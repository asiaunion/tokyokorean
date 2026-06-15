const SITE = { scheduledPostMargin: 15 * 60 * 1000 };
function isPass(pub) { return Date.now() > new Date(pub).getTime() - SITE.scheduledPostMargin; }
console.log("nihonbashi:", isPass("2026-04-14T01:05:00Z"));
console.log("serverless:", isPass("2026-04-13T14:15:00Z"));
console.log("tokyo-eq:", isPass("2023-10-27T15:16:12Z"));
