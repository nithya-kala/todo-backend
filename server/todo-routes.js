const _ = require('lodash');
const todos = require('./database/todo-queries.js');

/**
 * Formats user data for API response
 * @param {Object} req - Express request object
 * @param {Object} data - User data from database
 * @returns {Object} Formatted user object with URL
 */
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

/**
 * Formats project data for API response
 * @param {Object} req - Express request object
 * @param {Object} data - Project data from database
 * @returns {Object} Formatted project object with URL
 */
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

/**
 * Formats task data for API response
 * @param {Object} req - Express request object
 * @param {Object} data - Task data from database
 * @returns {Object} Formatted task object with URL
 */
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

/**
 * Formats task assignment data for API response
 * @param {Object} req - Express request object
 * @param {Object} data - Task assignment data from database
 * @returns {Object} Formatted task assignment object with URL
 */
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

/**
 * Creates a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Created user data
 */
async function postUser(req, res) {
  const created = await todos.createUser(req.body.name, req.body.email, req.body.password_hash);
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

// Route configuration object with handlers and error messages
const toExport = {
    postUser: { method: postUser, errorMessage: "Could not fetch all todos" },
    postProject: { method: postProject, errorMessage: "Could not fetch all todos" },
    getUser: { method: getUser, errorMessage: "Could not fetch all todos" },
    postTask: { method: postTask, errorMessage: "Could not fetch all todos" },
    assignTask: { method: assignTask, errorMessage: "Could not fetch all todos" },
}

// Wrap all route handlers with error reporting
for (let route in toExport) {
    toExport[route] = addErrorReporting(toExport[route].method, toExport[route].errorMessage);
}

module.exports = toExport;
