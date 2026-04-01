const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// تخزين المستخدمين النشطين
// المفتاح: معرف فريد للمستخدم (مثلاً HWID_UserId)
// القيمة: آخر وقت تم استلام نبضة فيه
const activeUsers = new Map();
const TIMEOUT = 60000; // 60 ثانية بالميلي ثانية

// دالة تنظيف دورية
setInterval(() => {
    const now = Date.now();
    for (const [userId, lastSeen] of activeUsers.entries()) {
        if (now - lastSeen > TIMEOUT) {
            activeUsers.delete(userId);
        }
    }
}, 10000); // كل 10 ثوانٍ

// نقطة استقبال النبضات
app.post('/heartbeat', (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: 'Missing user_id' });
    }
    activeUsers.set(user_id, Date.now());
    res.json({ status: 'ok', active_count: activeUsers.size });
});

// نقطة جلب العدد الحالي
app.get('/online_count', (req, res) => {
    res.json({ count: activeUsers.size });
});

// نقطة صحية للتحقق
app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
