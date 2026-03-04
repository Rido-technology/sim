import { RabbitMQIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import type { RabbitMQResponse } from '@/tools/rabbitmq/types'

export const RabbitMQBlock: BlockConfig<RabbitMQResponse> = {
  type: 'rabbitmq',
  name: 'RabbitMQ',
  description: 'Send messages to RabbitMQ exchanges and queues',
  longDescription:
    'Connect to a RabbitMQ broker using username/password credentials and send messages either to an exchange (with optional routing key) or directly to a queue.',
  docsLink: 'https://www.rabbitmq.com/docs',
  category: 'tools',
  bgColor: '#FF6600',
  icon: RabbitMQIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        { label: 'Send Message To Exchange', id: 'send_to_exchange' },
        { label: 'Send Message To Queue', id: 'send_to_queue' },
      ],
      value: () => 'send_to_exchange',
    },
    {
      id: 'connectionName',
      title: 'Connection Name',
      type: 'short-input',
      placeholder: 'RabbitMQ',
      value: () => 'RabbitMQ',
      description:
        'Optional logical name for this connection. Shown in RabbitMQ management UI as the connection name.',
    },
    {
      id: 'host',
      title: 'Host',
      type: 'short-input',
      placeholder: 'localhost or your.rabbitmq.host',
      required: true,
    },
    {
      id: 'port',
      title: 'Port',
      type: 'short-input',
      placeholder: '5672',
      value: () => '5672',
      required: true,
    },
    {
      id: 'username',
      title: 'Username',
      type: 'short-input',
      placeholder: 'guest',
      required: true,
    },
    {
      id: 'password',
      title: 'Password',
      type: 'short-input',
      password: true,
      placeholder: 'Your RabbitMQ password',
      required: true,
    },
    {
      id: 'virtualHost',
      title: 'Virtual Host',
      type: 'short-input',
      placeholder: '/ (default vhost)',
      value: () => '/',
      description: 'RabbitMQ virtual host name. Use "/" for the default vhost.',
    },
    {
      id: 'exchange',
      title: 'Exchange Name',
      type: 'short-input',
      placeholder: 'my_exchange',
      required: true,
      condition: { field: 'operation', value: 'send_to_exchange' },
    },
    {
      id: 'exchangeType',
      title: 'Exchange Type',
      type: 'dropdown',
      options: [
        { label: 'direct', id: 'direct' },
        { label: 'fanout', id: 'fanout' },
        { label: 'topic', id: 'topic' },
        { label: 'headers', id: 'headers' },
      ],
      value: () => 'direct',
      condition: { field: 'operation', value: 'send_to_exchange' },
      description:
        'Type of exchange. For most routing-key based patterns, use "direct" or "topic".',
    },
    {
      id: 'routingKey',
      title: 'Routing Key',
      type: 'short-input',
      placeholder: 'my.routing.key (optional for fanout)',
      condition: { field: 'operation', value: 'send_to_exchange' },
    },
    {
      id: 'queue',
      title: 'Queue Name',
      type: 'short-input',
      placeholder: 'my_queue',
      required: true,
      condition: { field: 'operation', value: 'send_to_queue' },
    },
    {
      id: 'message',
      title: 'Message',
      type: 'long-input',
      placeholder: 'Enter the message payload to send (plain text or JSON).',
      required: true,
      description:
        'This payload will be sent as the message body. If you want to send JSON, provide a valid JSON string.',
      condition: {
        field: 'operation',
        value: ['send_to_exchange', 'send_to_queue'],
      },
    },
  ],
  tools: {
    access: ['rabbitmq_send_to_exchange', 'rabbitmq_send_to_queue'],
    config: {
      tool: (params) => {
        switch (params.operation) {
          case 'send_to_exchange':
            return 'rabbitmq_send_to_exchange'
          case 'send_to_queue':
            return 'rabbitmq_send_to_queue'
          default:
            throw new Error(`Invalid RabbitMQ operation: ${params.operation}`)
        }
      },
      params: (params) => {
        const base = {
          host: params.host,
          port: params.port ? Number(params.port) : 5672,
          username: params.username,
          password: params.password,
          virtualHost: params.virtualHost,
          connectionName: params.connectionName,
        }

        switch (params.operation) {
          case 'send_to_exchange':
            return {
              ...base,
              exchange: params.exchange,
              exchangeType: params.exchangeType,
              routingKey: params.routingKey,
              message: params.message,
            }
          case 'send_to_queue':
            return {
              ...base,
              queue: params.queue,
              message: params.message,
            }
          default:
            return base
        }
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'RabbitMQ operation to perform.' },
    connectionName: {
      type: 'string',
      description:
        'Optional logical name for this connection. Shown in RabbitMQ management UI as the connection name.',
    },
    host: { type: 'string', description: 'RabbitMQ host name or IP address.' },
    port: { type: 'string', description: 'RabbitMQ port (default: 5672).' },
    username: { type: 'string', description: 'RabbitMQ username.' },
    password: { type: 'string', description: 'RabbitMQ password.' },
    virtualHost: {
      type: 'string',
      description: 'RabbitMQ virtual host name. Use "/" for the default vhost.',
    },
    exchange: { type: 'string', description: 'Exchange name to publish the message to.' },
    exchangeType: {
      type: 'string',
      description: 'Exchange type (direct, fanout, topic, headers).',
    },
    routingKey: {
      type: 'string',
      description: 'Routing key to use when publishing the message to the exchange.',
    },
    queue: { type: 'string', description: 'Queue name to send the message to.' },
    message: {
      type: 'string',
      description:
        'Message payload to send. This can be plain text or a JSON string, depending on your consumers.',
    },
  },
  outputs: {
    success: {
      type: 'boolean',
      description: 'Whether the RabbitMQ operation completed successfully.',
    },
    destination: {
      type: 'string',
      description: 'The exchange or queue the message was sent to.',
    },
    destinationType: {
      type: 'string',
      description: 'The type of destination (exchange or queue).',
    },
    routingKey: {
      type: 'string',
      description: 'Routing key used for the publish operation (if applicable).',
    },
    error: {
      type: 'string',
      description: 'Error message if the RabbitMQ operation failed.',
    },
  },
}

