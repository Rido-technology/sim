import { deleteTool } from './delete'
import { executeTool } from './execute'
import { insertTool } from './insert'
import { introspectTool } from './introspect'
import { queryTool } from './query'
import { updateTool } from './update'

export const surrealdbDeleteTool = deleteTool
export const surrealdbExecuteTool = executeTool
export const surrealdbInsertTool = insertTool
export const surrealdbIntrospectTool = introspectTool
export const surrealdbQueryTool = queryTool
export const surrealdbUpdateTool = updateTool

export * from './types'
