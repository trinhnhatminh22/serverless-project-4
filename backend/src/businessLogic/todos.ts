import { TodosAccess } from '../dataLayer/todosAcess';
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import * as uuid from 'uuid';
import { TodoUpdate } from '../models/TodoUpdate';

// TODO: Implement businessLogic\
const todosAccess = new TodosAccess();
const accessFile = new AttachmentUtils();

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {

    const todoId = uuid.v4();
    const timestamp = new Date().toISOString();

    return await todosAccess.createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: timestamp,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    });
}

export async function deleteTodo(todoId: string, userId: string) {
    await todosAccess.deleteTodo(todoId, userId);
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<String> {
    const uploadUrl = await accessFile.getUploadUrl(todoId);
    const attachmentUrl = accessFile.getAttachmentUrl(todoId);
    await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl);
    return uploadUrl;
}

export async function getAllTodo(userId: string): Promise<TodoItem[]> {
    return todosAccess.getAllTodos(userId);
}

export async function updateTodo(todoId: string, updateTodoRequest: UpdateTodoRequest, userId: string): Promise<TodoUpdate> {

    return await todosAccess.updateTodo({
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    },
        todoId,
        userId);
}