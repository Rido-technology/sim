import type { ToolResponse } from '@/tools/types'

export interface RabbitMQConnectionConfig {
  host: string
  port: number
  username: string
  password: string
  virtualHost?: string
  connectionName?: string
}

export type RabbitMQExchangeType = 'direct' | 'fanout' | 'topic' | 'headers'

export interface RabbitMQSendToExchangeParams extends RabbitMQConnectionConfig {
  exchange: string
  exchangeType?: RabbitMQExchangeType
  routingKey?: string
  message: string
}

export interface RabbitMQSendToQueueParams extends RabbitMQConnectionConfig {
  queue: string
  message: string
}

export interface RabbitMQBaseResponse extends ToolResponse {
  output: {
    success: boolean
    destination: string
    destinationType: 'exchange' | 'queue'
    routingKey?: string
  }
  error?: string
}

export type RabbitMQSendToExchangeResponse = RabbitMQBaseResponse
export type RabbitMQSendToQueueResponse = RabbitMQBaseResponse
export type RabbitMQResponse = RabbitMQBaseResponse

