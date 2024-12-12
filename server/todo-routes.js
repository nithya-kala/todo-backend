const _ = require('lodash');
const todos = require('./database/todo-queries.js');

/**
 * Formats user data for API response
 * @param {Object} req - Express request object
 * @param {Object} data - User data from database
 * @returns {Object} Formatted user object with URL
 */
function createdUser(req, data) {
  return {
    name: data.name,
    email: data.email,
    password: data.password_hash,
    url: constructUrl(req, 'users', data.id)
  };
}

/**
 * Formats project data for API response
 * @param {Object} req - Express request object
 * @param {Object} data - Project data from database
 * @returns {Object} Formatted project object with URL
 */
function createdProject(req, data) {
  return {
    name: data.name,
    description: data.description,
    owner_id: data.owner_id,
    url: constructUrl(req, 'projects', data.id)
  };
}

/**
 * Formats task data for API response
 * @param {Object} req - Express request object
 * @param {Object} data - Task data from database
 * @returns {Object} Formatted task object with URL
 */
function createdTask(req, data) {
  return {
    name: data.name,
    description: data.description,
    status: data.status,
    project: data.project_id,
    url: constructUrl(req, 'tasks', data.id)
  };
}

/**
 * Formats task assignment data for API response
 * @param {Object} req - Express request object
 * @param {Object} data - Task assignment data from database
 * @returns {Object} Formatted task assignment object with URL
 */
function assignedTask(req, data) {
  return {
    task_id: data.task_id,
    user_id: data.user_id,
    url: constructUrl(req, 'assigned_task', data.id)
  };
}

/**
 * Creates a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Created user data
 */
async function postUser(req, res) {
  // Validate required fields
  const { name, email, password_hash } = req.body;
  if (!email || !password_hash) {
    return res.status(400).send('Email and password are required');
  }
  
  const created = await todos.createUser(name, email, password_hash);
  return res.send(createdUser(req, created));
}

/**
 * Retrieves user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} User data
 */
async function getUser(req, res) {
  const user = await todos.get(req.params.id);
  return res.send(user);
}

/**
 * Creates a new project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Created project data
 */
async function postProject(req, res) {
  const created = await todos.createProject(req.body.name, req.body.description, req.body.owner_id);
  return res.send(createdProject(req, created));
}

/**
 * Creates a new task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Created task data
 */
async function postTask(req, res) {
  const created = await todos.createTask(req.body.title, req.body.description, req.body.status, req.body.project_id);
  return res.send(createdTask(req, created));
}

/**
 * Assigns a task to a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Task assignment data
 */
async function assignTask(req, res) {
  console.log(req.params.task_id + req.body.user_id)
  const created = await todos.assignTask(req.params.task_id, req.body.user_id);
  return res.send(assignedTask(req, created));
}

/**
 * Higher-order function that adds error handling to route handlers
 * @param {Function} func - Route handler function
 * @param {String} message - Error message to display
 * @returns {Function} Wrapped function with error handling
 */
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

function constructUrl(req, path, id) {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/${path}/${id}`;
}

// Route configuration object with handlers and error messages
const toExport = {
  postUser: { method: postUser, errorMessage: "Could not create user" },
  postProject: { method: postProject, errorMessage: "Could not create project" },
  getUser: { method: getUser, errorMessage: "Could not fetch user" },
  postTask: { method: postTask, errorMessage: "Could not create task" },
  assignTask: { method: assignTask, errorMessage: "Could not assign task" },
}

// Wrap all route handlers with error reporting
for (let route in toExport) {
    toExport[route] = addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = toExport;
