const app = require('./server-config.js');
const routes = require('./server-routes.js');
const todoRoutes = require('./todo-routes.js');

const port = process.env.PORT || 5000;

app.get('/', routes.getAllTodos);
app.get('/:id', routes.getTodo);

app.post('/', routes.postTodo);
app.patch('/:id', routes.patchTodo);

app.delete('/', routes.deleteAllTodos);
app.delete('/:id', routes.deleteTodo);

// todo-app
app.post('/users', todoRoutes.postUser);
app.get('/users/:id', todoRoutes.getUser)
app.post('/projects', todoRoutes.postProject);
app.post('/tasks', todoRoutes.postTask);
app.post('/assign/:task_id', todoRoutes.assignTask);


if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Listening on port ${port}`));
}

module.exports = app;