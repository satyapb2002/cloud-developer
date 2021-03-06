import 'source-map-support/register'
import { getUserId} from '../../helpers/userHelper'
import { accessTodos } from '../../dataLayer/todosDAO'
import { responseHelper } from '../../helpers/responseHelper'
import { createLogger } from '../../utils/logger'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const respHelper= new responseHelper()
const logger = createLogger('todos')
const todosDAO = new accessTodos()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const header = event.headers['Authorization']
  const userId = getUserId(header)
  
  const item = await todosDAO.getTodo(todoId)
  if(item.Count == 0){
      logger.error(`Todo id does not exist for user. User: ${userId} Todoid : ${todoId}`)
      return respHelper.errorResponse(400,'TODO does not exist.')
  }

  if(item.Items[0].userId !== userId){
      logger.error(`Not authorized to delete. User: ${userId} Todo: ${todoId}`)
      return respHelper.errorResponse(400,'User not authorized to delete.')
  }

   logger.info(`Updating User: ${userId} OldGroup: ${todoId} NewGroup: ${updatedTodo}`)
   await new accessTodos().updateTodo(updatedTodo,todoId)
   return respHelper.emptySuccessResponse(204)
}
