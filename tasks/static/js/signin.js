console.log("running signin.js");
const alertPlaceholder = document.getElementById('alert-message')

const displayErrorMessage = (message, type) => {
   // Elimina cualquier alerta existente
   alertPlaceholder.innerHTML = '';

  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('')

  alertPlaceholder.append(wrapper)
}
function alertMessage(icon, title, text){
    return Swal.fire({
                title: title,
                text: text,
                icon: icon,
                timer: 2500,
                showConfirmButton: false
      });
  }

document.querySelector("#signin-form").addEventListener("submit", async (e) => {
    e.preventDefault()
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    const userLog = {
        username, password
    }

    try {
        const response = await fetch(window.location.origin + '/signin/', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value // Token CSRF
            },
            body : JSON.stringify(userLog)
        })
        const data = await response.json()
                
        // Manejar la respuesta del servidor
        if (response.ok) { // El registro fue exitoso
            alertMessage(data.icon, data.title, data.text);
            setTimeout(() => {
                window.location.href = window.location.origin + data.redirect;
            }, 2500);
        } else { // Hubo un error en el registro
            displayErrorMessage(data.message, 'danger'); // Muestra el error en el div
        }
    } catch (error) {
        // Manejar errores de red u otros problemas
        console.error("Error:", error.message);
        displayErrorMessage("Ocurrió un error inesperado. Inténtalo de nuevo más tarde.", 'danger');
    }
});