# 🎓 Student Portal - Quick Reference Card

## 📦 Service Layer

### Import

```typescript
import studentPortalService from "../../services/studentPortal.service";
import type {
  StudentProfile,
  AttendanceSummary,
} from "../../services/studentPortal.service";
```

### API Methods

```typescript
// Get student profile
const profile = await studentPortalService.getMyProfile();

// Get section details with subjects and teachers
const section = await studentPortalService.getMySectionDetails();

// Get attendance records with filters
const records = await studentPortalService.getMyAttendance({
  subject: "subjectId",
  startDate: "2026-01-01",
  endDate: "2026-01-31",
  page: 1,
  limit: 20,
});

// Get attendance statistics
const stats = await studentPortalService.getMyAttendanceStats("subjectId"); // optional

// Get attendance summary (overall + subject-wise)
const summary = await studentPortalService.getMyAttendanceSummary();

// Get classmates
const classmates = await studentPortalService.getMyClassmates();
```

### Helper Methods

```typescript
// Format date: "Jan 16, 2026"
studentPortalService.formatDate(dateString);

// Format date & time: "Jan 16, 2026, 02:30 PM"
studentPortalService.formatDateTime(dateString);

// Get status color classes
studentPortalService.getStatusColor("Present"); // Returns Tailwind classes

// Get percentage color
studentPortalService.getPercentageColor(85); // Returns color class

// Get status badge
studentPortalService.getStatusBadge(85); // Returns { text: 'Excellent', color: '...' }
```

---

## 📄 Pages & Routes

| Page       | Route                 | Component               | Purpose                   |
| ---------- | --------------------- | ----------------------- | ------------------------- |
| Dashboard  | `/student/dashboard`  | `StudentDashboard`      | Overview & quick stats    |
| Section    | `/student/section`    | `SectionDetailsPage`    | Section & subject details |
| Attendance | `/student/attendance` | `AttendanceRecordsPage` | Attendance history        |
| Statistics | `/student/statistics` | `StudentStatisticsPage` | Analytics & charts        |
| Classmates | `/student/classmates` | `ClassmatesPage`        | Classmates list           |
| Settings   | `/student/settings`   | Placeholder             | User settings             |

---

## 🎨 UI Components

### StatCard (Dashboard)

```typescript
<StatCard
  title="Total Classes"
  value="64"
  subtitle="32 Present"
  icon={<Calendar className="w-6 h-6" />}
  color="bg-blue-500"
  trend="85%"
/>
```

### InfoCard (Section Details)

```typescript
<InfoCard
  icon={<Users className="w-5 h-5 text-blue-600" />}
  label="Section"
  value="CS-A"
/>
```

### StatusBreakdownItem (Statistics)

```typescript
<StatusBreakdownItem
  icon={<CheckCircle className="w-5 h-5 text-green-600" />}
  label="Present"
  count={50}
  total={64}
  color="bg-green-500"
/>
```

### ClassmateCard (Classmates)

```typescript
<ClassmateCard classmate={classmateData} />
```

---

## 🎨 Color System

### Status Colors

```typescript
const STATUS_COLORS = {
  Present: "#10b981", // Green
  Absent: "#ef4444", // Red
  Late: "#f59e0b", // Orange
  Leave: "#3b82f6", // Blue
  Excused: "#8b5cf6", // Purple
};
```

### Performance Colors

```typescript
percentage >= 85  → Green  (Excellent)
percentage >= 75  → Orange (Good)
percentage < 75   → Red    (Low)
```

---

## 📊 TypeScript Interfaces

### StudentProfile

```typescript
interface StudentProfile {
  _id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: "active" | "inactive" | "graduated" | "expelled";
  section: {
    _id: string;
    name: string;
    academicYear: string;
    semester: string;
    program: { name; code; duration; level };
    college: { name; code; city };
  };
}
```

### AttendanceRecord

```typescript
interface AttendanceRecord {
  _id: string;
  date: string;
  period: number;
  status: "Present" | "Absent" | "Late" | "Leave" | "Excused";
  remarks?: string;
  subject: { _id; name; code };
  section: { _id; name };
  markedBy: { _id; firstName; lastName };
  createdAt: string;
}
```

### AttendanceStats

```typescript
interface AttendanceStats {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  excused: number;
  attendancePercentage: number;
  statusBreakdown: Array<{ status; count; percentage }>;
}
```

### AttendanceSummary

```typescript
interface AttendanceSummary {
  overallStats: AttendanceStats;
  subjectWiseStats: Array<{
    subject: { _id; name; code };
    stats: AttendanceStats;
  }>;
}
```

---

## 🔧 Common Patterns

### Data Fetching Pattern

```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState<Type | null>(null);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    setLoading(true);
    const result = await studentPortalService.method();
    setData(result);
  } catch (error: any) {
    showToast(error.response?.data?.message || "Error message", "error");
  } finally {
    setLoading(false);
  }
};
```

### Loading State

```typescript
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

### Error State

```typescript
if (!data) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load data</p>
      </div>
    </div>
  );
}
```

### Empty State

```typescript
{
  data.length === 0 && (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className="w-12 h-12 text-gray-400 mb-4" />
      <p className="text-gray-600 text-lg font-medium">No data found</p>
      <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
    </div>
  );
}
```

### Back Navigation

```typescript
<button
  onClick={() => navigate("/student/dashboard")}
  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
>
  <ArrowLeft className="w-5 h-5 text-gray-600" />
</button>
```

---

## 📊 Recharts Integration

### Pie Chart Setup

```typescript
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const chartData = [
  { name: "Present", value: 50, color: "#10b981" },
  { name: "Absent", value: 10, color: "#ef4444" },
  // ...
];

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={chartData}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, percent }) =>
        `${name}: ${percent ? (percent * 100).toFixed(1) : "0.0"}%`
      }
      outerRadius={100}
      dataKey="value"
    >
      {chartData.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>;
```

---

## 🎯 Pagination Pattern

### Implementation

```typescript
const [filters, setFilters] = useState<AttendanceFilters>({
  page: 1,
  limit: 20,
});

const handlePageChange = (newPage: number) => {
  setFilters((prev) => ({ ...prev, page: newPage }));
};

// Pagination UI
<div className="flex items-center gap-2">
  <button
    onClick={() => handlePageChange(page - 1)}
    disabled={page === 1}
    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
  >
    <ChevronLeft className="w-5 h-5" />
  </button>
  <span>
    Page {page} of {totalPages}
  </span>
  <button
    onClick={() => handlePageChange(page + 1)}
    disabled={page === totalPages}
    className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
  >
    <ChevronRight className="w-5 h-5" />
  </button>
</div>;
```

---

## 🔍 Filter Pattern

### Subject + Date Range

```typescript
const [filters, setFilters] = useState<AttendanceFilters>({});

const handleFilterChange = (key: keyof AttendanceFilters, value: any) => {
  setFilters((prev) => ({
    ...prev,
    [key]: value,
    page: 1, // Reset to first page
  }));
};

const clearFilters = () => {
  setFilters({ page: 1, limit: 20 });
};

// Filter UI
<select
  value={filters.subject || ''}
  onChange={(e) => handleFilterChange('subject', e.target.value || undefined)}
>
  <option value="">All Subjects</option>
  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
</select>

<input
  type="date"
  value={filters.startDate || ''}
  onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
/>
```

---

## 🎨 Status Badge Component

```typescript
<span
  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${studentPortalService.getStatusColor(
    status
  )}`}
>
  {getStatusIcon(status)}
  {status}
</span>
```

---

## 📱 Responsive Grid

```typescript
// 3 columns on desktop, 2 on tablet, 1 on mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// 4 columns for stats
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
</div>
```

---

## 🔗 Navigation Usage

```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Navigate to different pages
navigate("/student/dashboard");
navigate("/student/section");
navigate("/student/attendance");
navigate("/student/statistics");
navigate("/student/classmates");
```

---

## 🎨 Gradient Header Card

```typescript
<div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
  <div className="flex items-center gap-4">
    <div className="bg-white/20 p-4 rounded-lg">
      <Icon className="w-8 h-8" />
    </div>
    <div>
      <p className="text-blue-100 text-sm">Label</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </div>
</div>
```

---

## 📊 Progress Bar

```typescript
<div className="bg-gray-200 rounded-full h-2">
  <div
    className={`h-2 rounded-full ${
      percentage >= 85
        ? "bg-green-500"
        : percentage >= 75
        ? "bg-orange-500"
        : "bg-red-500"
    }`}
    style={{ width: `${Math.min(percentage, 100)}%` }}
  />
</div>
```

---

## ✅ Quick Checklist

### Page Implementation:

- [ ] Import service and types
- [ ] Setup state (loading, data, filters)
- [ ] Implement data fetching with useEffect
- [ ] Add loading state
- [ ] Add error state
- [ ] Add empty state
- [ ] Implement main UI
- [ ] Add sub-components
- [ ] Test functionality

### Code Quality:

- [ ] No TypeScript errors
- [ ] No unused imports
- [ ] Proper error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Clean code structure
- [ ] Consistent naming
- [ ] Comments where needed

---

## 🚀 Performance Tips

1. **Use Promise.all** for parallel API calls
2. **Implement pagination** for large datasets
3. **Use client-side filtering** for small datasets (classmates)
4. **Use server-side filtering** for large datasets (attendance)
5. **Add loading states** to prevent multiple fetches
6. **Use proper dependencies** in useEffect
7. **Avoid unnecessary re-renders**

---

## 📚 Common Icons Used

```typescript
import {
  Calendar, // Dates, attendance
  BookOpen, // Subjects, classes
  CheckCircle, // Present status
  XCircle, // Absent status
  Clock, // Late status
  FileText, // Leave/Excused
  TrendingUp, // Statistics, trends
  Users, // Classmates, groups
  User, // Individual student
  GraduationCap, // Academic, section
  Building2, // College, institution
  Mail, // Email contact
  Phone, // Phone contact
  ArrowLeft, // Back navigation
  AlertCircle, // Errors, warnings
  Search, // Search functionality
  Filter, // Filters
  Settings, // Settings page
  Award, // Achievements, programs
  Layers, // Sections, levels
} from "lucide-react";
```

---

## 🎉 Summary

**Total Pages:** 5  
**Total Lines:** ~1,870  
**Service Methods:** 6  
**Helper Methods:** 5  
**TypeScript Interfaces:** 8  
**Status:** ✅ Complete

---

**Quick Start:** Import service → Fetch data → Display UI → Handle states  
**Design System:** Tailwind CSS + Lucide Icons  
**Charts:** Recharts (Pie Chart)  
**Quality:** Production Ready 🚀
