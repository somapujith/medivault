# Deployment Guide for MediVault

Since your application consists of a **React Frontend** and a **Java Spring Boot Backend**, it requires two separate hosting services to run effectively in a production environment.

## ⚠️ Important Database Warning
Currently, your backend is configured to use an **in-memory H2 database** (`jdbc:h2:mem:...`).
**What this means:** Every time your backend restarts (which happens frequently on cloud hosts like Render/Railway), **all registered users, patients, and prescriptions will be deleted.**

**Recommendation:** For a real deployment, you should connect your Spring Boot app to a persistent database like **PostgreSQL** or **MySQL**. Both Render and Railway offer managed PostgreSQL databases that you can easily connect to.

---

## Part 1: Host Backend (Spring Boot)
Vercel is optimized for frontend and Node.js. It does **not** natively support persistent Java Spring Boot applications.
We recommend using **Render** (has a free tier) or **Railway** for the backend.

### Option A: Deploy on Render (Free Tier available)
1.  Push your code to GitHub (you just did this).
2.  Sign up at [render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository (`medivault`).
5.  **Root Directory**: `medivault-backend` (Important! This tells Render where the Java code is).
6.  **Runtime**: Java.
7.  **Build Command**: `mvn clean package -DskipTests`
8.  **Start Command**: `java -jar target/*.jar`
9.  Click **Create Web Service**.
10. Once deployed, copy your backend URL (e.g., `https://medivault-backend.onrender.com`).

### Option B: Deploy on Railway (Easier, but trial/paid)
1.  Sign up at [railway.app](https://railway.app).
2.  Click **New Project** -> **GitHub Repo**.
3.  Select your repo.
4.  Railway usually auto-detects the Java app. If not, configure the root directory to `medivault-backend`.
5.  It will build and deploy. Copy the provided URL.

---

## Part 2: Host Frontend (React) on Vercel
Now that your backend is running, deploy the frontend to Vercel and connect them.

1.  Go to [vercel.com](https://vercel.com) and sign up/login.
2.  Click **Add New...** -> **Project**.
3.  Import your `medivault` repository.
4.  **Framework Preset**: Vite (should be auto-detected).
5.  **Root Directory**: Click "Edit" and select `medi-vault` (the frontend folder).
6.  **Environment Variables**:
    *   Expand the Environment Variables section.
    *   **Key**: `VITE_API_BASE_URL`
    *   **Value**: Your backend URL + `/api` (e.g., `https://medivault-backend.onrender.com/api`).
    *   *Note: Do not include a trailing slash.*
7.  Click **Deploy**.

## Part 3: Final Configuration (CORS)
Your backend (Spring Boot) has CORS security enabled. It only allows requests from `localhost`. You need to allow your new Vercel domain.

1.  In your `medivault-backend` code, open `src/main/resources/application.properties`.
2.  Update the CORS setting to include your Vercel URL:
    ```properties
    # Add your Vercel domain here once you know it
    app.cors.allowed-origins=http://localhost:5173,https://your-project.vercel.app
    ```
3.  Commit and push this change. Render/Railway will auto-redeploy.

## Summary
1.  **Backend** on Render/Railway.
2.  **Frontend** on Vercel.
3.  **Link them** using `VITE_API_BASE_URL` on Vercel and CORS in Spring Boot.
