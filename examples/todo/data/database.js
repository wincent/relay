export class Todo extends Object {}
export class User {
  constructor(id, name, hometown) {
    this.id = id;
    this.name = name;
    this.hometown = hometown;
  }
}

// Mock authenticated ID
const VIEWER_ID = 'me';

// Mock user data
var usersById = {
  [VIEWER_ID]: new User('me', 'You', 'San Francisco'),
  4: new User('4', 'Mark', 'Menlo Park'),
  660361306: new User('660361306', 'Greg', 'Adelaide'),
};

// Mock todo data
var todosById  = {};
var todoIdsByUser = {
  [VIEWER_ID]: [],
};
var nextTodoId = 0;

// Based on http://stackoverflow.com/a/20871714/2103996
function permute(inputArr) {
  var results = [];
  function permutator(arr, memo) {
    var cur, memo = memo || [];
    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permutator(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }
    return results;
  }
  return permutator(inputArr);
}

const words = ['foo', 'bar', 'baz', 'fizz', 'buzz'];
const userIDs = Object.keys(usersById);
permute(words).forEach((todoWords, i) => {
  addTodo(
    todoWords.join(' '),
    i % 2,
    usersById[userIDs[i % userIDs.length]].id
  );
});

export function addTodo(text, complete, creatorID = VIEWER_ID) {
  var todo = new Todo();
  todo.complete = !!complete;
  todo.creatorID = creatorID;
  todo.id = `${nextTodoId++}`;
  todo.text = text;
  todosById[todo.id] = todo;
  todoIdsByUser[VIEWER_ID].push(todo.id);
  return todo.id;
}

export function changeTodoStatus(id, complete) {
  var todo = getTodo(id);
  todo.complete = complete;
}

export function getTodo(id) {
  return todosById[id];
}

export function getTodos() {
  return todoIdsByUser[VIEWER_ID].map((id) => todosById[id]);
}

export function getUser(id) {
  return usersById[id];
}

export function getViewer() {
  return getUser(VIEWER_ID);
}

export function markAllTodos(complete) {
  var changedTodos = [];
  getTodos().forEach(todo => {
    if (todo.complete !== complete) {
      todo.complete = complete;
      changedTodos.push(todo);
    }
  });
  return changedTodos.map(todo => todo.id);
}

export function removeTodo(id) {
  var todoIndex = todoIdsByUser[VIEWER_ID].indexOf(id);
  if (todoIndex !== -1) {
    todoIdsByUser[VIEWER_ID].splice(todoIndex, 1);
  }
  delete todosById[id];
}

export function removeCompletedTodos() {
  var todosToRemove = getTodos().filter((todo) => todo.complete);
  todosToRemove.forEach((todo) => removeTodo(todo.id));
  return todosToRemove.map(todo => todo.id);
}

export function renameTodo(id, text) {
  var todo = getTodo(id);
  todo.text = text;
}
