const knex = require("./connection.js");
const bcrypt = require('bcrypt');

// Add custom error classes
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

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
    if (!email || !password) {
        throw new ValidationError('Email and password are required');
    }
    try {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        const results = await knex('users')
            .insert({ name, email, password_hash })
            .returning('*');
        return results[0];
    } catch (err) {
        if (err.code === '23505') { // PostgreSQL unique violation
            throw new ValidationError('Email already exists');
        }
        throw err;
    }
}

async function getUser(id) {
    const results = await knex('users').where({ id });
    if (!results.length) {
        throw new NotFoundError(`User with id ${id} not found`);
    }
    return results[0];
}

async function createProject(name, description, owner_id) {
    // Verify owner exists
    const owner = await knex('users').where({ id: owner_id }).first();
    if (!owner) {
        throw new ValidationError(`Owner with id ${owner_id} does not exist`);
    }
    
    const results = await knex('projects')
        .insert({ name, description, owner_id })
        .returning('*');
    return results[0];
}

async function createTask(title, description, status, project_id) {
    // Verify project exists
    const project = await knex('projects').where({ id: project_id }).first();
    if (!project) {
        throw new ValidationError(`Project with id ${project_id} does not exist`);
    }
    
    const results = await knex('tasks')
        .insert({ title, description, status, project_id })
        .returning('*');
    return results[0];
}

async function assignTask(task_id, user_id) {
    // Verify both task and user exist
    const [task, user] = await Promise.all([
        knex('tasks').where({ id: task_id }).first(),
        knex('users').where({ id: user_id }).first()
    ]);
    
    if (!task) throw new ValidationError(`Task with id ${task_id} does not exist`);
    if (!user) throw new ValidationError(`User with id ${user_id} does not exist`);
    
    const results = await knex('task_assignments')
        .insert({ task_id, user_id })
        .returning('*');
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