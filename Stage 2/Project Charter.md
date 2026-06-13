# Stage 2: Project Charter


# 🎯 Project Purpose

The purpose of this project is to design and develop a web-based platform that allows users to subscribe to healthy meals from multiple restaurants under one flexible subscription plan. Most existing healthy meal subscription services require users to commit to a single restaurant for a full week or month, which often leads to meal fatigue and reduced commitment to healthy eating. Our project addresses this gap by offering one centralized platform where users — particularly employees, students, and individuals pursuing a healthier lifestyle — can create a flexible subscription and select meals from a variety of healthy restaurants in one place. The project also serves as the team's Holberton final project, providing an opportunity to demonstrate full-stack software engineering skills through a realistic, user-centered MVP.

# 📌 SMART Objectives

The team has defined the following three SMART objectives to guide the MVP development:

## Objective 1 — Deliver a Functional Full-Stack MVP

Develop and deliver a complete full-stack web application implementing all core MVP features defined in Stage 1 — including user and restaurant registration and login, restaurant listing, meal listing, subscription plan selection, weekly meal selection, saved delivery address, subscription summary, subscription request submission, and a simple admin dashboard — by July 30, 2026, the final submission date of the Holberton Academy project.

## Objective 2 — Demonstrate a Working Multi-Restaurant Subscription Flow

Implement and validate a working end-to-end subscription flow that enables a user to select meals from at least two (2) healthy restaurants, each offering around fourteen (14) meals (two options per day), and successfully submit a complete weekly subscription request (lunch only) without errors, prior to the final project presentation.

## Objective 3 — Apply Core Software Engineering Practices

Apply and document core software engineering practices throughout the project, including database design, RESTful API development, user authentication, CRUD operations, version control through GitHub, and structured testing and documentation, ensuring that the final MVP is reviewable, maintainable, and aligned with Holberton's final project evaluation criteria by July 30, 2026.

# 👥 Stakeholders

The project involves stakeholders who contribute to or are affected by the development of the MVP.

| Stakeholder | Description |
|---|---|
| End-Users (External) | Employees, students, and any person who wants to maintain a healthier lifestyle through planned meals |
| Healthy Restaurants (External) | Two restaurants are included in the MVP, each with their own user account; can add, update, and delete their meals on the platform |
| Admin (Internal) | Platform administrator responsible for verifying that restaurants meet the registration standards before being listed on the platform |

# 🧩 Team Roles and Responsibilities

For Stage 2, the team has restructured its technical responsibilities to align with each member's strengths and interests. Leadership of the project is shared among all team members, with leadership able to rotate in future stages to balance workload and encourage equal participation.

| Team Member | Role | Key Responsibilities |
|---|---|---|
| Moudhi Almutlaq | Lead Backend | Design and implement the back-end APIs; back-end integration with the database and front-end. |
| Badryah Almalki | Lead Database | Designs the database schema; defines tables for users, restaurants, meals, addresses, and subscriptions; manages database integration, queries, and data integrity |
| Reem Alshehri | Lead Frontend | Designs and implements the user interface for restaurants, meals, subscription plans, and order summary pages; ensures clear and consistent user experience |
| Yara Ibrahim | Lead Authentication, Testing & Documentation | Implements user sign-up and login flows; manages testing, debugging, and quality assurance; maintains project documentation |

All team members will contribute and work collaboratively as full-stack developers across planning, development, code review, testing, and documentation, ensuring that the MVP is delivered on time and to the required quality standard.

# 🎯 Scope

## In-Scope

The project will deliver a web-based platform for healthy meal subscriptions that allows users to subscribe to meals from multiple healthy restaurants through one flexible plan.

The MVP will include:

- User and Restaurant registration and login
- Add, update, and delete meals by restaurants
- Healthy restaurants listings
- Meal browsing and selection
- Weekly subscription plan
- Daily meals scheduling
- Saved delivery address
- Subscription summary page
- Submission of subscription requests
- Admin dashboard for managing restaurants registration

## Out-of-Scope

The following features are excluded from the MVP to keep the project focused and achievable within the timeline:

- Real online payment integration
- Real-time delivery tracking
- AI-based meal recommendations
- Mobile application development
- Advanced analytics and reporting
- Live chat or customer support system
- Loyalty or advanced rewards system

| In-Scope Deliverables | Out-of-Scope Items |
|---|---|
| User and restaurant authentication system | Online payment gateway |
| Restaurant and meal listings | Real delivery tracking |
| Subscription management | Restaurant API integration |
| Daily meal selection | AI recommendations |
| Delivery address saving | Mobile application |
| Admin dashboard | Advanced analytics |
| Meals or menu management |  |

# 📌 Risks

This section identifies the potential risks that may arise during the development of the multi-restaurant healthy meal subscription platform. It also proposes practical mitigation strategies to help the team complete the project within the limited timeframe.

| Risk | Mitigation |
|---|---|
| Limited time to implement all proposed features. | simplify the MVP features. For example, instead of monthly subscription, we will start with 5-day weekly lunch subscription where the user selects one meal per working day. |
| The idea may become too complex | Exclude complex features such as payment and mobile app from the MVP. |
| Team members may have limited experience | Assign tasks based on strengths and use familiar technologies. |
| Frontend and backend may not connect smoothly | Define API responses early and test every endpoint using Postman before connecting it to the frontend |
| User experience risk if the subscription flow is too long or confusing | Keep the user journey simple. Choose plan, choose days, choose meals, and confirm subscription. |
| Real data or restaurant collaboration may not be achieved | Use mock data for restaurants and meals if no restaurant agreed to collaborate or provide their own data. |

# 👥 High-Level Plan
---

# 📅 High-Level Project Plan

**Project:** Healthy Meals Subscription Platform  
**Team:** Moudhi Almutlaq · Badryah Almalki · Reem Alshehri · Yara Ibrahim

---

| Week | Stage | Main Tasks | Key Milestones | Deliverables |
|------|-------|-----------|----------------|--------------|
| Week 1 | Idea Development | Define the project idea, problem, solution, and target users | Project idea approved | Idea description, problem, solution |
| Week 2 | Project Charter Development | Define project objectives, MVP scope, team roles, and constraints | Project charter approved | Simple Project Charter |
| Week 3 | Requirements Analysis | Define website pages, user journey, and main features | Project requirements approved | Requirements list and User Flow |
| Week 4 | Technical Documentation | Define database structure, API plan, and basic page wireframes | Technical design approved | Simple ERD, API Plan, Wireframes |
| Week 5 | Backend Development — Part 1 | Create database, users, restaurants, meals, and implement register and login APIs | Database and authentication ready | Database and basic APIs |
| Week 6 | Backend Development — Part 2 | Build subscription and order APIs, meal selection logic, delivery address, and admin APIs | Core backend completed | Full backend APIs tested and ready |
| Week 7 | Frontend Development | Build register, login, restaurants, and meals pages | Main user pages completed | Initial user interface |
| Week 8 | Order Flow and Restaurant Dashboard | Build weekly meal selection, order summary, and restaurant meal management | Order flow completed | Order Flow and simple Restaurant Dashboard |
| Week 9 | Testing — Part 1 | Test the platform end-to-end, identify and document all bugs | No critical bugs remaining | Test cases and bug report |
| Week 10 | Testing and Improvement — Part 2 | Fix all bugs, improve UI and performance, final testing round | Stable MVP version | Tested and improved MVP |
| Week 11 | Project Closure — Part 1 | Clean up code, write documentation, prepare GitHub repository and README | Repository ready | Clean GitHub repository and README |
| Week 12 | Project Closure — Part 2 | Prepare final presentation, demo, and submit all deliverables | Final submission ready | README, Presentation, Demo | submitted. | ⏳ Upcoming |
