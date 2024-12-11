/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name');
        table.string('email').notNullable().unique();
        table.string('password_hash').notNullable();      
      })
      .createTable('projects', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.text('description');
        table.integer('owner_id').unsigned().references('users.id');
      })
      .createTable('tasks', (table) => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description');
        table.enum('status', ['To Do', 'In Progress', 'Completed']);
        table.integer('project_id').unsigned().references('projects.id');
      })
      .createTable('comments', (table) => {
        table.increments('id').primary();
        table.text('comment_text');
        table.integer('task_id').unsigned().references('tasks.id');
      })
      // Create the task_assignments table to manage task-user relationships
     .createTable('task_assignments', (table) => {
        table.increments('id').primary();
        table.integer('task_id').unsigned().references('tasks.id').onDelete('CASCADE');
        table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE');
        table.timestamp('assigned_at', { useTz: true });
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists('task_assignments')
    .dropTableIfExists('tasks')
    .dropTableIfExists('users')
    .dropTableIfExists('projects')
    .dropTableIfExists('comments');

};
