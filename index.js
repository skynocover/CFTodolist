addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

const handleRequest = async (request) => {
  if (request.method === 'PUT') {
    return updateTodos(request);
  } else {
    return getTodos(request);
  }
};

const setCache = (data) => TOTOS.put('data', data);
const getCache = () => TOTOS.get('data');

const updateTodos = async (request) => {
  const body = await request.text();
  try {
    let bodyjson = JSON.parse(body);
    const cache = await getCache();
    let cachejson = [];
    if (cache) {
      cachejson = JSON.parse(cache);
    }

    if (bodyjson.id != undefined) {
      cachejson[bodyjson.id] = bodyjson;
    } else {
      let input = {
        id: cachejson.length,
        name: bodyjson.name,
        completed: false,
      };
      cachejson.push(input);
    }

    await setCache(JSON.stringify(cachejson).replace(/</g, '\\u003c'));
    return new Response(body, { status: 200 });
  } catch (err) {
    return new Response({ err }, { status: 500 });
  }
};

const getTodos = async () => {
  let data;
  const cache = await getCache();
  if (!cache) {
    data = [];
  } else {
    data = JSON.parse(cache);
  }

  console.log('data: ', JSON.stringify(data));

  const body = html(JSON.stringify(data));

  return new Response(body, {
    headers: { 'Content-Type': 'text/html' },
  });
};

const html = (todos) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Todos</title>
    <link
      href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css"
      rel="stylesheet"
    />
  </head>
  <body class="bg-blue-100">
    <div class="w-full h-full flex content-center justify-center mt-8">
      <div class="bg-white shadow-md rounded px-8 pt-6 py-8 mb-4">
        <h1 class="block text-grey-800 text-md font-bold mb-2">Todos</h1>
        <div class="flex">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-grey-800 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            name="name"
            placeholder="A new todo"
          />
          <button
            class="bg-blue-500 hover:bg-blue-800 text-white font-bold ml-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            id="create"
            type="submit"
          >
            Create
          </button>
        </div>
        <div class="mt-4" id="todos"></div>
      </div>
    </div>
  </body>
  <script>

    const checkTodos = () => {
      const res = fetch("/", {
        method: "GET",
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (myJson) {
          console.log(myJson);
        });
    };
    // checkTodos();

    window.todos=${todos}

    const completeTodo = (evt) => {
      var checkbox = evt.target;
      var todoElement = checkbox.parentNode;
      var newTodoSet = [].concat(window.todos);
      var todo = newTodoSet.find((t) => t.id == todoElement.dataset.todo);
      console.log("todo: ",todo)
      todo.completed = !todo.completed;
      window.todos = newTodoSet;
      updateTodos(todo);
       populateTodos();
    };

    const populateTodos = () => {
      var todoContainer = document.querySelector("#todos");
      todoContainer.innerHTML = null;
      window.todos.forEach((todo) => {
        let el = document.createElement("div");
        el.className = "border-t py-4";
        el.dataset.todo = todo.id;

        let name = document.createElement("span");
        name.className = todo.completed ? "line-through" : "";
        name.textContent = todo.name;

        let checkbox = document.createElement("input");
        checkbox.className = "mx-4";
        checkbox.type = "checkbox";
        checkbox.checked = todo.completed ? 1 : 0;
        checkbox.addEventListener("change", completeTodo);

        el.appendChild(checkbox);
        el.appendChild(name);
        todoContainer.appendChild(el);
      });
    };
    populateTodos();

    const updateTodos = (name) => {
      fetch("/", {
        method: "PUT",
        body: JSON.stringify(name),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (myJson) {
          console.log(myJson);
        });
    };

    const createTodo = () => {
      var input = document.querySelector("input[name=name]");
      if (input.value.length) {
        let todo = {
          id: window.todos.length,
          name: input.value,
          completed: false,
        };

        window.todos = [].concat(todos, todo);
        populateTodos();
        updateTodos(todo);
        input.value = "";
        
      }
    };
    document.querySelector("#create").addEventListener("click", createTodo);
  </script>
</html>

  `;
