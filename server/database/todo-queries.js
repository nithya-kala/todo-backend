const knex = require("./connection.js");
const bcrypt = require('bcrypt');

async function all() {
    return knex('users');
}

async function get(id) {
    const results = await knex('users').where({ id });
    return results[0];
}

async function create(title, order) {
    const results = await knex('todos').insert({ title, order }).returning('*');
    return results[0];
}

async function update(id, properties) {
    const results = await knex('todos').where({ id }).update({ ...properties }).returning('*');
    return results[0];
}

// delete is a reserved keyword
async function del(id) {
    const results = await knex('todos').where({ id }).del().returning('*');
    return results[0];
}

async function clear() {
    return knex('todos').del().returning('*');
}

async function createUser(name, email, password) {
    // Generate a salt and hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const results = await knex('users').insert({ name, email, password_hash }).returning('*');
    return results[0];
}

async function getUser(id) {
    const results = await knex('users').where({ id });
    return results[0];
}

async function createProject(name, description, owner_id) {
    const results = await knex('projects').insert({ name, description, owner_id }).returning('*');
     return results[0];
}

async function createTask(title, description, status, project_id) {
    const results = await knex('tasks').insert({ title, description, status, project_id }).returning('*');
     return results[0];
}

async function assignTask(task_id, user_id) {
    const results = await knex('task_assignments').insert({ task_id, user_id }).returning('*');
    return results[0];
}



module.exports = {
    all,
    get,
    create,
    update,
    delete: del,
    clear,
    createUser,
    getUser,
    createProject,
    createTask,
    assignTask
}