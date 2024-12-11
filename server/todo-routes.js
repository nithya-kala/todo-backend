const _ = require('lodash');
const todos = require('./database/todo-queries.js');

function createdUser(req, data) {
  const protocol = req.protocol, 
    host = req.get('host'), 
    id = data.id;

  return {
    name: data.name,
    email: data.email,
    password: data.password_hash,
    url: `${protocol}://${host}/users/${id}`
  };
}

function createdProject(req, data) {
  const protocol = req.protocol, 
    host = req.get('host'), 
    id = data.id;

  return {
    name: data.name,
    description: data.description,
    owner_id: data.owner_id,
    url: `${protocol}://${host}/projects/${id}`
  };
}

function createdTask(req, data) {
  const protocol = req.protocol, 
    host = req.get('host'), 
    id = data.id;

  return {
    name: data.name,
    description: data.description,
    status: data.status,
    project: data.project_id,
    url: `${protocol}://${host}/tasks/${id}`
  };
}

function assignedTask(req, data) {
  const protocol = req.protocol, 
    host = req.get('host'), 
    id = data.id;

  return {
    task_id: data.task_id,
    user_id: data.user_id,
    url: `${protocol}://${host}/assigned_task/${id}`
  };
}



async function postUser(req, res) {
  const created = await todos.createUser(req.body.name, req.body.email,  req.body.password_hash);
  return res.send(createdUser(req, created));
}

async function getUser(req, res) {
  const user = await todos.get(req.params.id);
  return res.send(user);
}

async function postProject(req, res) {
  const created = await todos.createProject(req.body.name, req.body.description,  req.body.owner_id);
  return res.send(createdProject(req, created));
}


async function postTask(req, res) {
  const created = await todos.createTask(req.body.title, req.body.description,  req.body.status, req.body.project_id);
  return res.send(createdTask(req, created));
}

async function assignTask(req, res) {
  console.log(req.params.task_id   +  req.body.user_id)
  const created = await todos.assignTask(req.params.task_id, req.body.user_id);
  return res.send(assignedTask(req, created));
}



function addErrorReporting(func, message) {
    return async function(req, res) {
        try {
            return await func(req, res);
        } catch(err) {
            console.log(`${message} caused by: ${err}`);

            // Not always 500, but for simplicity's sake.
            res.status(500).send(`Opps! ${message}.`);
        } 
    }
}

const toExport = {
    postUser: { method: postUser, errorMessage: "Could not fetch all todos" },
    postProject: { method: postProject, errorMessage: "Could not fetch all todos" },
    getUser: { method: getUser, errorMessage: "Could not fetch all todos" },
    postTask:  { method: postTask, errorMessage: "Could not fetch all todos" },
    assignTask: { method: assignTask, errorMessage: "Could not fetch all todos" },
}

for (let route in toExport) {
    toExport[route] = addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = toExport;
