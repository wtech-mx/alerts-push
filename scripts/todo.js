// crear una referencia a la lista de notificaciones en la parte inferior de la aplicación;

// escribiremos los mensajes de la base de datos en esta lista por

//agregar elementos de la lista al HTML interno de esta variable- estas son todas las líneas que dicen nota.innerHTML += '<li>foo</li>';

const note = document.getElementById('notifications');

// crear una instancia de un objeto db para que almacenemos los datos del IDB en

let db;

// Cree una instancia en blanco del objeto que se utiliza para transferir datos al BID.
// Esto es principalmente para referencia.

let newItem = [
      { taskTitle: "", hours: 0, minutes: 0, day: 0, month: "", year: 0, notified: "no" }
    ];

// todas las variables que necesitamos para la aplicación

const taskList = document.getElementById('task-list');

const taskForm = document.getElementById('task-form');
const title = document.getElementById('title');

const hours = document.getElementById('deadline-hours');
const minutes = document.getElementById('deadline-minutes');

const datecm = document.getElementById('datecm');

const day = document.getElementById('deadline-day');

const month = document.getElementById('deadline-month');


const year = document.getElementById('deadline-year');


const submit = document.getElementById('submit');

const notificationBtn = document.getElementById('enable');

// Haga una verificación inicial para ver cuál es el estado del permiso de notificación

if(Notification.permission === 'denied' || Notification.permission === 'default') {
  notificationBtn.style.display = 'block';
} else {
  notificationBtn.style.display = 'none';
}

window.onload = function() {
  note.innerHTML += '<li>Aplicación inicializada.</li>';
  // En la siguiente línea, debe incluir los prefijos de las implementaciones que desea probar.
  window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  // NO use "var indexedDB = ..." si no está en una función.
  // Además, es posible que necesite referencias a algunos objetos window.IDB:
  window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
  window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
  // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

  // Abramos nuestra base de datos
  const DBOpenRequest = window.indexedDB.open("toDoList", 4);

  // Opción de almacenamiento temporal IndexedDB solo de Gecko:
  // var request = window.indexedDB.open("toDoList", {version: 4, storage: "temporary"});

  // estos dos controladores de eventos actúan sobre la base de datos que se abre con éxito, o no
  DBOpenRequest.onerror = function(event) {
    note.innerHTML += '<li>Error al cargar la base de datos.</li>';
  };

  DBOpenRequest.onsuccess = function(event) {
    note.innerHTML += '<li>Base de datos inicializada.</li>';

    // almacenar el resultado de abrir la base de datos en la variable db. Esto se usa mucho a continuación
    db = DBOpenRequest.result;

    // Run the displayData() function to completar la lista de tareas con todos los datos de la lista de tareas pendientes que ya se encuentran en el idb
    displayData();
  };

  // Este evento maneja el evento por el cual se necesita crear una nueva versión de la base de datos.
  // O no se ha creado antes o se ha enviado un nuevo número de versión a través del
  // window.indexedDB.open line above
  //solo se implementa en navegadores recientes
  DBOpenRequest.onupgradeneeded = function(event) {
    let db = event.target.result;

    db.onerror = function(event) {
      note.innerHTML += '<li>Error al cargar la base de datos.</li>';
    };

    // Cree un objectStore para esta base de datos

    let objectStore = db.createObjectStore("toDoList", { keyPath: "taskTitle" });

    // definir qué elementos de datos contendrá el objectStore

    objectStore.createIndex("hours", "hours", { unique: false });
    objectStore.createIndex("minutes", "minutes", { unique: false });
    objectStore.createIndex("datecm", "datecm", { unique: false });
    objectStore.createIndex("day", "day", { unique: false });
    objectStore.createIndex("month", "month", { unique: false });
    objectStore.createIndex("year", "year", { unique: false });

    objectStore.createIndex("notified", "notified", { unique: false });

    note.innerHTML += '<li>Object store created.</li>';
  };

  function displayData() {
    // Primero borre el contenido de la lista de tareas para que no obtenga una lista enorme y larga de cosas duplicadas cada vez.
    // la pantalla se actualiza.
    taskList.innerHTML = "";

    // Abra nuestro almacén de objetos y luego obtenga una lista de cursores de todos los diferentes elementos de datos en el BID para iterar
    let objectStore = db.transaction('toDoList').objectStore('toDoList');
    objectStore.openCursor().onsuccess = function(event) {
      let cursor = event.target.result;
        // si aún queda otro cursor, siga ejecutando este código
        if(cursor) {
          // crear un elemento de lista para poner cada elemento de datos dentro al mostrarlo
          const listItem = document.createElement('li');

          // comprobar qué sufijo necesita el día límite del mes
          if(cursor.value.day == 1 || cursor.value.day == 21 || cursor.value.day == 31) {
            daySuffix = "st";
          } else if(cursor.value.day == 2 || cursor.value.day == 22) {
            daySuffix = "nd";
          } else if(cursor.value.day == 3 || cursor.value.day == 23) {
            daySuffix = "rd";
          } else {
            daySuffix = "th";
          }

          //cree la entrada de la lista de tareas pendientes y colóquela en el elemento de la lista a través de innerHTML.
          listItem.innerHTML = cursor.value.taskTitle + ' — ' + cursor.value.hours + ':' + cursor.value.minutes + ', ' + cursor.value.month + ' ' + cursor.value.day + daySuffix + ' ' + cursor.value.year + '.';

          if(cursor.value.notified == "yes") {
            listItem.style.textDecoration = "line-through";
            listItem.style.color = "rgba(255,0,0,0.5)";
          }

          // poner el elemento dentro de la lista de tareas
          taskList.appendChild(listItem);

          // cree un botón de eliminación dentro de cada elemento de la lista, dándole un controlador de eventos para que ejecute el botón de eliminación ()
          // función cuando se hace clic
          const deleteButton = document.createElement('button');
          listItem.appendChild(deleteButton);
          deleteButton.innerHTML = 'X';
          // aquí estamos configurando un atributo de datos en nuestro botón de eliminar para decir qué tarea queremos eliminar si se hace clic en ella.
          deleteButton.setAttribute('data-task', cursor.value.taskTitle);
          deleteButton.onclick = function(event) {
            deleteItem(event);
          }

          // aquí estamos configurando un atributo de datos en nuestro botón de eliminar para decir qué tarea queremos eliminar si se hace clic en ella.
          cursor.continue();

        // si no hay más elementos de cursor para iterar, dígalo y salga de la función
        } else {
          note.innerHTML += '<li>Todas las entradas mostradas.</li>';
        }
      }
    }

  // dar al botón de envío del formulario un detector de eventos para que cuando se envíe el formulario se ejecute la función addData ()
  taskForm.addEventListener('submit',addData,false);

  function addData(e) {
    //evitar el incumplimiento: no queremos que el formulario se envíe de la forma convencional
    e.preventDefault();

    // Detenga el envío del formulario si algún valor se deja vacío. Esto es solo para navegadores que no admiten el formulario HTML5.
    // atributos requeridos
    if(title.value == '' || hours.value == null || minutes.value == null || day.value == '' || month.value == '' || year.value == null) {
      note.innerHTML += '<li>Datos no enviados - formulario incompleto.</li>';
      return;
    } else {

      // tomar los valores ingresados en los campos del formulario y almacenarlos en un objeto listo para ser insertado en el BID
      let newItem = [
        { taskTitle: title.value, hours: hours.value, minutes: minutes.value, day: day.value, month: month.value, year: year.value, notified: "no" }
      ];

      // abra una transacción de lectura / escritura de base de datos, lista para agregar los datos
      let transaction = db.transaction(["toDoList"], "readwrite");

      // informe sobre el éxito de la transacción completada, cuando todo esté hecho
      transaction.oncomplete = function() {
        note.innerHTML += '<li>Transacción completada: modificación de la base de datos finalizada.</li>';

        // actualice la visualización de datos para mostrar el elemento recién agregado, ejecutando displayData () nuevamente.
        displayData();
      };

      transaction.onerror = function() {
        note.innerHTML += '<li>Transacción no abierta debido a error: ' + transaction.error + '</li>';
      };

      // llamar a un almacén de objetos que ya se ha agregado a la base de datos
      let objectStore = transaction.objectStore("toDoList");
      console.log(objectStore.indexNames);
      console.log(objectStore.keyPath);
      console.log(objectStore.name);
      console.log(objectStore.transaction);
      console.log(objectStore.autoIncrement);

      // Haga una solicitud para agregar nuestro objeto newItem al almacén de objetos
      let objectStoreRequest = objectStore.add(newItem[0]);
        objectStoreRequest.onsuccess = function(event) {

      // reportar el éxito de nuestra solicitud
      // (para detectar si se ha agregado exitosamente
      // a la base de datos, debe mirar a transaction.oncomplete)
          note.innerHTML += '<li>Solicitud exitosa.</li>';

          // limpia el formulario, listo para agregar la siguiente entrada
          title.value = '';
          hours.value = null;
          minutes.value = null;
          day.value = 01;
          month.value = 'January';
          year.value = 2020;

        };

      };

    };

  function deleteItem(event) {
    // recuperar el nombre de la tarea que queremos eliminar
    let dataTask = event.target.getAttribute('data-task');

    // abrir una transacción de base de datos y eliminar la tarea, encontrándola por el nombre que recuperamos arriba
    let transaction = db.transaction(["toDoList"], "readwrite");
    let request = transaction.objectStore("toDoList").delete(dataTask);

    // informar que el elemento de datos ha sido eliminado
    transaction.oncomplete = function() {
      // eliminar el padre del botón, que es el elemento de la lista, por lo que ya no se muestra
      event.target.parentNode.parentNode.removeChild(event.target.parentNode);
      note.innerHTML += '<li>Task \"' + dataTask + '\" deleted.</li>';
    };
  };

  // esta función comprueba si la fecha límite para cada tarea ha finalizado o no, y responde adecuadamente
  function checkDeadlines() {
    // En primer lugar, compruebe si las notificaciones están habilitadas o denegadas.
    if(Notification.permission === 'denied' || Notification.permission === 'default') {
      notificationBtn.style.display = 'block';
    } else {
      notificationBtn.style.display = 'none';
    }

    // toma la hora y la fecha ahora mismo
    const now = new Date();

    // desde la variable ahora, almacena los minutos, horas, día del mes actuales (para esto se necesita getDate, como getDay
     // devuelve el día de la semana, 1-7), mes, año (se necesita getFullYear; getYear está en desuso y devuelve un valor extraño
     // ¡Eso no es de mucha utilidad para nadie!) y segundos
    const minuteCheck = now.getMinutes();
    const hourCheck = now.getHours();
    const dayCheck = now.getDate();
    const monthCheck = now.getMonth();
    const yearCheck = now.getFullYear();

    //nuevamente, abra una transacción y luego un cursor para recorrer todos los elementos de datos en el BID
    let objectStore = db.transaction(['toDoList'], "readwrite").objectStore('toDoList');
    objectStore.openCursor().onsuccess = function(event) {
      let cursor = event.target.result;
        if(cursor) {

          // convertir los nombres de los meses que hemos instalado en el BID en un número de mes que JavaScript entenderá.
         // El objeto de fecha de JavaScript crea valores de mes como un número entre 0 y 11.
        switch(cursor.value.month) {
          case "January":
            var monthNumber = 0;
            break;
          case "February":
            var monthNumber = 1;
            break;
          case "March":
            var monthNumber = 2;
            break;
          case "April":
            var monthNumber = 3;
            break;
          case "May":
            var monthNumber = 4;
            break;
          case "June":
            var monthNumber = 5;
            break;
          case "July":
            var monthNumber = 6;
            break;
          case "August":
            var monthNumber = 7;
            break;
          case "September":
            var monthNumber = 8;
            break;
          case "October":
            var monthNumber = 9;
            break;
          case "November":
            var monthNumber = 10;
            break;
          case "December":
            var monthNumber = 11;
            break;
          default:
          alert('Incorrect month entered in database.');
        }
            // verifica si los valores actuales de horas, minutos, día, mes y año coinciden con los valores almacenados para cada tarea en el BID.
           // El operador + en este caso convierte los números con ceros iniciales en sus equivalentes de cero no iniciales, por ejemplo,
           // 09 -> 9. Esto es necesario porque los valores de los números de fecha JS nunca tienen ceros a la izquierda, pero nuestros datos sí.
           // La verificación secondsCheck = 0 es para que no reciba notificaciones duplicadas para la misma tarea. La notificación
           // solo aparecerá cuando los segundos sean 0, lo que significa que no recibirás más de una notificación para cada tarea
          if(+(cursor.value.hours) == hourCheck && +(cursor.value.minutes) == minuteCheck && +(cursor.value.day) == dayCheck && monthNumber == monthCheck && cursor.value.year == yearCheck && cursor.value.notified == "no") {

              // Si todos los números coinciden, ejecute la función createNotification () para crear una notificación del sistema
             // pero solo si el permiso está establecido

            if(Notification.permission === 'granted') {
              createNotification(cursor.value.taskTitle);
            }
          }

          // seguir adelante y realizar la misma verificación de fecha límite en el siguiente elemento del cursor
          cursor.continue();
        }

    }

  }


  //función askNotificationPermission para solicitar permiso cuando se hace clic en el botón "Habilitar notificaciones"

  function askNotificationPermission() {
    // función para pedir realmente los permisos
    function handlePermission(permission) {
      // Independientemente de lo que responda el usuario, nos aseguramos de que Chrome almacene la información
      if(!('permission' in Notification)) {
        Notification.permission = permission;
      }

      // establecer el botón en mostrado u oculto, dependiendo de lo que responda el usuario
      if(Notification.permission === 'denied' || Notification.permission === 'default') {
        notificationBtn.style.display = 'block';
      } else {
        notificationBtn.style.display = 'none';
      }
    }

    // Comprobemos si el navegador admite notificaciones.
    if (!"Notification" in window) {
      console.log("Este navegador no admite notificaciones.");
    } else {
      if(checkNotificationPromise()) {
        Notification.requestPermission()
        .then((permission) => {
          handlePermission(permission);
        })
      } else {
        Notification.requestPermission(function(permission) {
          handlePermission(permission);
        });
      }
    }
  }

    // Función para verificar si el navegador es compatible con la versión de promesa de requestPermission ()
   // Safari solo admite la versión anterior basada en devolución de llamada
  function checkNotificationPromise() {
    try {
      Notification.requestPermission().then();
    } catch(e) {
      return false;
    }

    return true;
  }

  //conecte la funcionalidad de permiso de notificación al botón "Habilitar notificaciones"

  notificationBtn.addEventListener('click', askNotificationPermission);



  // función para crear la notificación
  function createNotification(title) {

    // Crea y muestra la notificación
    let img = '/to-do-notifications/img/icon-128.png';
    let text = 'HEY! Your task "' + title + '" is now overdue.';
    let notification = new Notification('Alerta', { body: text, icon: img });

      // necesitamos actualizar el valor de notificado a "sí" en este objeto de datos en particular, por lo que
     // la notificación no se activará de nuevo

    // primero abre una transacción como de costumbre
    let objectStore = db.transaction(['toDoList'], "readwrite").objectStore('toDoList');

    // obtener el objeto de la lista de tareas pendientes que tiene este título como título
    let objectStoreTitleRequest = objectStore.get(title);

    objectStoreTitleRequest.onsuccess = function() {
      //tomar el objeto de datos devuelto como resultado
      let data = objectStoreTitleRequest.result;

      // actualizar el valor notificado en el objeto a "sí"
      data.notified = "yes";

      // crear otra solicitud que inserte el elemento de nuevo en la base de datos
      let updateTitleRequest = objectStore.put(data);

      //cuando esta nueva solicitud tenga éxito, ejecute la función displayData () nuevamente para actualizar la pantalla
      updateTitleRequest.onsuccess = function() {
        displayData();
      }
    }
  }

  // usando un setInterval para ejecutar la función checkDeadlines () cada segundo
  setInterval(checkDeadlines, 1000);
}
