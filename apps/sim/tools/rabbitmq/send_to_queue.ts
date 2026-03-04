import { createLogger } from '@sim/logger'
import type {
  RabbitMQSendToQueueParams,
  RabbitMQSendToQueueResponse,
} from '@/tools/rabbitmq/types'
import type { ToolConfig, ToolResponse } from '@/tools/types'
import type amqp from 'amqplib'

const logger = createLogger('RabbitMQSendToQueueTool')

export const rabbitmqSendToQueueTool: ToolConfig<
  RabbitMQSendToQueueParams,
  RabbitMQSendToQueueResponse
> = {
  id: 'rabbitmq_send_to_queue',
  name: 'RabbitMQ Send To Queue',
  description: 'Send a message directly to a RabbitMQ queue.',
  version: '1.0.0',

  params: {
    host: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'RabbitMQ host name or IP address.',
    },
    port: {
      type: 'number',
      required: true,
      visibility: 'user-only',
      description: 'RabbitMQ port (default: 5672).',
    },
    username: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'RabbitMQ username.',
    },
    password: {
      type: 'string',
      required: true,
      visibility: 'user-only',
      description: 'RabbitMQ password.',
    },
    virtualHost: {
      type: 'string',
      required: false,
      visibility: 'user-only',
      description: 'RabbitMQ virtual host (default: "/").',
    },
    connectionName: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Optional logical connection name for RabbitMQ management UI.',
    },
    queue: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Queue name to send the message to.',
    },
    message: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description:
        'Message payload to send. This can be plain text or a JSON string, depending on your consumers.',
    },
  },

  request: {
    url: '/api/tools/rabbitmq/send_to_queue',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: () => ({}),
  },

  directExecution: async (
    params: RabbitMQSendToQueueParams
  ): Promise<RabbitMQSendToQueueResponse> => {
    if (typeof window !== 'undefined') {
      return {
        success: false,
        output: {
          success: false,
          destination: params.queue,
          destinationType: 'queue',
        },
        error: 'RabbitMQ tools can only be executed on the server.',
      }
    }

    const { host, port, username, password, virtualHost, connectionName, queue } = params
    const message = params.message ?? ''

    try {
      const amqp = await import('amqplib')

      const connectionOptions: amqp.Options.Connect & { clientProperties?: any } = {
        protocol: 'amqp',
        hostname: host,
        port,
        username,
        password,
        vhost: virtualHost || '/',
      }

      if (connectionName) {
        connectionOptions.clientProperties = {
          connection_name: connectionName,
        }
      }

      logger.info('Connecting to RabbitMQ queue', {
        host,
        port,
        virtualHost: connectionOptions.vhost,
        queue,
      })

      const connection = await amqp.connect(connectionOptions)

      try {
        const channel = await connection.createChannel()

        try {
          await channel.assertQueue(queue, { durable: true })

          const sent = channel.sendToQueue(queue, Buffer.from(message, 'utf8'), {
            persistent: true,
          })

          logger.info('Sent message to RabbitMQ queue', {
            queue,
            sent,
          })

          const base: ToolResponse = {
            success: true,
            output: {
              success: sent,
              destination: queue,
              destinationType: 'queue',
            },
          }

          return base as RabbitMQSendToQueueResponse
        } finally {
          await channel.close()
        }
      } finally {
        await connection.close()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown RabbitMQ error'
      logger.error('Failed to send message to RabbitMQ queue', { error: errorMessage })

      return {
        success: false,
        output: {
          success: false,
          destination: queue,
          destinationType: 'queue',
        },
        error: errorMessage,
      }
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the message was successfully sent to the queue.',
    },
    destination: {
      type: 'string',
      description: 'The queue the message was sent to.',
    },
    destinationType: {
      type: 'string',
      description: 'The destination type (always "queue" for this tool).',
    },
    error: {
      type: 'string',
      description: 'Error message if the send operation failed.',
      optional: true,
    },
  },
}

