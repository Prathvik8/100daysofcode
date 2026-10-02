import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_document():
    doc = Document()

    # Set standard margins (1 inch)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Color Palette definitions
    PRIMARY_HEX = "9E1B32"      # Deep Crimson / GAT ACM
    SECONDARY_HEX = "1E293B"    # Dark Slate
    ACCENT_HEX = "E11D48"       # Rose Accent
    LIGHT_BG_HEX = "F8FAFC"     # Light background for callouts
    BORDER_HEX = "CBD5E1"       # Light Slate border

    COLOR_PRIMARY = RGBColor(158, 27, 50)
    COLOR_DARK = RGBColor(30, 41, 59)
    COLOR_MUTED = RGBColor(100, 116, 139)
    COLOR_WHITE = RGBColor(255, 255, 255)

    def set_cell_background(cell, hex_color):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    def add_callout(text, title="NOTE / ARCHITECTURE HIGHLIGHT"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        set_cell_background(cell, LIGHT_BG_HEX)
        set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
        
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="none"/>
                <w:left w:val="single" w:sz="24" w:space="0" w:color="{PRIMARY_HEX}"/>
                <w:bottom w:val="none"/>
                <w:right w:val="none"/>
            </w:tcBorders>
        ''')
        tcPr.append(borders)

        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        run_title = p.add_run(f"{title}: ")
        run_title.bold = True
        run_title.font.name = "Calibri"
        run_title.font.size = Pt(10)
        run_title.font.color.rgb = COLOR_PRIMARY

        run_text = p.add_run(text)
        run_text.font.name = "Calibri"
        run_text.font.size = Pt(10)
        run_text.font.color.rgb = COLOR_DARK
        doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # ==========================
    # TITLE & HEADER SECTION (WITH LOGOS)
    # ==========================
    # Header logos table: College Logo (Left) | Title block (Center) | ACM Logo (Right)
    college_logo_path = os.path.join(os.path.dirname(__file__), "assets", "college_logo_clean.png")
    if not os.path.exists(college_logo_path):
        college_logo_path = os.path.join(os.path.dirname(__file__), "assets", "college_logo.png")

    acm_logo_path = os.path.join(os.path.dirname(__file__), "assets", "acm_logo_clean.png")
    if not os.path.exists(acm_logo_path):
        acm_logo_path = os.path.join(os.path.dirname(__file__), "assets", "acm_logo.jpg")

    has_college_logo = os.path.exists(college_logo_path)
    has_acm_logo = os.path.exists(acm_logo_path)

    if has_college_logo or has_acm_logo:
        header_table = doc.add_table(rows=1, cols=3)
        header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        # 1.8 in (left logo), 3.2 in (center title), 1.8 in (right logo) -> Total ~6.8 in (standard 8.5" width - 2*0.8" margins)
        col_widths = [Inches(1.8), Inches(3.2), Inches(1.8)]
        for row in header_table.rows:
            for idx, width in enumerate(col_widths):
                row.cells[idx].width = width

        # Left cell: College Logo (prominent and clear)
        left_cell = header_table.cell(0, 0)
        p_left = left_cell.paragraphs[0]
        p_left.alignment = WD_ALIGN_PARAGRAPH.LEFT
        if has_college_logo:
            p_left.add_run().add_picture(college_logo_path, width=Inches(1.65))

        # Center cell: Organization & Title text
        center_cell = header_table.cell(0, 1)
        p_center = center_cell.paragraphs[0]
        p_center.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_center.paragraph_format.space_before = Pt(4)
        p_center.paragraph_format.space_after = Pt(2)

        run_org = p_center.add_run("GLOBAL ACADEMY OF TECHNOLOGY\nACM STUDENT CHAPTER\n")
        run_org.bold = True
        run_org.font.name = "Calibri"
        run_org.font.size = Pt(11)
        run_org.font.color.rgb = COLOR_PRIMARY

        run_h = p_center.add_run("CODE100 — 100 Days of DSA Platform\n")
        run_h.bold = True
        run_h.font.name = "Calibri"
        run_h.font.size = Pt(15)
        run_h.font.color.rgb = COLOR_DARK

        run_sub = p_center.add_run("Comprehensive Technical Specifications & Operations Manual")
        run_sub.italic = True
        run_sub.font.name = "Calibri"
        run_sub.font.size = Pt(9.5)
        run_sub.font.color.rgb = COLOR_MUTED

        # Right cell: ACM Student Chapter Logo (prominent and clear)
        right_cell = header_table.cell(0, 2)
        p_right = right_cell.paragraphs[0]
        p_right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        if has_acm_logo:
            p_right.add_run().add_picture(acm_logo_path, width=Inches(1.65))

        # Clear borders on header table
        for row in header_table.rows:
            for cell in row.cells:
                tcPr = cell._tc.get_or_add_tcPr()
                borders = parse_xml(f'''
                    <w:tcBorders {nsdecls("w")}>
                        <w:top w:val="none"/>
                        <w:left w:val="none"/>
                        <w:bottom w:val="none"/>
                        <w:right w:val="none"/>
                    </w:tcBorders>
                ''')
                tcPr.append(borders)

        doc.add_paragraph().paragraph_format.space_after = Pt(10)
    else:
        title_p = doc.add_paragraph()
        title_p.paragraph_format.space_before = Pt(0)
        title_p.paragraph_format.space_after = Pt(2)
        run_org = title_p.add_run("GLOBAL ACADEMY OF TECHNOLOGY — ACM STUDENT CHAPTER")
        run_org.bold = True
        run_org.font.name = "Calibri"
        run_org.font.size = Pt(11)
        run_org.font.color.rgb = COLOR_PRIMARY

        main_h = doc.add_paragraph()
        main_h.paragraph_format.space_before = Pt(4)
        main_h.paragraph_format.space_after = Pt(4)
        run_h = main_h.add_run("CODE100 — 100 Days of DSA Platform")
        run_h.bold = True
        run_h.font.name = "Calibri"
        run_h.font.size = Pt(24)
        run_h.font.color.rgb = COLOR_DARK

        sub_p = doc.add_paragraph()
        sub_p.paragraph_format.space_before = Pt(0)
        sub_p.paragraph_format.space_after = Pt(14)
        run_sub = sub_p.add_run("Comprehensive Software Architecture, Technical Specifications, Anti-Cheat Verification, & Operations Manual")
        run_sub.italic = True
        run_sub.font.name = "Calibri"
        run_sub.font.size = Pt(13)
        run_sub.font.color.rgb = COLOR_MUTED

    # Document Meta Table
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Software Product", "CODE100 Challenge Platform (Web & API)"),
        ("Version & Release State", "v1.0.0 Enterprise Production Ready (Next.js 16 + React 19 + Prisma 6)"),
        ("Prepared For", "GAT ACM Student Chapter, Faculty Advisors, Student Participants, & Evaluators"),
        ("Last Audit & Date", "September 2026 | Comprehensive Security, Anti-Cheat, & Lifecycle Audit")
    ]
    for i, (k, v) in enumerate(meta_data):
        c0 = meta_table.cell(i, 0)
        c1 = meta_table.cell(i, 1)
        set_cell_background(c0, "F1F5F9")
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c0, 80, 80, 120, 120)
        set_cell_margins(c1, 80, 80, 120, 120)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(k)
        r0.bold = True
        r0.font.name = "Calibri"
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = COLOR_DARK

        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(v)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = COLOR_DARK

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Helper function for Section Headings
    def add_section_heading(num, title):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(4)
        h.paragraph_format.keep_with_next = True
        
        run_num = h.add_run(f"{num}. ")
        run_num.bold = True
        run_num.font.name = "Calibri"
        run_num.font.size = Pt(16)
        run_num.font.color.rgb = COLOR_PRIMARY

        run_title = h.add_run(title)
        run_title.bold = True
        run_title.font.name = "Calibri"
        run_title.font.size = Pt(16)
        run_title.font.color.rgb = COLOR_DARK

    def add_sub_heading(title):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(2)
        h.paragraph_format.keep_with_next = True
        run = h.add_run(title)
        run.bold = True
        run.font.name = "Calibri"
        run.font.size = Pt(12)
        run.font.color.rgb = COLOR_PRIMARY

    def add_p(text, bold_prefix=None, space_after=4):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.bold = True
            rb.font.name = "Calibri"
            rb.font.size = Pt(10.5)
            rb.font.color.rgb = COLOR_DARK
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10.5)
        r.font.color.rgb = COLOR_DARK
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            rb = p.add_run(bold_prefix)
            rb.bold = True
            rb.font.name = "Calibri"
            rb.font.size = Pt(10)
            rb.font.color.rgb = COLOR_DARK
        r = p.add_run(text)
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = COLOR_DARK

    # ==========================
    # 1. EXECUTIVE SUMMARY
    # ==========================
    add_section_heading("1", "Executive Summary & Objectives")
    add_p("CODE100 is an enterprise-grade gamified coding platform conceptualized and engineered for the Global Academy of Technology (GAT) ACM Student Chapter. The system serves as the digital backbone for a rigorous 100-day Data Structures and Algorithms (DSA) initiative aimed at cultivating disciplined, industry-grade problem-solving habits among engineering undergraduates.")
    add_p("Unlike generic competitive programming portals, CODE100 is tailored specifically for institutional execution. It blends real-world coding on premier external platforms (LeetCode, HackerRank, CodeChef, Codeforces, GeeksforGeeks) with institutional oversight, daily progression locks, cryptographic authentication, multi-layered anti-cheat verification, recovery token mechanics, and automated milestone-based certification.")

    add_callout(
        "CODE100 solves the high attrition rate common in student coding marathons by combining daily streak rewards, tiered recovery tokens, transparent peer leaderboards, and administrative timeline controls.",
        "CORE VALUE PROPOSITION"
    )

    add_sub_heading("Key Programmatic Goals")
    add_bullet(" Ensure students build consistent coding habits through continuous daily challenges with strict 11:59 PM IST submission windows.", "Consistency Over Cramming:")
    add_bullet(" Provide a curated syllabus progressing from fundamental two-pointers and arrays up to advanced dynamic programming, graphs, and segment trees.", "Structured 100-Day DSA Curriculum:")
    add_bullet(" Eliminate duplicate URL reuse, cross-student submission copying, and submission of unaccepted/dummy attempts through automated heuristic checks.", "Institutional Anti-Cheat & Integrity:")
    add_bullet(" Allow faculty advisors and chapter leads complete authority over starting schedules, day overrides, and point calibration.", "Full Administrative Control:")

    # ==========================
    # 2. SYSTEM ARCHITECTURE
    # ==========================
    add_section_heading("2", "System Architecture & Technology Stack")
    add_p("The CODE100 architecture utilizes a modern full-stack TypeScript ecosystem designed for high throughput, sub-millisecond edge response times, strict type safety, and seamless responsive execution across mobile and desktop devices.")

    # Architecture Table
    tech_table = doc.add_table(rows=7, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tech_headers = ["Layer / Domain", "Technology & Version", "Architectural Responsibility"]
    for j, h in enumerate(tech_headers):
        c = tech_table.cell(0, j)
        set_cell_background(c, SECONDARY_HEX)
        set_cell_margins(c, 100, 100, 100, 100)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = COLOR_WHITE

    tech_rows = [
        ("Application Framework", "Next.js 16.3.6 (App Router + Turbopack)", "Server-side rendering (SSR), dynamic edge routes, React 19 Server Components, and optimized static rendering."),
        ("User Interface", "React 19.2 + TailwindCSS v4 + Lucide Icons", "Glassmorphic cyber-aesthetic theme, micro-animations, real-time feedback banners, and reactive mobile navigation."),
        ("Data Layer & ORM", "Prisma ORM 6.4.1 + SQLite / PostgreSQL", "Fully type-safe schema definitions, relational integrity, migrations, declarative models, and connection pooling."),
        ("Session & Security", "Jose JWT + HTTP-Only Cookies (SHA-256)", "Cryptographically signed JWT stored in secure HTTP-only cookies (`code100_session`), preventing XSS token theft."),
        ("Data Visualization", "Recharts 3.10.1", "Real-time branch participation bar charts, topic mastery distributions, and daily activity heatmaps."),
        ("Password Encryption", "Bcrypt.js (10 Salt Rounds)", "One-way cryptographic password hashing for all user accounts.")
    ]

    for i, row in enumerate(tech_rows, start=1):
        for j, val in enumerate(row):
            c = tech_table.cell(i, j)
            set_cell_background(c, "F8FAFC" if i % 2 == 1 else "FFFFFF")
            set_cell_margins(c, 80, 80, 100, 100)
            p = c.paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = COLOR_DARK

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ==========================
    # 3. ROLE-BASED ACCESS CONTROL (RBAC)
    # ==========================
    add_section_heading("3", "Role-Based Access Control (RBAC) & User Personas")
    add_p("The platform implements a strict 3-tier Role-Based Access Control model enforced across both server-side API routes and client-side UI components.")

    rbac_table = doc.add_table(rows=4, cols=3)
    rbac_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(["Role", "Target Audience", "Permitted System Capabilities"]):
        c = rbac_table.cell(0, j)
        set_cell_background(c, PRIMARY_HEX)
        set_cell_margins(c, 100, 100, 100, 100)
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = COLOR_WHITE

    rbac_rows = [
        ("PARTICIPANT\n(Student)", "Registered GAT engineering students across all branches and academic years (1st through 4th Year).", "View daily live problems, copy problem prompts, submit accepted platform URLs, view personal streaks, use recovery tokens, track leaderboard rank, and download certificates."),
        ("ADMIN\n(Student Coordinators & Mentors)", "ACM Student Chapter Core Team, Student Technical Leads, and Teaching Assistants.", "Moderate incoming submissions, review code snippets, approve/reject student submissions with notes, view institutional analytics, inspect flagged submissions, and export CSV reports."),
        ("SUPER_ADMIN\n(Faculty Head / Chief Advisor)", "ACM Faculty Advisor, Department Heads, and Chief Evaluator.", "Complete operational authority: adjust global event start and end dates, set manual Day overrides (Day 1..100), adjust point allocations, toggle registration status, and inspect comprehensive audit logs.")
    ]

    for i, row in enumerate(rbac_rows, start=1):
        for j, val in enumerate(row):
            c = rbac_table.cell(i, j)
            set_cell_background(c, "F8FAFC" if i % 2 == 1 else "FFFFFF")
            set_cell_margins(c, 80, 80, 100, 100)
            p = c.paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = COLOR_DARK

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ==========================
    # 4. DATABASE ENTITY-RELATIONSHIP ARCHITECTURE
    # ==========================
    add_section_heading("4", "Data Models & Relational Architecture")
    add_p("The database schema represents a normalized relational architecture maintained via Prisma ORM. Key entity models and their roles are detailed below:")

    add_sub_heading("Core Schema Entities")
    add_bullet(" Stores primary identity records (email, hashed password, student USN, year, branch, coding platform username, and account status). Non-student administrator accounts omit USN and branch constraints.", "1. User Entity:")
    add_bullet(" Represents each of the 100 curriculum problems, storing dayNumber, title, difficulty (EASY, MEDIUM, HARD), platform target, problem statement, input/output examples, hints, editorial, and status (DRAFT, SCHEDULED, ACTIVE, CLOSED).", "2. Challenge Entity:")
    add_bullet(" Captures student submission attempts with user and challenge foreign keys, submitted solution URL, optional code snippet, current review status (PENDING, APPROVED, REJECTED, FLAGGED), review timestamps, and anti-cheat flag reasons.", "3. Submission Entity:")
    add_bullet(" Tracks current streak, longest streak, last submission date, and freeze days used for gamified progression.", "4. Streak Entity:")
    add_bullet(" Maintains real-time point balances, lifetime points, current ranking, and last calculated timestamp for fast leaderboard lookups.", "5. LeaderboardEntry & PointHistory:")
    add_bullet(" Controls program-wide timeline parameters: startDate, endDate, currentDayOverride, registrationOpen, points per difficulty, and default token grants.", "6. EventSetting Entity:")
    add_bullet(" Immutable audit trail logging admin actions such as timeline modifications, status overrides, and submission reviews.", "7. AuditLog Entity:")

    # ==========================
    # 5. CORE FEATURES & FUNCTIONAL WORKFLOWS
    # ==========================
    add_section_heading("5", "Key Functional Modules & User Workflows")

    add_sub_heading("A. Student Registration & Flexible USN Verification")
    add_p("The registration pipeline supports personal email addresses (Gmail, Outlook, etc.) to ensure broad student accessibility while enforcing VTU USN formatting:")
    add_bullet("Standard VTU USNs: e.g., 1GA21CS001, 1GA22EC045, 1GA23IS120.")
    add_bullet("First-Year Provisional USNs: Newly enrolled students awaiting permanent VTU USNs can register using temporary formats such as 1GA25CS176-T or 1GAXXCS176-T.")

    add_sub_heading("B. Dynamic Event Timeline & Countdown Engine")
    add_p("The platform features an automated event state calculation engine (`src/lib/event.ts`):")
    add_bullet("Before Start Date: The Hero and Dashboard prominently feature a live ticking countdown timer (Days, Hours, Minutes, Seconds). Challenge problem statements are previewable, but submissions are strictly locked.")
    add_bullet("During Event: Day 1 unlocks on the start date at 00:00 IST. Each subsequent day unlocks sequentially at midnight. Challenges on or before the current day remain unlocked.")
    add_bullet("Dynamic Auto-Synchronization: As time progresses past midnight, `calculateEventState()` automatically updates the status of newly live challenges from SCHEDULED to ACTIVE.")

    add_sub_heading("C. Challenge Submission & Solution Validation")
    add_p("Students access the daily challenge at `/challenge/[day]`:")
    add_bullet("Identity Badge: A live badge displaying 'Submitting as: <Name> [<ROLE>]' confirms the active authenticated account before submission.")
    add_bullet("Single Target Platform: The solution URL input automatically reflects the target platform designated for that day (e.g., LeetCode, HackerRank).")
    add_bullet("Optional Code Snippet: Students can paste their solution code (C++, Java, Python) for automated integrity audits.")

    add_sub_heading("D. Gamification, Streaks, & Recovery Tokens")
    add_p("To encourage sustained daily engagement:")
    add_bullet("Daily Streak Multiplier: Each approved submission increments the student's active streak.")
    add_bullet("Point Allocations: EASY = 10 pts, MEDIUM = 15 pts, HARD = 20 pts (configurable by Super Admin).")
    add_bullet("Streak Recovery System: Every student begins with 3 Recovery Tokens. If a student misses a single day, they can redeem a token to retroactively restore their streak.")

    add_sub_heading("E. Anti-Cheat Engine & Plagiarism Heuristics")
    add_p("The `SubmissionValidator` class (`src/lib/validator.ts`) runs four automated checks on every submission:")
    add_bullet("Cross-User Solution URL Reuse: Detects if the identical solution URL was previously submitted by any other student.")
    add_bullet("Platform URL Syntax Validation: Verifies that the URL matches canonical problem/submission patterns.")
    add_bullet("Submission Timing Audit: Flags submissions completed within abnormally short intervals after problem release.")
    add_bullet("Rapid Resubmission Throttling: Enforces rate limits to prevent brute-force submission spam.")

    add_sub_heading("F. Super Admin Event Command Center")
    add_p("Super Admins can access `/admin` -> 'Event Timeline & Settings' to:")
    add_bullet("Set or adjust the official Event Start Date and End Date.")
    add_bullet("Set manual Current Day Overrides (forcing Day 1..100) for testing or emergency schedule adjustments.")
    add_bullet("Modify point values for Easy, Medium, and Hard problems.")
    add_bullet("Open or close student registration with immediate sitewide effect.")

    # ==========================
    # 6. REST API SPECIFICATIONS
    # ==========================
    add_section_heading("6", "RESTful API Endpoints Specification")
    add_p("All backend endpoints are built using Next.js App Router route handlers with JSON payloads:")

    api_table = doc.add_table(rows=9, cols=4)
    api_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(["Endpoint", "Method", "Auth Required", "Description"]):
        c = api_table.cell(0, j)
        set_cell_background(c, SECONDARY_HEX)
        set_cell_margins(c, 100, 100, 100, 100)
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.color.rgb = COLOR_WHITE

    api_endpoints = [
        ("/api/auth/register", "POST", "Public", "Registers a new student account, verifies USN, and issues session cookie."),
        ("/api/auth/login", "POST", "Public", "Authenticates credentials and establishes 30-day HTTP-only JWT cookie."),
        ("/api/auth/login", "DELETE", "Authenticated", "Clears the `code100_session` cookie and terminates session."),
        ("/api/auth/me", "GET", "Authenticated", "Returns current authenticated user profile, role, streak, and badges."),
        ("/api/challenges", "GET", "Public", "Lists all 100 challenges or fetches single day problem details."),
        ("/api/submissions", "POST", "Participant", "Validates and submits a daily coding solution URL and code snippet."),
        ("/api/leaderboard", "GET", "Public", "Retrieves ranked participants by points, streak, and branch."),
        ("/api/admin/settings", "PATCH", "Super Admin", "Modifies program timeline, start dates, day overrides, and point scales.")
    ]

    for i, row in enumerate(api_endpoints, start=1):
        for j, val in enumerate(row):
            c = api_table.cell(i, j)
            set_cell_background(c, "F8FAFC" if i % 2 == 1 else "FFFFFF")
            set_cell_margins(c, 80, 80, 80, 80)
            p = c.paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(9)
            r.font.color.rgb = COLOR_DARK

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ==========================
    # 7. SECURITY & INTEGRITY
    # ==========================
    add_section_heading("7", "Security, Privacy, & Session Integrity")
    add_p("CODE100 was audited to ensure bulletproof session separation, preventing accidental privilege escalation and token hijacking:")
    add_bullet("HTTP-Only Secure Cookies: Authentication tokens are stored in `code100_session` with `httpOnly: true`, `sameSite: 'lax'`, and `path: '/'`. JavaScript cannot access the token via `document.cookie`.", "Session Isolation:")
    add_bullet("Strict Server-Side Session Verification: Submission routes independently resolve the authenticated user ID from the encrypted JWT payload rather than trusting client-supplied user parameters.", "Tamper-Proof Submissions:")
    add_bullet("Password Cryptography: Passwords undergo 10 rounds of bcrypt salting before storage, safeguarding against credential leakage.", "Cryptographic Storage:")
    add_bullet("Sanitized Submissions: Solution URLs and code snippets are trimmed and validated against regex patterns to mitigate injection vulnerabilities.", "Input Sanitization:")

    # ==========================
    # 8. DEPLOYMENT & HOSTING INFRASTRUCTURE GUIDE
    # ==========================
    add_section_heading("8", "Hosting, Deployment, & Cloud Infrastructure")
    add_p("This section details the hosting architectures for CODE100 across $0 free tiers, institutional deployments, and high-concurrency production setups.")

    add_sub_heading("A. $0 Free-Tier Architecture (Vercel + Supabase / Neon)")
    add_p("For a 100-day college event with 500 to 1,000 registered students, CODE100 can run at zero infrastructure cost ($0):")
    add_bullet("Next.js App Router deployed with automatic edge caching, SSL, and instant Git rollbacks.", "Frontend & API (Vercel Hobby):")
    add_bullet("Hosted PostgreSQL with connection pooling (PgBouncer/Supavisor, port 6543) preventing connection exhaustion from serverless functions.", "Database (Supabase / Neon Free):")
    add_bullet("Stateless Jose JWT authentication enclosed in HttpOnly cookies, requiring zero external auth server dependencies.", "Authentication:")
    add_bullet("Vercel default subdomain (code100.vercel.app) or an institutional college subdomain (code100.gat.ac.in via CNAME) with automated Let's Encrypt certificates.", "Domain & SSL:")

    add_sub_heading("B. Hosting Provider Evaluation Matrix")
    deploy_table = doc.add_table(rows=6, cols=4)
    deploy_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(["Provider", "Plan / Cost", "Database Support", "Suitability for CODE100"]):
        c = deploy_table.cell(0, j)
        set_cell_background(c, SECONDARY_HEX)
        set_cell_margins(c, 80, 80, 80, 80)
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.color.rgb = COLOR_WHITE

    deploy_rows = [
        ("Vercel", "Hobby ($0) / Pro ($20/mo)", "External DB (Supabase / Neon)", "Recommended for Next.js App Router; instant preview builds & automated edge scaling."),
        ("Render", "Free Web Service / Starter ($7/mo)", "Managed PostgreSQL ($0 for 30d, then $7/mo)", "Good container option; free tier spins down after 15 minutes of inactivity."),
        ("Railway", "Trial ($5 credit) / Usage-based", "PostgreSQL plugin included", "Excellent developer experience, but requires payment method after initial credits."),
        ("Self-Hosted VPS / College Lab", "Hardware amortized ($0) or $5-$10/mo VPS", "Local PostgreSQL 16 + PgBouncer", "Ideal for complete internal campus control using Docker and PM2 reverse-proxied by Nginx."),
        ("Supabase (DB)", "Free Tier (500MB DB storage)", "Native PostgreSQL + Connection Pooler", "Ideal free DB for 100-day marathon; handles 50k monthly active users effortlessly.")
    ]

    for i, row in enumerate(deploy_rows, start=1):
        for j, val in enumerate(row):
            c = deploy_table.cell(i, j)
            set_cell_background(c, "F8FAFC" if i % 2 == 1 else "FFFFFF")
            set_cell_margins(c, 70, 70, 70, 70)
            p = c.paragraphs[0]
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(8.5)
            r.font.color.rgb = COLOR_DARK

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    add_sub_heading("C. Step-by-Step Free Deployment Runbook")
    add_bullet("1. Push repository code to GitHub.", "Step 1 (Source Code):")
    add_bullet("2. Create a free project on Supabase in South Asia (Mumbai) and copy the pooled connection string (port 6543).", "Step 2 (Database Provisioning):")
    add_bullet("3. Change datasource in prisma/schema.prisma to 'postgresql'.", "Step 3 (Schema Adjustment):")
    add_bullet("4. Run `npx prisma db push` to create tables, then execute `npx tsx prisma/seed.ts` to populate the 100 DSA challenges.", "Step 4 (Database Initialization):")
    add_bullet("5. Import repository into Vercel, configure DATABASE_URL, AUTH_SECRET, and NEXT_PUBLIC_APP_URL, and click Deploy.", "Step 5 (Production Build):")
    add_bullet("6. Under Project Settings -> Domains, connect code100.vercel.app or add a CNAME record for code100.gat.ac.in.", "Step 6 (Domain Binding):")

    add_sub_heading("D. Disaster Recovery & Emergency Fallback")
    add_bullet("If the primary web service suffers an outage, an emergency Google Form is activated for students to record their solution URLs and timestamps without losing streak continuity.", "Outage Contingency:")
    add_bullet("Nightly automated pg_dump backups preserve student submissions, streaks, and audit history.", "Backup Strategy:")

    add_sub_heading("Default Administrative Credentials")
    add_bullet("`superadmin@gat.ac.in` | Password: `acm@gat2026`", "Super Admin Account:")
    add_bullet("`admin@gat.ac.in` | Password: `acm@gat2026`", "Admin Account:")
    add_bullet("`student@gat.ac.in` | Password: `student@gat2026`", "Test Student Account:")

    add_callout(
        "CODE100 Platform was conceptualized, designed, and built by GAT ACM STUDENT CHAPTER for the student community of Global Academy of Technology.",
        "PROJECT ATTRIBUTION"
    )

    # Save Document
    doc_path = r"c:\Users\PRATHVIK\Desktop\100 DAYS\CODE100_Comprehensive_Software_Documentation.docx"
    doc.save(doc_path)
    print(f"Document successfully created at: {doc_path}")

if __name__ == "__main__":
    create_document()
