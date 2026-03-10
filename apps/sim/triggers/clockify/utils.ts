/**
 * Clockify webhook event matching utilities
 */

/**
 * Check if a Clockify webhook event matches a specific trigger configuration
 * This is used for event filtering in the webhook processor
 */
export function isClockifyEventMatch(
  triggerId: string,
  eventType: string,
  payload?: any
): boolean {
  // For clockify_webhook trigger, check if eventType is in the configured eventTypes
  if (triggerId === 'clockify_webhook') {
    // The eventType comes from the webhook payload and should match one of the configured types
    // This will be validated against the trigger configuration in the webhook processor
    return true
  }

  // Handle specific event triggers if they exist in the future
  const eventMap: Record<string, { event: string; validator?: (payload: any) => boolean }> = {
    // Future specific triggers can be defined here
    // clockify_time_entry_created: { event: 'TIME_ENTRY_CREATED' },
    // clockify_project_updated: { event: 'PROJECT_UPDATED' },
  }

  const config = eventMap[triggerId]
  if (!config) {
    return true // Unknown trigger, allow through
  }

  // Check event type
  if (config.event !== eventType) {
    return false
  }

  // Run custom validator if provided
  if (config.validator && payload) {
    return config.validator(payload)
  }

  return true
}

/**
 * Extract event type from Clockify webhook
 * Clockify sends event type in the 'clockify-webhook-event-type' header
 */
export function getClockifyEventType(payload: any, headers?: Record<string, string>): string | null {
  // First check the header - this is where Clockify actually sends the event type
  if (headers) {
    const headerEventType = headers['clockify-webhook-event-type']
    if (headerEventType) {
      // Map Clockify event names to our event types
      const eventMap: Record<string, string> = {
        // Time Entry Events
        'NEW_TIME_ENTRY': 'TIME_ENTRY_CREATED',
        'TIME_ENTRY_UPDATED': 'TIME_ENTRY_UPDATED',
        'TIME_ENTRY_DELETED': 'TIME_ENTRY_DELETED',
        
        // Project Events
        'NEW_PROJECT': 'PROJECT_CREATED',
        'PROJECT_UPDATED': 'PROJECT_UPDATED',
        'PROJECT_DELETED': 'PROJECT_DELETED',
        
        // Task Events
        'NEW_TASK': 'TASK_CREATED',
        'TASK_UPDATED': 'TASK_UPDATED',
        'TASK_DELETED': 'TASK_DELETED',
        
        // User Events
        'USER_JOINED_WORKSPACE': 'USER_JOINED_WORKSPACE',
        'USER_LEFT_WORKSPACE': 'USER_LEFT_WORKSPACE',
      }
      
      return eventMap[headerEventType] || headerEventType
    }
  }
  
  // Fallback: Check payload for event type (older webhook format?)
  if (payload.eventType) {
    return payload.eventType
  }
  
  if (payload.type) {
    return payload.type
  }
  
  if (payload.event_type) {
    return payload.event_type
  }
  
  // Last resort: Try to infer from payload structure
  if (payload.timeEntry) {
    if (payload.action === 'created') return 'TIME_ENTRY_CREATED'
    if (payload.action === 'updated') return 'TIME_ENTRY_UPDATED'
    if (payload.action === 'deleted') return 'TIME_ENTRY_DELETED'
  }
  
  if (payload.project) {
    if (payload.action === 'created') return 'PROJECT_CREATED'
    if (payload.action === 'updated') return 'PROJECT_UPDATED'
    if (payload.action === 'deleted') return 'PROJECT_DELETED'
  }
  
  if (payload.task) {
    if (payload.action === 'created') return 'TASK_CREATED'
    if (payload.action === 'updated') return 'TASK_UPDATED'
    if (payload.action === 'deleted') return 'TASK_DELETED'
  }
  
  if (payload.user) {
    if (payload.action === 'joined') return 'USER_JOINED_WORKSPACE'
    if (payload.action === 'left') return 'USER_LEFT_WORKSPACE'
  }
  
  return null
}

/**
 * Validate if the event should trigger based on filters
 */
export function shouldTriggerClockifyEvent(
  eventType: string,
  configuredEventTypes: string[],
  payload: any,
  filterByProject?: string,
  filterByUser?: string
): boolean {
  // Check if event type is in configured types
  if (!configuredEventTypes.includes(eventType)) {
    return false
  }
  
  // Apply project filter if configured
  if (filterByProject) {
    const projectId = payload.project?.id || payload.timeEntry?.projectId || payload.task?.projectId
    if (projectId !== filterByProject) {
      return false
    }
  }
  
  // Apply user filter if configured
  if (filterByUser) {
    const userId = payload.user?.id || payload.timeEntry?.userId || payload.createdBy?.id
    if (userId !== filterByUser) {
      return false
    }
  }
  
  return true
}