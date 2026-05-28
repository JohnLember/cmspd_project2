Build a complete production-ready government-style Web-Based Community Monitoring System for Persons with Disabilities (PWD) using the following technologies and requirements.

IMPORTANT:
Before making ANY code changes, ALWAYS:

1. Analyze and inspect the existing project structure first.
2. Check the current Vite React JavaScript setup.
3. Check existing Tailwind CSS configuration.
4. Check existing React Router setup.
5. Preserve all existing configurations and dependencies.
6. Never overwrite existing setup unless necessary.
7. Reuse existing architecture patterns if already present.
8. Create clean, modular, scalable, and maintainable code.

TECH STACK:

* Frontend: Vite + React + JavaScript
* Backend: Supabase
* Styling: Tailwind CSS
* Routing: React Router
* State Management: Context API or Zustand if needed
* Icons: Lucide React
* Charts: Recharts
* Authentication: Supabase Auth
* Database: Supabase PostgreSQL
* Storage: Supabase Storage
* Notifications: Supabase + Email/SMS placeholders
* Theme: Light/Dark Mode

THEME REQUIREMENTS:
LIGHT MODE:

* Use modern government-inspired blue palette
* Primary colors:

  * Blue-700
  * Blue-600
  * Sky-500
  * Slate backgrounds
* Clean professional UI
* Accessible typography
* High readability

DARK MODE:

* Elegant dark navy/slate government theme
* Proper contrast ratios
* Maintain accessibility standards

DESIGN STYLE:

* Modernized Philippine government system style
* Minimalist but professional
* Responsive on desktop/tablet/mobile
* Accessibility-first design
* Rounded-xl cards
* Soft shadows
* Dashboard-centric layout
* Professional tables and analytics
* Clean sidebar navigation
* Sticky header
* Government portal feel

ACCESSIBILITY REQUIREMENTS:

* WCAG-inspired accessibility
* Keyboard navigations
* Proper aria labels
* Voice recognition placeholders
* Large readable fonts
* High contrast support
* Responsive layouts for PWD users

SYSTEM MODULES:

1. AUTHENTICATION MODULE
   Roles:

* PDAO Staff
* PWD
* Guardian

Features:

* Login
* Logout
* Protected routes
* Role-based access control
* Session persistence
* Forgot password
* Secure authentication with Supabase

2. DASHBOARD MODULE
   PDAO Dashboard:

* Total registered PWDs
* Subsidy statistics
* Barangay reports
* Disability classifications
* Analytics charts
* Recent activities
* Notification panel

PWD Dashboard:

* Digital ID
* Subsidy status
* Announcements
* Notifications
* Profile management

Guardian Dashboard:

* Linked PWD information
* Notifications
* Monitoring panel

3. PWD MANAGEMENT MODULE
   Features:

* Add/Edit/Delete PWD
* View profile
* Disability classification
* Barangay categorization
* Upload requirements
* Search/filter/sort
* Pagination
* Status tracking

4. APPLICATION MODULE
   Features:

* Submit applications
* Upload documents
* Application verification
* Approval/rejection
* Status history
* Remarks

5. REPORTS MODULE
   Generate:

* Barangay reports
* Disability-type reports
* Demographic reports
* Subsidy distribution reports
* Export to PDF/CSV

6. NOTIFICATION MODULE
   Features:

* Email notification placeholders
* SMS notification placeholders
* Real-time notifications
* Announcement system

7. DIGITAL ID MODULE
   Features:

* Generate printable IDs
* QR code placeholder
* Download digital ID
* Verification-ready structure

8. SETTINGS MODULE
   Features:

* Theme switcher
* User settings
* Security settings
* System preferences

9. ACTIVITY LOGS MODULE
   Features:

* Audit logs
* Login logs
* System activity tracking

SUPABASE DATABASE ARCHITECTURE:

Create normalized database schema following ERD principles.

TABLES:

1. users

* id
* role
* email
* created_at

2. pwd_profiles

* id
* user_id
* full_name
* birthdate
* age
* gender
* address
* barangay
* contact_number
* disability_type
* guardian_id
* profile_photo
* created_at

3. guardians

* id
* user_id
* full_name
* relationship
* contact_number
* address

4. pdao_staff

* id
* user_id
* full_name
* position
* department

5. applications

* id
* pwd_id
* subsidy_type
* requirements
* status
* remarks
* submitted_at
* verified_by

6. reports

* id
* report_type
* generated_by
* generated_at

7. notifications

* id
* recipient_id
* title
* message
* type
* is_read
* created_at

8. subsidy_distributions

* id
* pwd_id
* amount
* distribution_date
* status
* remarks

9. digital_ids

* id
* pwd_id
* id_number
* issued_date
* expiration_date

10. activity_logs

* id
* user_id
* action
* module
* created_at

SUPABASE REQUIREMENTS:

* Use Row Level Security (RLS)
* Create secure policies
* Use environment variables
* Separate API services
* Use reusable hooks
* Use Supabase realtime where needed

PROJECT ARCHITECTURE:

Create scalable folder structure:

src/
│
├── app/
├── routes/
├── layouts/
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── pwd/
│   ├── guardian/
│   ├── applications/
│   ├── reports/
│   ├── settings/
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   ├── cards/
│   ├── modals/
│   ├── dashboard/
│
├── services/
│   ├── supabase/
│   ├── api/
│
├── hooks/
├── context/
├── utils/
├── constants/
├── assets/
├── styles/
└── lib/

ARCHITECTURE RULES:

* Use reusable components
* Avoid duplicate code
* Use clean naming conventions
* Use modular architecture
* Use lazy loading for routes
* Use code splitting
* Keep business logic separated
* Separate UI from logic
* Follow scalable enterprise structure

ROUTING REQUIREMENTS:
Use React Router with:

* Protected routes
* Role-based routes
* Nested layouts
* Error pages
* Loading states

CREATE:

* AdminLayout
* AuthLayout
* DashboardLayout

UI COMPONENTS:
Build reusable:

* Sidebar
* Navbar
* Theme Toggle
* Data Tables
* Search Inputs
* Pagination
* Cards
* Statistics Widgets
* Modal Forms
* Toast Notifications
* Confirmation Dialogs
* Skeleton Loaders
* Empty States

DASHBOARD REQUIREMENTS:
Use Recharts for:

* Barangay statistics
* Disability classification charts
* Subsidy analytics
* Monthly reports

IMPLEMENT DARK MODE:

* Use Tailwind dark class strategy
* Persist theme in localStorage
* Smooth transitions
* Global theme context

SECURITY REQUIREMENTS:

* Role-based permissions
* Protected Supabase queries
* Secure file uploads
* Validate forms
* Sanitize inputs
* Use environment variables

FORM HANDLING:

* Use React Hook Form
* Add validation
* Proper error handling
* Accessible forms

PERFORMANCE REQUIREMENTS:

* Optimize renders
* Lazy load pages
* Reusable hooks
* Pagination
* Memoization where needed

CODE QUALITY:

* Clean code
* Professional comments only where necessary
* Avoid messy code
* Consistent formatting
* Reusable utilities
* Scalable architecture

WORKFLOW REQUIREMENT:
DO NOT generate everything at once.

FIRST:

1. Analyze existing project setup.
2. Check package.json.
3. Check current router setup.
4. Check Tailwind setup.
5. Check existing folder structure.
6. Then propose improvements WITHOUT breaking setup.

THEN:
Build the project module by module in professional order:

1. Project architecture
2. Supabase configuration
3. Authentication
4. Layout system
5. Dashboard UI
6. CRUD modules
7. Reports
8. Notifications
9. Dark mode
10. Optimization and polishing

IMPORTANT:

* Preserve current Vite configuration.
* Preserve current Tailwind setup.
* Preserve current React Router setup.
* Never remove existing dependencies unless necessary.
* Ensure all generated code is production-ready.
* Ensure responsive modern UI.
* Ensure government-grade professionalism.
* Follow Context Diagram, DFD, ERD, Use Case Diagram, Sequence Diagram, and Data Dictionary requirements carefully.
