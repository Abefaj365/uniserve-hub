import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    title: "1. Problem Statement",
    content: `Students of BGC Trust University Bangladesh face difficulties in reporting complaints and service requests related to hostel, laboratory, exams, transport, and campus facilities. The current manual process is slow, lacks transparency, and provides no way to track complaint status. This system aims to digitize the entire complaint lifecycle.`,
  },
  {
    title: "2. Objectives",
    content: `• Provide students with an easy-to-use platform for submitting complaints\n• Enable automatic routing of complaints to relevant departments\n• Implement real-time status tracking for all stakeholders\n• Provide admin with analytics for data-driven decision making\n• Ensure transparency and accountability in the resolution process`,
  },
  {
    title: "3. Project Scope",
    content: `The system covers complaint submission, department assignment, status tracking, file attachments, notifications, analytics, and role-based access for Students, Department Officers, and Administrators. It does not include integration with external university ERP systems in this version.`,
  },
  {
    title: "4. Feasibility Study",
    content: `Technical Feasibility: The system uses modern web technologies (React, Node.js, PostgreSQL) which are well-documented, open-source, and free to use.\n\nEconomic Feasibility: Minimal cost as it uses free tools and can be hosted on free-tier cloud platforms. The development team consists of CSE students.\n\nOperational Feasibility: The system replaces a manual process. Training is minimal as the interface is intuitive. University administration is supportive.`,
  },
  {
    title: "5. Functional Requirements",
    content: `FR1: Students can register and log in securely\nFR2: Students can submit complaints with category, department, description, and file attachments\nFR3: System assigns complaints to the correct department officer\nFR4: Officers can update complaint status (Pending → In Progress → Resolved → Closed)\nFR5: Students can track complaint status in real-time\nFR6: Admin can manage users, departments, and generate reports\nFR7: System sends notifications on status changes\nFR8: Students can provide feedback after complaint resolution`,
  },
  {
    title: "6. Non-Functional Requirements",
    content: `NFR1: Response time < 3 seconds for any page load\nNFR2: System must support 500+ concurrent users\nNFR3: Data must be encrypted in transit (HTTPS) and at rest\nNFR4: System must be responsive (mobile + desktop)\nNFR5: 99.9% uptime availability\nNFR6: Passwords must be hashed using bcrypt`,
  },
  {
    title: "7. Actors Identification",
    content: `Primary Actors:\n• Student – Submits and tracks complaints\n• Department Officer – Manages and resolves assigned complaints\n• Admin – Manages the entire system\n\nSecondary Actors:\n• Email/Notification Service – Sends status update notifications\n• Database System – Stores all data`,
  },
  {
    title: "14. Database Schema (SQL)",
    content: `-- Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admins Table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    officer_name VARCHAR(100),
    officer_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints Table
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    complaint_id VARCHAR(20) UNIQUE NOT NULL,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    priority VARCHAR(10) DEFAULT 'Medium',
    assigned_officer VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaint Status History
CREATE TABLE complaint_status_history (
    id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    changed_by VARCHAR(100),
    remarks TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attachments Table
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback Table
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
    student_id INT REFERENCES students(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
  },
  {
    title: "15. Testing Plan",
    content: `Unit Testing: Test individual components (login, form validation, status updates)\nIntegration Testing: Test data flow between frontend and backend\nSystem Testing: End-to-end test of complete complaint lifecycle\nUser Acceptance Testing: Have 5-10 students test the system and provide feedback\n\nTest Cases:\n• TC1: Student registration with valid/invalid data\n• TC2: Login with correct/incorrect credentials\n• TC3: Submit complaint and verify database entry\n• TC4: Officer updates status, student sees change\n• TC5: Admin generates report and verifies data accuracy`,
  },
  {
    title: "16. Limitations",
    content: `• No real-time chat between student and officer (future scope)\n• No SMS notifications (only email/in-app)\n• No integration with existing university ERP\n• No mobile native app (responsive web only)\n• No AI-based complaint categorization in this version`,
  },
  {
    title: "17. Future Improvements",
    content: `• AI-powered automatic complaint categorization and priority assignment\n• Real-time chat between students and officers\n• Mobile native application (React Native)\n• Integration with university ERP/LMS\n• SMS and push notifications\n• Multi-language support (Bangla + English)\n• Anonymous complaint submission option\n• Sentiment analysis on complaints`,
  },
];

export default function Documentation() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">System Analysis & Design Documentation</h1>
          <p className="mt-3 text-muted-foreground">Smart University Complaint & Service Request Management System</p>
          <p className="text-sm text-muted-foreground mt-1">BGC Trust University Bangladesh — CSE Department</p>
        </div>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <Card key={i} className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg">{s.title}</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-body leading-relaxed">{s.content}</pre>
              </CardContent>
            </Card>
          ))}

          {/* Diagrams section */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">8–13. System Diagrams</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Use Case Diagram (Textual)</h4>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-body leading-relaxed bg-muted/50 p-4 rounded-lg">{`Actors: Student, Officer, Admin

Student:
  → Register / Login
  → Submit Complaint
  → Track Complaint Status
  → Upload Attachments
  → Provide Feedback

Department Officer:
  → View Assigned Complaints
  → Update Status
  → Communicate with Student
  → Close Complaint

Admin:
  → Manage Users
  → Manage Departments
  → Assign Complaints
  → Set Priority / Deadline
  → Generate Reports`}</pre>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">ER Diagram (Textual)</h4>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-body leading-relaxed bg-muted/50 p-4 rounded-lg">{`[Students] 1 ─── * [Complaints] * ─── 1 [Departments]
                         │
                    1 ─── * [Attachments]
                    1 ─── * [Status History]
                    1 ─── 1 [Feedback]

[Admins] ─── manages ─── [Departments]`}</pre>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">DFD Level 0 (Context Diagram)</h4>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-body leading-relaxed bg-muted/50 p-4 rounded-lg">{`[Student] → Complaint Data → [Complaint Management System] → Status Updates → [Student]
[Officer] ← Assigned Complaints ← [System] → Resolution Data → [Officer]
[Admin] ← Reports ← [System] → System Config → [Admin]`}</pre>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Activity Diagram (Flow)</h4>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-body leading-relaxed bg-muted/50 p-4 rounded-lg">{`Start → Student Login → Submit Complaint → System Assigns to Department
  → Officer Reviews → Update Status (In Progress)
  → Officer Resolves → Update Status (Resolved)
  → Student Reviews → Provides Feedback → End`}</pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}