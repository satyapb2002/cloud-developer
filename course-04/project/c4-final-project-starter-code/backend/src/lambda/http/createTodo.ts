import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId} from '../../helpers/userHelper'
import { accessTodos } from '../../dataLayer/todosDAO'
import { responseHelper } from '../../helpers/responseHelper'
import { createLogger } from '../../utils/logger'
import { S3Helper } from '../../helpers/s3Helper'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const auth = event.headers['Authorization']
  const userID = getUserId(auth)
  const item = await new accessTodos().createTodo(newTodo, userId)

    
  logger.info(`user: ${userId}  data: ${newTodo}`)
  return new responseHelper().successResponse(201,'item',item)
}
