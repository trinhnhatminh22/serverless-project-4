import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';

const logger = createLogger('TodosAccess');

// TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        console.log('Get all Todos with userId: ', userId);

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: '#userId =:i',
            ExpressionAttributeNames: {
                '#userId': 'userId'
            },
            ExpressionAttributeValues: {
                ':i': userId
            }
        }).promise();

        const items = result.Items;
        return items as TodoItem[];
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        console.log('Creating new item todo');
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        console.log('Done create item todo');
        return todo;
    }

    async updateTodo(todo: TodoUpdate, userId: string, todoId: string): Promise<TodoUpdate> {
        console.log(`Updating todoId: ${todoId} for userId: ${userId}`);
        const params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            ExpressionAttributeNames: {
                '#todo_name': 'name',
            },
            ExpressionAttributeValues: {
                ':name': todo.name,
                ':dueDate': todo.dueDate,
                ':done': todo.done,
            },
            UpdateExpression: 'SET #todo_name = :name, dueDate = :dueDate, done = :done',
            ReturnValues: 'ALL_NEW',
        };

        const result = await this.docClient.update(params).promise();

        logger.info('After update: ', { result: result });

        return result.Attributes as TodoUpdate;
    }

    async updateAttachmentUrl(userId: string, todoId: string, attachmentUrl: string) {
        console.log(`updateAttachmentUrl for todoId ${todoId} of userId ${userId} with URL ${attachmentUrl}`)
        const params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            ExpressionAttributeNames: {
                '#todo_attachmentUrl': 'attachmentUrl'
            },
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            },
            UpdateExpression: 'SET #todo_attachmentUrl = :attachmentUrl',
            ReturnValues: 'ALL_NEW',
        };

        const result = await this.docClient.update(params).promise();
        logger.info('After update statement', { result: result });
    }

    async deleteTodo(todoId: string, userId: string) {
        console.log(`Deleting todoId ${todoId} of userId ${userId}`)
    
        await this.docClient.delete({
          TableName: this.todosTable,
          Key: {
            userId: userId,
            todoId: todoId
          }
        }).promise();
    
        logger.info('Deleted successfully');
      }
}

function createDynamoDBClient(): DocumentClient {
    const service = new AWS.DynamoDB();
    const client = new AWS.DynamoDB.DocumentClient({
        service: service
    });
    AWSXRay.captureAWSClient(service);
    return client;
}