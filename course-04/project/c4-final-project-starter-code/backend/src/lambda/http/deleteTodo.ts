import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId} from '../../helpers/userHelper'
import { accessTodos } from '../../dataLayer/todosDAO'
import { responseHelper } from '../../helpers/responseHelper'
import { createLogger } from '../../utils/logger'

const todosDAO = new accessTodos()
const respHelper = new responseHelper()
const logger = createLogger('todos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  if(!todoId){
      logger.error('Invalid request' )
      return respHelper.erorResponse(400,'invalid parameters')
  }
 
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

  logger.info(`Deleting User: ${userId} Todo: ${todoId}`)
  await todosDAO.deleteTodo(todoId)
  return respHelper.emptyResponse(204)

}
