# TaskFlow — To-Do App

A clean, dark-themed to-do list app built with vanilla HTML, CSS, and JavaScript.  
Designed to be analyzed with **SonarQube Cloud** as a learning exercise.

---

## 📁 Project Structure

```
todo-app/
├── index.html                  ← Main page
├── css/
│   └── style.css               ← Styles
├── js/
│   └── app.js                  ← App logic
├── .github/
│   └── workflows/
│       └── sonar.yml           ← GitHub Actions CI for SonarCloud
├── sonar-project.properties    ← SonarCloud config
└── README.md
```

---

## 🚀 Features

- Add, edit, delete tasks
- Priority levels (Low / Medium / High)
- Filter: All / Active / Completed
- Persistent storage via localStorage
- Keyboard shortcuts (Enter to add/save)
- Responsive design

---

## 🔬 SonarCloud Setup (Step-by-Step)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: TaskFlow To-Do App"
git remote add origin https://github.com/YOUR_USERNAME/taskflow-todo.git
git push -u origin main
```

### Step 2 — Create a SonarCloud Account

1. Go to [sonarcloud.io](https://sonarcloud.io)
2. Sign in with your GitHub account
3. Click **"Analyze new project"**
4. Select your `taskflow-todo` repository
5. Choose **"With GitHub Actions"** as the analysis method

### Step 3 — Add SONAR_TOKEN Secret

1. SonarCloud will generate a token for you
2. In your GitHub repo → **Settings → Secrets and variables → Actions**
3. Add a new secret named `SONAR_TOKEN` with that value

### Step 4 — Update sonar-project.properties

Edit `sonar-project.properties` and replace:
```
sonar.projectKey=your-github-username_taskflow-todo
sonar.organization=your-sonarcloud-org
```
with the values shown in your SonarCloud dashboard.

### Step 5 — Trigger Analysis

Push any commit to `main`:
```bash
git add sonar-project.properties
git commit -m "Configure SonarCloud"
git push
```

GitHub Actions will run the workflow automatically.  
Check the **Actions** tab in GitHub, then view results at [sonarcloud.io](https://sonarcloud.io).

---

## 🐛 Known Issues (for SonarQube Learning)

The code intentionally contains realistic issues that SonarQube will detect:

| Issue | Location | Category |
|---|---|---|
| `var` instead of `const`/`let` | `app.js` throughout | Code Smell |
| `==` instead of `===` | `app.js` multiple places | Code Smell / Bug |
| Empty `catch` block | `saveTasks()` | Bug |
| `JSON.parse` without try/catch | `loadTasks()` | Vulnerability |
| `innerHTML` with unsanitized user input | `renderTasks()` | Security Hotspot |
| Deprecated `e.keyCode` | event listeners | Code Smell |
| Duplicated validation logic | `addTask()` + `saveEdit()` | Code Smell |
| `alert()` in production code | multiple functions | Code Smell |
| Magic strings (filter values) | `filterTasks()` | Code Smell |
| Large function (cognitive complexity) | `renderTasks()` | Code Smell |
