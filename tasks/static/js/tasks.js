const alertPlaceholder = document.getElementById("message"); //Mensajes del formulario
let taskId = document.querySelector("#taskId");
let editTaskForm = false; // Variable para saber si se está editando una tarea

const displayErrorMessage = (message, type) => {
  // Elimina cualquier alerta existente
  alertPlaceholder.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    "</div>",
  ].join("");

  alertPlaceholder.append(wrapper);
};
/* Mensajes de tareas */
function alertMessage(icon, title, text) {
  return Swal.fire({
    title: title,
    text: text,
    icon: icon,
    timer: 2500,
    showConfirmButton: true,
  });
}

/* Se obtiene todas las tareas del usuario por defecto estan pendientes */
async function getAllTasks() {
  try {
    const response = await fetch(window.location.origin + "/api/tasks/");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function renderTasks() {
  const tasks = await getAllTasks();
  const pendingTasksEl = document.getElementById("pendingTasks");
  const completedTasksEl = document.getElementById("completedTasks");

  pendingTasksEl.innerHTML = "";
  completedTasksEl.innerHTML = "";

  // Variables para contar las tareas pendientes y completadas
  let pendingCount = 0;
  let completedCount = 0;
  tasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.className = "card mb-2";
    taskCard.innerHTML = `
                      <div class="card-body ${
                        task.datecompleted ? "completed-task" : ""
                      }">
                          <a href="/tasks/${task.id}" class="card-title h5">${task.title}</a>
                          <p class="card-text">${task.description}</p>
                          <p class="state">${
                            task.important
                              ? '<span class="badge bg-danger">Importante</span>'
                              : ""
                          }</p>
                          <div class="btn-group" role="group">
                              <a class="btn btn-sm btn-outline-primary edit-task" data-id="${
                                task.id
                              }" href="#taskForm">Editar</a>
                              <button class="btn btn-sm btn-outline-danger delete-task" data-id="${
                                task.id
                              }">Eliminar</button>
                              <button class="btn btn-sm btn-outline-success toggle-task" data-id="${
                                task.id
                              }">
                                  ${
                                    task.datecompleted
                                      ? "Marcar como Pendiente"
                                      : "Marcar como Completada"
                                  }
                              </button>
                          </div>
                      </div>
                  `;
    if (task.datecompleted) {
      completedTasksEl.appendChild(taskCard);
      completedCount++;
    } else {
      pendingTasksEl.appendChild(taskCard);
      pendingCount++;
    }
  });
  // Agregar event listeners a los botones
  document.querySelectorAll(".edit-task").forEach((button) => {
    button.addEventListener("click", editTask);
  });
  document.querySelectorAll(".delete-task").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      modalDelete(id);
    });
  });

  document.querySelectorAll(".toggle-task").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      await toggleTask(id);
    });
  });

  // Mostrar un mensaje si no hay tareas en una de las categorías
  if (pendingCount === 0) {
    pendingTasksEl.innerHTML = `
                  <div class="text-center mt-4">
                      <p class="text-muted">No tienes tareas pendientes en este momento.</p>
                  </div>`;
  }

  if (completedCount === 0) {
    completedTasksEl.innerHTML = `
                  <div class="text-center mt-4">
                      <p class="text-muted">No has completado ninguna tarea todavía.</p>
                  </div>`;
  }
}

renderTasks();

/* Marcar tarea como completada o pendiente */
async function toggleTask(id) {
  const task_id = id;
  const toggleTask = window.location.origin + `/tasks/${task_id}/complete`;
  try {
    const response = await fetch(toggleTask, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
          .value, // Token CSRF
      },
    });
    const data = await response.json();

    if (response.ok) {
      alertMessage(data.icon, data.title, data.text);
    }
    renderTasks();
  } catch (error) {
    console.error(error.message);
  }
}
/* Actualizar tarea */
function editTask(e) {
  editTaskForm = true;

  let title = document.querySelector("#id_title");
  let description = document.querySelector("#id_description");
  let important = document.querySelector("#id_important");

  title.value =
    e.target.parentElement.parentElement.querySelector(
      ".card-title"
    ).textContent;
  description.value =
    e.target.parentElement.parentElement.querySelector(
      ".card-text"
    ).textContent;
  important.checked = e.target.parentElement.parentElement.querySelector(
    ".state"
  ).textContent
    ? true
    : false;
  taskId.value = e.target.dataset.id;
}

/* Eliminar tarea */
async function deleteTask(id) {
  const task_id = id;
  const deleteTask = window.location.origin + `/tasks/${task_id}/delete`;
  try {
    const response = await fetch(deleteTask, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
          .value, // Token CSRF
      },
    });
    const data = await response.json();
    if (response.ok) {
      alertMessage(data.icon, data.title, data.text);
      renderTasks();
    } else {
      alertMessage(data.icon, data.title, data.text);
    }
  } catch (error) {
    console.error(error);
  }
}

/* Modal para eliminar la tarea */
const modalDelete = async (id) => {
  Swal.fire({
    title: "Eliminar tarea",
    text: "¿Estás seguro de eliminar esta tarea?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Si, lo quiero eliminar",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await deleteTask(id); // Espera a que la función deleteTask se complete
    } else {
      Swal.fire("Cancelado", "Tarea no eliminada", "error");
    }
  });
};

document.querySelector("#taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.querySelector("#id_title").value;
  const description = document.querySelector("#id_description").value;
  const important = document.querySelector("#id_important").checked;

  const task = {
    title,
    description,
    important,
  };

  if (editTaskForm) {
    task.id = document.querySelector("#taskId").value;
  }
  const createTask = window.location.origin + "/tasks/";
  const updateTask = window.location.origin + `/tasks/${task.id}/update`;

  try {
    const response = await fetch(editTaskForm ? updateTask : createTask, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]")
          .value, // Token CSRF
      },
      body: JSON.stringify(task),
    });
    const data = await response.json();
    if (response.ok) {
      alertMessage(data.icon, data.title, data.text);
      document.querySelector("#taskForm").reset();
    } else {
      displayErrorMessage(data.message, data.alertType);
    }
  } catch (error) {
    console.log(error);
    console.log(error.message);
    displayErrorMessage(error.message, "danger");
  }
  renderTasks();
  editTaskForm = false;
  taskId.value = "";
});
