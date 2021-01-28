import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId} from '../../helpers/userHelper'
import { accessTodos } from '../../dataLayer/todosDAO'
import { responseHelper } from '../../helpers/responseHelper'
import { createLogger } from '../../utils/logger'
import { S3Helper } from '../../helpers/s3Helper'

const s3Helper = new S3Helper()
const respHelper= new responseHelper()
const logger = createLogger('todos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const header = event.headers['Authorization']
    const userId = getUserId(header) 
    logger.info(`Groups for user ${userId}`)
    const result = await new accessTodos().getTodos(userId)
      
    for(const record of result){
        record.attachmentUrl = await s3Helper.getAttachmentUrl(record.todoId)
    }

    return respHelper.successResponse(200,'items',result)

}
