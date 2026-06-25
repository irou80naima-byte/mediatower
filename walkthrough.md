# Walkthrough — إعادة هيكلة نظام حفظ المشاريع

## ✅ ملخص ما تم إنجازه

تم إعادة هيكلة كاملة لنظام حفظ المشاريع وCanva Nodes في Mediatower PLAN. الهدف: **حفظ موثوق 100% — تعمل، تخرج، تعود وتكمل من حيث توقفت.**

---

## الملفات المُنشأة (10 ملفات جديدة)

| # | الملف | الغرض |
|---|---|---|
| 1 | [project.ts](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/src/types/project.ts) | أنواع مركزية — `Project`, `SerializedNode`, `SaveStatus`, etc. |
| 2 | [libraryItems.ts](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/src/constants/libraryItems.ts) | ثوابت مكتبة العناصر + `findIcon()` + `getYoutubeThumbnail()` |
| 3 | [serialization.ts](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/src/utils/serialization.ts) | تحويل آمن + تحقق من البيانات + تنظيف edges اليتيمة |
| 4 | [useSaveManager.ts](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/src/hooks/useSaveManager.ts) | **قلب النظام الجديد** — auto-save + retry + emergency save |
| 5 | [useProjectsManager.ts](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/src/hooks/useProjectsManager.ts) | CRUD مركزي للمشاريع |
| 6 | [CustomNode.tsx](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/src/components/flow/CustomNode.tsx) | مكون العقدة (shape, social, text, wireframe) |
| 7 | [NodeInspector.tsx](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/src/components/flow/NodeInspector.tsx) | لوحة تحرير العقدة |
| 8 | [LibraryPanel.tsx](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/src/components/flow/LibraryPanel.tsx) | مكتبة السحب والإفلات |
| 9 | [FlowToolbar.tsx](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/src/components/flow/FlowToolbar.tsx) | شريط أدوات AI Generation |
| 10 | [FlowEditor.tsx](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/src/components/flow/FlowEditor.tsx) | المحرر الرئيسي — يجمع كل المكونات |

## الملفات المُعدّلة (4 ملفات)

| # | الملف | التغيير |
|---|---|---|
| 1 | [App.tsx](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/src/App.tsx) | **من 1646 سطر → 330 سطر** (−80%) |
| 2 | [apiClient.ts](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/src/services/apiClient.ts) | +Request timeout (30s), أخطاء أوضح |
| 3 | [projects.php](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/myapp/api/projects.php) | +JSON validation, +Size limit (10MB), +Save confirmation |
| 4 | [index.php](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/myapp/api/index.php) | +`_method` override لدعم sendBeacon |
| 5 | [config.php](file:///c:/Users/nordi/Downloads/mediatower-main/mediatower-main/myapp/api/config.php) | +`_token` fallback لحفظ الطوارئ |

---

## نظام الحفظ الجديد — كيف يعمل

### 🔄 الحفظ التلقائي (Auto-Save)
- عند أي تغيير (نقل/إضافة/حذف/تعديل node) → ينتظر **2 ثانية** ثم يحفظ
- إذا غيّرت شيئاً آخر خلال الثانيتين → يُعاد العد من البداية
- **لا يتداخل** مع الحفظ اليدوي

### 💾 الحفظ اليدوي (Manual Save)
- الضغط على زر "حفظ" → يحفظ **فوراً** ويلغي أي auto-save معلق

### 🔁 إعادة المحاولة (Retry)
- إذا فشل الحفظ → يعيد المحاولة **3 مرات** مع فترات انتظار متزايدة (1s, 2s, 4s)

### 🚨 حفظ الطوارئ (Emergency Save)
- عند **إغلاق الصفحة** أو التنقل بعيداً مع وجود تغييرات غير محفوظة:
  - يظهر **تحذير** للمستخدم
  - يُرسل **حفظ طوارئ** عبر `navigator.sendBeacon` (أموثق طريقة للحفظ أثناء الإغلاق)

### ✅ التحقق قبل الحفظ (Validation)
- إزالة edges يتيمة (تشير لـ nodes محذوفة)
- إزالة nodes مكررة الـ ID
- تحذير إذا كان حجم البيانات > 10MB
- التحقق من صحة JSON في Backend

### 🆔 Node IDs آمنة
- بدلاً من `Date.now()` فقط (قد يتكرر) → `timestamp-randomstring`

---

## نتائج البناء

```
✓ 2278 modules transformed
✓ built in 5.14s

dist/index.html                   0.40 kB
dist/assets/index-BomRc1DI.css   68.22 kB (gzip: 11.76 kB)
dist/assets/index-Cgjp8nu1.js   954.07 kB (gzip: 267.55 kB)
```

> Build successful — **صفر أخطاء** ✅

---

## الهيكلة الجديدة

```
src/
├── types/
│   └── project.ts              ✅ NEW
├── utils/
│   └── serialization.ts        ✅ NEW
├── hooks/
│   ├── useSaveManager.ts       ✅ NEW
│   └── useProjectsManager.ts   ✅ NEW
├── constants/
│   └── libraryItems.ts         ✅ NEW
├── components/
│   ├── Workspace.tsx            — (unchanged)
│   └── flow/
│       ├── CustomNode.tsx       ✅ NEW
│       ├── NodeInspector.tsx    ✅ NEW
│       ├── LibraryPanel.tsx     ✅ NEW
│       ├── FlowEditor.tsx       ✅ NEW
│       └── FlowToolbar.tsx      ✅ NEW
├── services/
│   ├── apiClient.ts             ✅ IMPROVED
│   └── geminiService.ts         — (unchanged)
├── App.tsx                      ✅ SLIMMED (1646→330 lines)
├── main.tsx                     — (unchanged)
└── index.css                    — (unchanged)
```

---

## للنشر على Coolify

### 1. ارفع التغييرات على GitHub
```bash
cd c:\Users\nordi\Downloads\mediatower-main\mediatower-main
git add -A
git commit -m "feat: restructure save system - robust auto-save with retry and emergency save"
git push origin main
```

### 2. في Coolify
- أنشئ مشروع جديد → ربطه بـ GitHub repo
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables** المطلوبة:
  - `VITE_API_BASE` = رابط الـ API (مثلاً `https://api.yourdomain.com/index.php`)
  - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`

### 3. إعداد اسم النطاق
- في Coolify → Settings → Custom Domains → أضف نطاقك
- أضف سجل DNS: `A record` يشير لـ IP سيرفر Coolify
