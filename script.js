const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const tasklist = document.getElementById("taskList");
const clearAllBtn = document.getElementById("clearAllBtn");
const deleteSelectedBtn = document.getElementById("deleteSelected");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const remainingCount = document.getElementById("remainingCount");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks(){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function showToast(message){
    toast.textContent = message;
    toast.classList.add("show"); //trigger css animation
    setTimeout(()=>toast.classList.remove("show"),2500); //after 2.5 sec remove animation
}

function updateStats(){
    const total = tasks.length;
    const completed = tasks.filter(t=>t.completed).length;
    const remaining = total - completed;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    remainingCount.textContent = remaining;

    const percent = total === 0 ? 0 : (completed/total)*100;
    progressBar.style.width = percent + "%";

    if(total>0 && completed===total){
        showToast("🎉 All tasks completed!");
    }
}

function renderTasks(){
    tasklist.innerHTML = "";

    tasks.forEach((task,index)=>{

        const li = document.createElement("li");
        li.className = "task-item";

        const left = document.createElement("div");
        left.className = "task-left";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "select-task";

        const content = document.createElement("div");
        content.className = "task-content";

        const badge = document.createElement("div");
        badge.className = "status-badge";

        if(task.completed){
            badge.textContent="Completed";
            badge.classList.add("badge-completed");
        } else {
            badge.textContent="Active";
            badge.classList.add("badge-active");
        }

        const text = document.createElement("span");
        text.textContent = task.text;

        text.addEventListener("click",()=>{
            tasks[index].completed = !tasks[index].completed;
            saveTasks();
            renderTasks();
        });

        content.appendChild(badge);
        content.appendChild(text);

        /* SHOW START & END TIME */
        if(task.startTime || task.endTime){
            const time = document.createElement("small");
            time.className="task-time";
            time.textContent = 
                `Start: ${formatDate(task.startTime)} | End: ${formatDate(task.endTime)}`;
            content.appendChild(time);
        }

        /* COUNTDOWN */
        if(task.endTime){
            const countdown = document.createElement("small");
            countdown.className="task-time";

            function updateCountdown(){
                const now = new Date();
                const end = new Date(task.endTime);
                const diff = end - now;

                if(diff <= 0){
                    countdown.textContent="⏰ Time ended";
                    return;
                }

                const hrs = Math.floor(diff/1000/60/60);
                const mins = Math.floor((diff/1000/60)%60);
                countdown.textContent=`⏳ ${hrs}h ${mins}m left`;
            }

            updateCountdown();
            setInterval(updateCountdown,60000);
            content.appendChild(countdown);
        }

        left.appendChild(checkbox);
        left.appendChild(content);

        const right = document.createElement("div");
        right.className="task-right";

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.innerHTML = "✏️";

        editBtn.onclick = () => {
            const newText = prompt("Edit your task:", task.text);
            if(newText && newText.trim() !== ""){
                tasks[index].text = newText.trim();
                saveTasks();
                renderTasks();
                showToast("Task updated");
            }
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.className="delete-btn";
        deleteBtn.innerHTML="&times;";
        deleteBtn.onclick=()=>{
            tasks.splice(index,1);
            saveTasks();
            renderTasks();
            showToast("Task deleted");
        };

        right.appendChild(editBtn);
        right.appendChild(deleteBtn);

        li.appendChild(left);
        li.appendChild(right);

        tasklist.appendChild(li);
    });

    updateStats();
}

/* FORMAT DATE */
function formatDate(dateString){
    if(!dateString) return "-";
    return new Date(dateString).toLocaleString();
}

function addTask(){
    const text = taskInput.value.trim();
    if(!text) return;

    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;

    tasks.push({
        text,
        completed:false,
        startTime:start,
        endTime:end
    });

    saveTasks();
    renderTasks();
    taskInput.value="";
    showToast("Task added");
}

/* DELETE SELECTED */
deleteSelectedBtn.addEventListener("click",()=>{
    const selected = document.querySelectorAll(".select-task:checked");
    if(selected.length === 0){
        showToast("No tasks selected");
        return;
    }

    const indexes = Array.from(selected).map(cb =>
        Array.from(tasklist.children).indexOf(cb.closest("li"))
    );

    tasks = tasks.filter((_,i)=>!indexes.includes(i));
    saveTasks();
    renderTasks();
    showToast("Selected tasks deleted");
});

clearAllBtn.addEventListener("click",()=>{
    tasks=[];
    saveTasks();
    renderTasks();
    showToast("All tasks cleared");
});

addTaskBtn.addEventListener("click",addTask);
taskInput.addEventListener("keypress",(e)=>{
    if(e.key==="Enter") addTask();
});

renderTasks();