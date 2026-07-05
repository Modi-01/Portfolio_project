# Stage 4: MVP Development and Execution — Sprint Plan

**Project:** Healthy Meals Subscription Platform
**Duration:** June 28 – July 25, 2026 (4 Sprints × 1 Week Each)

---

## Team Roles

| Member | Administrative Role | Technical Role |
|--------|-------------------|----------------|
| Member 1 | Project Manager (PM) | Frontend Developer |
| Member 2 | Source Control Manager (SCM) | Backend Developer |
| Member 3 | QA Lead | Database + Backend |
| Member 4 | UI/UX Coordinator | Frontend + API Integration |

---

## Sprint 1 — Setup and Authentication (June 28 – July 4)

### Sprint Goal
Set up the project foundation, configure the development environment, implement user authentication, and design the database.

### What We Deliver by End of Sprint
- Working GitHub repository with proper branching strategy
- Users can register and log in (customer, restaurant owner, admin)
- Database is set up and running with all core tables
- Home, Login, and Register pages are live on the frontend

### Task 0 — Plan and Define Sprints
This sprint plan itself is the deliverable for Task 0.

---

### Member 1 — PM + Frontend

**Administrative tasks:**
- Set up Trello board with all sprint tasks and deadlines
- Define sprint goals and assign tasks to each member
- Conduct daily stand-up meetings and document blockers
- Track sprint velocity and update task statuses daily

**Technical tasks:**
- Build the Register page (form: full name, email, password, age, gender, height, weight, health goal, home address, work address)
- Build the Login page (email + password form with role-based redirect)
- Set up React project structure and routing

---

### Member 2 — SCM + Backend

**Administrative tasks:**
- Create the GitHub repository
- Set up branching strategy: main, development, feature/[name], fix/[name]
- Enforce pull request rules: no direct push to main or development
- Review and merge the first pull requests

**Technical tasks:**
- Set up Python + FastAPI project
- Connect to PostgreSQL database
- Implement POST /api/auth/register (with role: customer / restaurant / admin)
- Implement POST /api/auth/login (returns JWT token + role)
- Implement POST /api/auth/logout

---

### Member 3 — QA Lead + Database

**Administrative tasks:**
- Write test cases for registration and login flows
- Document expected vs actual results for each test
- Set up GitHub Issues for bug tracking with severity labels (Critical / Major / Minor)

**Technical tasks:**
- Run schema.sql to create all database tables (app_user, restaurant, meal, subscription, order_item, discount_code)
- Seed mock data: 2 test restaurants, 5 test meals per restaurant, 1 admin user
- Test all auth API endpoints using Postman and document results

---

### Member 4 — UI/UX + Frontend + API Integration

**Administrative tasks:**
- Review final Figma mockups and ensure all pages match the design system
- Create a component checklist: which components are shared across pages

**Technical tasks:**
- Build the Home page (hero section, featured meal plans, how it works)
- Set up React Router for all main routes
- Connect Register and Login pages to POST /api/auth/register and POST /api/auth/login
- Store JWT token in app state after login

---

## Sprint 2 — Restaurants, Meals, and Admin (July 5 – July 11)

### Sprint Goal
Build the restaurant management system, meal browsing for customers, and the admin approval flow.

### What We Deliver by End of Sprint
- Restaurant owners can log in, add, edit, and delete meals
- Customers can browse restaurants and view available meals with full details
- Admin can view pending restaurants and approve or reject them

### Task 1 — Execute Development Tasks
All development in this sprint follows Task 1 guidelines: feature branches, pull request reviews, and QA testing on completed tasks.

---

### Member 1 — PM + Frontend

**Administrative tasks:**
- Run daily stand-ups and update Trello board
- Track sprint progress: percentage of tasks completed vs planned
- Prepare sprint review demo at end of sprint

**Technical tasks:**
- Build the Restaurants page (list of approved restaurants with name, description, logo)
- Build the Meal Plans / Browse page (meal cards with name, image, calories, protein, carbs, fats, price, tags)
- Build the Admin Dashboard — Overview page (stats cards: total restaurants, total customers, total orders)

---

### Member 2 — SCM + Backend

**Administrative tasks:**
- Review all pull requests before merging to development
- Enforce commit message standards
- Resolve any merge conflicts

**Technical tasks:**
- Implement GET /api/restaurants (list all approved restaurants)
- Implement GET /api/restaurants/:id (single restaurant details)
- Implement POST /api/meals (restaurant owner adds a meal)
- Implement PUT /api/meals/:id (restaurant owner updates a meal)
- Implement DELETE /api/meals/:id (soft delete: set is_available = false)
- Implement GET /api/restaurants/:id/meals (get meals by restaurant)

---

### Member 3 — QA Lead + Database

**Administrative tasks:**
- Write test cases for restaurant and meal APIs
- Test all new endpoints using Postman
- Log all bugs found in GitHub Issues with steps to reproduce

**Technical tasks:**
- Add admin-specific API: PATCH /api/admin/restaurants/:id/status (approve or reject with optional rejection_reason)
- Add GET /api/admin/restaurants?status=pending (list pending restaurants)
- Add GET /api/admin/restaurants (list all restaurants with status)
- Test the full admin approval flow end-to-end

---

### Member 4 — UI/UX + Frontend + API Integration

**Administrative tasks:**
- Review UI consistency across all pages built so far
- Ensure all pages match Figma mockups

**Technical tasks:**
- Build the Restaurant Dashboard — My Meals page (meals table with edit and delete buttons, add meal button)
- Build the Add New Meal form (image upload, name, ingredients, calories, protein, carbs, fats, price, category)
- Build the Admin Pending Restaurants page (table with approve and reject buttons, rejection reason modal)
- Connect all restaurant pages to their backend APIs

---

## Sprint 3 — Subscription, Orders, and Payment (July 12 – July 18)

### Sprint Goal
Build the complete customer subscription flow: meal selection, order summary, payment, and delivery details. Build the restaurant orders view.

### What We Deliver by End of Sprint
- Customers can select one meal per day (Sunday to Thursday), review their order, apply a discount code, enter delivery details, and complete payment
- Restaurant owners can view their incoming orders grouped by day
- Full end-to-end user journey is functional

### Task 1 — Execute Development Tasks (continued)
### Task 2 — Monitor Progress and Adjust

---

### Member 1 — PM + Frontend

**Administrative tasks:**
- Monitor sprint velocity and identify any tasks at risk
- Adjust task assignments if any member is blocked
- Document daily stand-up notes and blockers

**Technical tasks:**
- Build the Weekly Meal Selection page (Sunday to Thursday day tabs, meal cards per day, one selection per day validation)
- Build the Order Summary page (selected meals list, delivery time field, delivery address dropdown: home or work, discount code input with apply button, price breakdown)
- Build the Customer Dashboard page (active subscription details, weekly schedule, subscription status)

---

### Member 2 — SCM + Backend

**Administrative tasks:**
- Review all pull requests
- Ensure development branch is stable before each merge
- Prepare development branch for final integration in Sprint 4

**Technical tasks:**
- Implement POST /api/subscriptions (create subscription with start_date, end_date, delivery_time, delivery_address, discount_code_id)
- Implement POST /api/meal-selections (save selected meal per day: subscription_id, meal_id, day_date, day_of_week)
- Implement POST /api/payments (process payment, update subscription status to confirmed)
- Implement GET /api/subscriptions/:userId (get user subscription history)

---

### Member 3 — QA Lead + Database

**Administrative tasks:**
- Write test cases for the full subscription flow
- Test that: one meal per day is enforced, discount codes apply correctly, final_price = original_price - discount_amount
- Run integration tests using Postman for the complete flow: register → login → browse → select meals → submit order → pay

**Technical tasks:**
- Implement GET /api/restaurants/:id/orders?day=Sunday (restaurant orders grouped by day)
- Validate subscription date ranges in the backend before inserting order_item rows
- Test full database transaction: subscription creation + order_item rows in one transaction

---

### Member 4 — UI/UX + Frontend + API Integration

**Administrative tasks:**
- Final UI review for all pages built in Sprint 3
- Ensure mobile responsiveness on all new pages

**Technical tasks:**
- Build the Payment page (order summary on left, payment form on right: cardholder name, card number, expiry, CVV, discount code, pay now button)
- Build the Restaurant Orders by Day page (day selector tabs: Sunday to Thursday, orders table per day: customer name, meal name, delivery address, delivery time)
- Connect all subscription and payment pages to their backend APIs
- Connect discount code input to POST /api/discount-codes/validate

---

## Sprint 4 — Testing, Bug Fixes, and Final Delivery (July 19 – July 25)

### Sprint Goal
Complete end-to-end testing, fix all critical bugs, deploy to production, and prepare the final submission.

### What We Deliver by End of Sprint
- Fully tested and stable MVP deployed to production
- Clean GitHub repository with organized code and documentation
- Final README, bug report, and testing evidence ready for submission

### Task 3 — Conduct Sprint Reviews and Retrospectives
### Task 4 — Final Integration and QA Testing
### Task 5 — Deliverables

---

### Member 1 — PM + Frontend

**Administrative tasks:**
- Conduct final sprint review: demo all features to the team
- Run sprint retrospective: what went well, what didn't, what to improve
- Prepare final submission links for Task 5 (sprint reviews, retrospectives, sprint planning, source repository, bug tracking, testing evidence, production environment)

**Technical tasks:**
- Fix all frontend bugs identified during testing
- Final UI polish: consistent spacing, colors, and typography across all pages
- Ensure all pages are responsive on different screen sizes
- Take screenshots of all pages for documentation

---

### Member 2 — SCM + Backend

**Administrative tasks:**
- Final code review of all pull requests
- Merge development branch into main after all tests pass
- Tag the final release on GitHub (v1.0.0)

**Technical tasks:**
- Fix all backend bugs identified during testing
- Optimize database queries for performance
- Deploy backend to production (Render or Railway)
- Deploy frontend to production (Vercel or Netlify)
- Ensure environment variables are configured correctly in production

---

### Member 3 — QA Lead + Database

**Administrative tasks:**
- Write the final bug report: all bugs found, severity, status (fixed or open)
- Document testing evidence: Postman collection exports, screenshots of test results
- Conduct User Acceptance Testing (UAT): simulate a real user going through the full flow

**Technical tasks:**
- Run end-to-end integration tests across all three user types (customer, restaurant owner, admin)
- Test production environment to ensure everything works after deployment
- Verify all database constraints and validations work correctly under edge cases
- Seed final production database with realistic mock data

---

### Member 4 — UI/UX + Frontend + API Integration

**Administrative tasks:**
- Final UI/UX review against original Figma mockups
- Document any design decisions that changed during development

**Technical tasks:**
- Connect any remaining pages to their APIs
- Fix all API integration bugs
- Implement error handling on all forms (show user-friendly error messages)
- Ensure all pages handle loading states and empty states correctly

---

## Sprint Summary

| Sprint | Dates | Focus | Key Milestone |
|--------|-------|-------|--------------|
| Sprint 1 | Jun 28 – Jul 4 | Setup + Auth | Users can register and log in |
| Sprint 2 | Jul 5 – Jul 11 | Restaurants + Meals + Admin | Browse meals, manage restaurants, admin approval |
| Sprint 3 | Jul 12 – Jul 18 | Subscription + Payment | Full customer journey complete |
| Sprint 4 | Jul 19 – Jul 25 | Testing + Deployment | MVP live on production |

---

## Definition of Done

A task is considered done when:
- Code is written and tested locally
- A pull request is opened and reviewed by at least one team member
- QA has tested the feature and confirmed no critical bugs
- The feature is merged to the development branch

