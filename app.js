// TODO Application
class TodoApp {
    constructor() {
        this.todos = this.loadFromStorage();
        this.currentFilter = 'all';
        this.editingId = null;

        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.taskCount = document.getElementById('taskCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');

        this.init();
    }

    init() {
        // Event listeners
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        this.render();
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.todoInput.value = '';
        this.saveToStorage();
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
    }

    toggleComplete(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    startEdit(id) {
        this.editingId = id;
        this.render();
    }

    saveEdit(id, newText) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo && newText.trim()) {
            todo.text = newText.trim();
            this.editingId = null;
            this.saveToStorage();
            this.render();
        }
    }

    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    clearCompleted() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveToStorage();
        this.render();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTodos() {
        switch(this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            this.todoList.innerHTML = '<div class="empty-state">No tasks to display</div>';
        } else {
            this.todoList.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
        }

        // Update task count (active tasks only)
        const activeCount = this.todos.filter(todo => !todo.completed).length;
        this.taskCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;

        // Add event listeners to todo items
        this.attachTodoListeners();
    }

    createTodoHTML(todo) {
        const isEditing = this.editingId === todo.id;

        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text ${isEditing ? 'editing' : ''}">${this.escapeHtml(todo.text)}</span>
                <input type="text" class="edit-input ${isEditing ? 'active' : ''}" value="${this.escapeHtml(todo.text)}">
                <div class="todo-actions">
                    ${isEditing ? `
                        <button class="save-btn">Save</button>
                        <button class="cancel-btn">Cancel</button>
                    ` : `
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    `}
                </div>
            </li>
        `;
    }

    attachTodoListeners() {
        this.todoList.querySelectorAll('.todo-item').forEach(item => {
            const id = parseInt(item.dataset.id);

            const checkbox = item.querySelector('.todo-checkbox');
            const editBtn = item.querySelector('.edit-btn');
            const deleteBtn = item.querySelector('.delete-btn');
            const saveBtn = item.querySelector('.save-btn');
            const cancelBtn = item.querySelector('.cancel-btn');
            const editInput = item.querySelector('.edit-input');

            checkbox.addEventListener('change', () => this.toggleComplete(id));

            if (editBtn) {
                editBtn.addEventListener('click', () => this.startEdit(id));
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteTodo(id));
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', () => this.saveEdit(id, editInput.value));
            }

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.cancelEdit());
            }

            if (editInput) {
                editInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.saveEdit(id, editInput.value);
                });
                editInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') this.cancelEdit();
                });
                // Auto-focus when editing
                if (this.editingId === id) {
                    editInput.focus();
                    editInput.select();
                }
            }
        });
    }

    saveToStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
