# Team Task Manager

Team Task Manager is a production-ready full-stack web app for managing projects, team members, tasks, priorities, comments, invitations, and overdue work. It is built with a clear role model: admins control the workspace, while members focus on the tasks assigned to them.

## Highlights

- Role-based dashboards for Admin and Member users
- Polished responsive UI with redesigned auth screens and a stronger workspace shell
- JWT authentication with bcrypt password hashing
- MongoDB schemas with Mongoose references
- Project and team management
- Task priority, tags, status, due dates, and overdue detection
- Task comments and activity history
- Manual invite links with copy/share flow, expiring tokens, and history cleanup
- Optional email delivery through Resend or SMTP
- Password reset by email when an email provider is configured
- Overdue task notifications
- Main-admin-only user removal with a separate removal password
- Railway-compatible deployment setup

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Router |
| API Client | Axios |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Email | Manual invite links by default, optional Resend or Nodemailer SMTP |
| Deployment | Railway |

## Role Model

### Admin

Admins can:

- View all projects, users, and tasks
- Create, update, and delete projects
- Manage project team members
- Create, assign, update, and delete tasks
- Set task priority, tags, due dates, and assignment
- Comment on any task
- Create manual invite links for users
- Cancel active invites and clear inactive invite history
- View overdue notifications and workspace analytics

### Main Admin

The main admin is configured through:

```env
MAIN_ADMIN_EMAIL=vlistenmusic@gmail.com
```

Only this account can remove admins or members. User removal also requires:

```env
USER_REMOVAL_PASSWORD=your-secure-removal-password
```

The main admin account itself cannot be removed.

### Member

Members can:

- View only projects where they are part of the team
- View only tasks assigned to them
- Update only the status of assigned tasks
- Comment only on assigned tasks
- See their own overdue notifications

Members cannot create projects, assign tasks, invite users, or manage team members.

## Screens

- Login and signup
- Forgot password and reset password
- Admin dashboard
- Member dashboard
- Projects
- Tasks
- Invite Links
- Team management
- Overdue notifications

## Folder Structure

```text
team-task-manager/
  backend/
    src/
      config/
      constants/
      controllers/
      middleware/
      models/
      routes/
      utils/
      validators/
    server.js
    package.json
    .env.example
    railway.json

  frontend/
    src/
      api/
      components/
      constants/
      context/
      pages/
      services/
      utils/
    index.html
    package.json

  package.json
  railway.json
  README.md
```

## Local Setup

### 1. Install Dependencies

Run this from the project root:

```bash
npm install
```

The root `postinstall` script installs dependencies for both `backend` and `frontend`.

### 2. Create Environment Files

Backend:

```bash
cp backend/.env.example backend/.env
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

On Windows PowerShell, use:

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

### 3. Configure Backend Environment

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/team-task-manager
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

ADMIN_SETUP_KEY=change-this-admin-key
MAIN_ADMIN_EMAIL=vlistenmusic@gmail.com
USER_REMOVAL_PASSWORD=change-this-removal-password

EMAIL_FROM="Team Task Manager <your-email@example.com>"
INVITE_EMAIL_ENABLED=false
RESEND_API_KEY=
RESEND_FROM=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-google-app-password
```

### 4. Configure Frontend Environment

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start MongoDB

If MongoDB is installed locally as a Windows service:

```powershell
Get-Service MongoDB
Start-Service MongoDB
```

If you use MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### 6. Run The App

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:5000/api/health
```

## Invite Links And Email

Invites are manual links by default. Admins create an invite, copy the generated link, and share it through WhatsApp, Gmail, or any other channel. This avoids requiring a verified email domain.

The invite history table supports:

- Removing one invite record
- Clearing inactive history in bulk
- Keeping active pending invite links available during bulk cleanup

Email delivery is optional. To send invite emails automatically, set:

```env
INVITE_EMAIL_ENABLED=true
```

On Railway Free/Trial/Hobby, prefer Resend because SMTP ports can time out:

```env
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM=Team Task Manager <onboarding@resend.dev>
```

`onboarding@resend.dev` is for testing and usually only sends to your own Resend account email. To send to other recipients, verify a domain in Resend and use an address on that domain:

```env
RESEND_FROM=Team Task Manager <noreply@yourdomain.com>
```

SMTP is still supported for local development or hosts where SMTP is available:

```env
EMAIL_FROM="Team Task Manager <your-email@gmail.com>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-google-app-password
```

Do not use your normal Gmail password.

## Railway Deployment

Deploy the repository root on Railway.

### Build Command

```bash
npm run build
```

### Start Command

```bash
npm start
```

### Required Railway Variables

```env
NODE_ENV=production
MONGO_URI=${{MongoDB.MONGO_URL}}
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-railway-domain.up.railway.app
ADMIN_SETUP_KEY=your-admin-setup-key
MAIN_ADMIN_EMAIL=vlistenmusic@gmail.com
USER_REMOVAL_PASSWORD=your-secure-removal-password
```

Do not set `PORT=5000` on Railway. Railway provides the runtime port. When generating a public domain, use target port `8080`.

Optional email variables:

```env
INVITE_EMAIL_ENABLED=false
RESEND_API_KEY=
RESEND_FROM=
EMAIL_FROM="Team Task Manager <your-email@example.com>"
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

The included `railway.json` configures:

- Railpack build
- `npm run build`
- `npm start`
- health check at `/api/health`

## API Overview

### Auth

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/signup` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |
| GET | `/api/auth/me` | Authenticated |

### Invites

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/invites` | Admin |
| POST | `/api/invites` | Admin |
| PATCH | `/api/invites/:id/cancel` | Admin |
| DELETE | `/api/invites/:id` | Admin |
| DELETE | `/api/invites/history/inactive` | Admin |
| GET | `/api/invites/verify/:token` | Public |

### Users

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/users` | Admin |
| GET | `/api/users/members` | Admin |
| DELETE | `/api/users/:id` | Main admin only |

`DELETE /api/users/:id` requires `USER_REMOVAL_PASSWORD` in the request body.

### Projects

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/projects` | Admin all, Member team projects |
| GET | `/api/projects/:id` | Admin or project team member |
| POST | `/api/projects` | Admin |
| PUT | `/api/projects/:id` | Admin |
| DELETE | `/api/projects/:id` | Admin |

### Tasks

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/tasks` | Admin all, Member assigned tasks |
| GET | `/api/tasks/:id` | Admin or assigned member |
| POST | `/api/tasks` | Admin |
| PUT | `/api/tasks/:id` | Admin |
| PATCH | `/api/tasks/:id/status` | Admin or assigned member |
| POST | `/api/tasks/:id/comments` | Admin or assigned member |
| DELETE | `/api/tasks/:id` | Admin |

### Dashboard And Notifications

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/api/dashboard` | Authenticated |
| GET | `/api/notifications/overdue` | Authenticated |

## Security Notes

- Passwords are hashed with bcrypt.
- JWT tokens are required for protected routes.
- Admin-only routes are enforced on the backend.
- Member access is restricted on the backend, not only in the UI.
- Invite and reset tokens are hashed before storage.
- User removal is limited to `MAIN_ADMIN_EMAIL`.
- Do not commit your real `.env` files or secrets.

## Useful Commands

```bash
npm install
npm run dev
npm run build
npm start
```

Run backend only:

```bash
npm run dev --prefix backend
```

Run frontend only:

```bash
npm run dev --prefix frontend
```

## Production Checklist

- Use MongoDB Atlas or a managed MongoDB instance.
- Set a long random `JWT_SECRET`.
- Use manual invite links by default, or configure Resend/SMTP if automatic email is needed.
- Set `CLIENT_URL` to your deployed frontend/backend domain.
- Change `ADMIN_SETUP_KEY`.
- Change `USER_REMOVAL_PASSWORD`.
- Confirm `MAIN_ADMIN_EMAIL` is correct.
- Do not expose `.env` files.

---

## Made By

👨‍💻 **Vikash Yadav**

A focused, production-ready workspace designed and built with care for teams that value clarity, collaboration, and control.
