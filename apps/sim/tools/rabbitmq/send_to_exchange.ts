import { createLogger } from '@sim/logger'
import type {
  RabbitMQSendToExchangeParams,
  RabbitMQSendToExchangeResponse,
} from '@/tools/rabbitmq/types'
import type { ToolConfig, ToolResponse } from '@/tools/types'
import type amqp from 'amqplib'

const logger = createLogger('RabbitMQSendToExchangeTool')

export const rabbitmqSendToExchangeTool: ToolConfig<
  RabbitMQSendToExchangeParams,
  RabbitMQSendToExchangeResponse
> = {
  id: 'rabbitmq_send_to_exchange',
  name: 'RabbitMQ Send To Exchange',
  description: 'Send a message to a RabbitMQ exchange.',
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
    exchange: {
      type: 'string',
      required: true,
      visibility: 'user-or-llm',
      description: 'Exchange name to publish the message to.',
    },
    exchangeType: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description: 'Exchange type (direct, fanout, topic, headers). Defaults to direct.',
    },
    routingKey: {
      type: 'string',
      required: false,
      visibility: 'user-or-llm',
      description:
        'Routing key for the message. For direct/topic exchanges, this is usually required.',
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
    url: '/api/tools/rabbitmq/send_to_exchange',
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: () => ({}),
  },

  directExecution: async (
    params: RabbitMQSendToExchangeParams
  ): Promise<RabbitMQSendToExchangeResponse> => {
    if (typeof window !== 'undefined') {
      return {
        success: false,
        output: {
          success: false,
          destination: params.exchange,
          destinationType: 'exchange',
          routingKey: params.routingKey,
        },
        error: 'RabbitMQ tools can only be executed on the server.',
      }
    }

    const { host, port, username, password, virtualHost, connectionName, exchange } = params
    const exchangeType = (params.exchangeType || 'direct').toLowerCase() as
      | 'direct'
      | 'fanout'
      | 'topic'
      | 'headers'
    const routingKey = params.routingKey ?? ''
    const message = params.message ?? ''

    try {
      const amqp = await import('amqplib')

      const connectionOptions: amqp.Options.Connect & { clientProperties?: any }  = {
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

      logger.info('Connecting to RabbitMQ exchange', {
        host,
        port,
        virtualHost: connectionOptions.vhost,
        exchange,
        exchangeType,
      })

      const connection = await amqp.connect(connectionOptions)

      try {
        const channel = await connection.createChannel()

        try {
          await channel.assertExchange(exchange, exchangeType, { durable: true })

          const published = channel.publish(
            exchange,
            routingKey,
            Buffer.from(message, 'utf8'),
            { persistent: true }
          )

          logger.info('Published message to RabbitMQ exchange', {
            exchange,
            exchangeType,
            routingKey,
            published,
          })

          const base: ToolResponse = {
            success: true,
            output: {
              success: published,
              destination: exchange,
              destinationType: 'exchange',
              routingKey,
            },
          }

          return base as RabbitMQSendToExchangeResponse
        } finally {
          await channel.close()
        }
      } finally {
        await connection.close()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown RabbitMQ error'
      logger.error('Failed to send message to RabbitMQ exchange', { error: errorMessage })

      return {
        success: false,
        output: {
          success: false,
          destination: exchange,
          destinationType: 'exchange',
          routingKey,
        },
        error: errorMessage,
      }
    }
  },

  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the message was successfully published to the exchange.',
    },
    destination: {
      type: 'string',
      description: 'The exchange the message was sent to.',
    },
    destinationType: {
      type: 'string',
      description: 'The destination type (always "exchange" for this tool).',
    },
    routingKey: {
      type: 'string',
      description: 'The routing key used when publishing the message.',
      optional: true,
    },
    error: {
      type: 'string',
      description: 'Error message if the publish operation failed.',
      optional: true,
    },
  },
}

