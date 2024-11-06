#Django-taskApp-auth
##Aplicación de tareas con autenticación desarrollado en Django.<

##Pasos para correr servidor

* Entorno
  ``` python -m venv venv source env/bin/activate ```

* Instalar dependencias
  ``` pip install -r requirements.txt ```

* Configurar variables de entono
``` SECRET_KEY= Tu secret key de Django ```
* Aplicar migraciones de la base datos
``` python manage.py migrate ```

* Crear un superusuario
  ``` python manage.py createsuperuser ```

* Ejecutar el servidor 
``` python manage.py runserver ```
