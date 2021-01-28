import { TodoItem } from "../models/todoItem";
const uuid = require('uuid/v4')
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { UpdateTodoRequest } from "../requests/updateTodoRequest";
import { CreateTodoRequest } from "../requests/createTodoRequest";



export class accessTodos{
    constructor(
        private readonly xaws = AWSXRay.captureAWS(AWS),
        private readonly dbClient: AWS.DynamoDB.DocumentClient = new xaws.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODO_TABLE,
        private readonly userIdIndex = process.env.USERID_INDEX
    )
        {}

    async getTodos(userId: string): Promise<TodoItem[]>{
        const result = await this.dbClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues:{
                ':userId':userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }

    async createTodo(request: CreateTodoRequest,userId: string): Promise<TodoItem>{
        const newId = uuid()
        const item = new TodoItem()
        item.userId= userId
        item.todoId= newId
        item.createdAt= new Date().toISOString()
        item.name= request.name
        item.dueDate= request.dueDate
        item.done= false
  
        await this.dbClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()

        return item
    }


    async getTodo(id: string): Promise<AWS.DynamoDB.QueryOutput>{
        return await this.dbClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues:{
                ':todoId': id
            }
        }).promise()
    }

    async updateTodo(updatedTodo:UpdateTodoRequest,todoId:string){
        await this.dbClient.update({
            TableName: this.todosTable,
            Key:{
                'todoId':todoId
            },
            UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
            ExpressionAttributeValues: {
                ':n' : updatedTodo.name,
                ':d' : updatedTodo.dueDate,
                ':done' : updatedTodo.done
            },
            ExpressionAttributeNames:{
                "#namefield": "name"
              }
          }).promise()
    }

    async deleteTodo(todoId: string){
        const param = {
            TableName: this.todosTable,
            Key:{
                "todoId":todoId
            }
        }
         await this.dbClient.delete(param).promise()
    }
    
}
