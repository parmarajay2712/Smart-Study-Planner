// Elements
const taskForm = document.getElementById("taskForm");
const tasksDiv = document.getElementById("tasks");
const timelineDiv = document.getElementById("timeline");
const searchInput = document.getElementById("search");
const themeToggle = document.getElementById("themeToggle");
const bellCount = document.getElementById("bellCount");
const bellDropdown = document.getElementById("bellDropdown");
const progressBar = document.getElementById("progressBar");

// Load tasks
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save tasks and render
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  renderTimeline();
  updateProgress();
  updateBell();
}

// Add task
function addTask(task) {
  tasks.push(task);
  saveTasks();
}

// Delete task
function deleteTask(id) {
  if (confirm("Delete this task?")) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
  }
}

// Toggle status
function toggleStatus(id) {
  tasks = tasks.map((t) =>
    t.id === id
      ? { ...t, status: t.status === "Completed" ? "Pending" : "Completed" }
      : t
  );
  saveTasks();
}

// Render tasks
function renderTasks() {
  const searchText = searchInput.value.toLowerCase();
  tasksDiv.innerHTML = "";
  tasks
    .filter(
      (t) =>
        t.subject.toLowerCase().includes(searchText) ||
        t.topic.toLowerCase().includes(searchText)
    )
    .forEach((task) => {
      const div = document.createElement("div");
      div.className = `task-card ${task.priority.toLowerCase()} ${
        task.status === "Completed" ? "completed" : ""
      }`;
      div.innerHTML = `
        <strong>${task.subject}</strong> - ${task.topic} <br>
        Due: ${task.dueDate} | Priority: ${task.priority} | Status: ${task.status}
        <br>
        <button onclick="toggleStatus('${task.id}')">Toggle Status</button>
        <button onclick="deleteTask('${task.id}')">Delete</button>
      `;
      tasksDiv.appendChild(div);
    });
}

// Render timeline
function renderTimeline() {
  timelineDiv.innerHTML = "";
  tasks
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .forEach((task) => {
      const div = document.createElement("div");
      div.className = "timeline-card";
      div.textContent = `${task.dueDate} → ${task.subject}: ${task.topic} [${task.status}]`;
      timelineDiv.appendChild(div);
    });
}

// Update progress bar
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressBar.style.width = percent + "%";
}

// Update bell notifications
function updateBell() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const upcoming = tasks.filter((t) => {
    const taskDate = new Date(t.dueDate);
    // Only compare dates, ignore time
    return taskDate >= today && taskDate <= tomorrow;
  });

  bellCount.textContent = upcoming.length;
  bellDropdown.innerHTML =
    upcoming.length === 0
      ? "No upcoming tasks"
      : upcoming
          .map((t) => `${t.subject}: ${t.topic} (${t.dueDate})`)
          .join("<br>");
}

// Event listeners
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const task = {
    id: Date.now().toString(),
    subject: taskForm.subject.value,
    topic: taskForm.topic.value,
    dueDate: taskForm.dueDate.value,
    priority: taskForm.priority.value,
    status: "Pending",
  };
  addTask(task);
  taskForm.reset();
});

searchInput.addEventListener("input", renderTasks);
themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode", themeToggle.checked);
});

// Initialize
renderTasks();
renderTimeline();
updateProgress();
updateBell();
