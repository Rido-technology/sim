import { WebexIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'
import { AuthMode } from '@/blocks/types'

export const WebexBlock: BlockConfig = {
  type: 'webex',
  name: 'Webex',
  description: 'Send messages, manage rooms and schedule Webex meetings',
  authMode: AuthMode.OAuth,
  longDescription:
    'Integrate Webex into workflows. Send and read messages in rooms, manage spaces and memberships, get people info, schedule and manage meetings.',
  docsLink: 'https://docs.sim.ai/tools/webex',
  category: 'tools',
  bgColor: '#f9faf9',
  icon: WebexIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      options: [
        // Messaging
        { label: 'Send Message', id: 'webex_send_message' },
        { label: 'List Messages', id: 'webex_list_messages' },
        { label: 'Get Message', id: 'webex_get_message' },
        { label: 'Delete Message', id: 'webex_delete_message' },
        // Rooms
        { label: 'List Rooms', id: 'webex_list_rooms' },
        { label: 'Create Room', id: 'webex_create_room' },
        { label: 'Get Room', id: 'webex_get_room' },
        { label: 'List Room Members', id: 'webex_list_members' },
        // People
        { label: 'Get Person', id: 'webex_get_person' },
        // Meetings
        { label: 'Create Meeting', id: 'webex_create_meeting' },
        { label: 'List Meetings', id: 'webex_list_meetings' },
        { label: 'Get Meeting', id: 'webex_get_meeting' },
        { label: 'Update Meeting', id: 'webex_update_meeting' },
        { label: 'Delete Meeting', id: 'webex_delete_meeting' },
      ],
      value: () => 'webex_send_message',
    },
    {
      id: 'credential',
      title: 'Webex Account',
      type: 'oauth-input',
      serviceId: 'webex',
      requiredScopes: [
        'spark:messages_write',
        'spark:messages_read',
        'spark:rooms_read',
        'spark:rooms_write',
        'spark:memberships_read',
        'spark:people_read',
        'meeting:schedules_write',
        'meeting:schedules_read',
      ],
      placeholder: 'Connect Webex account',
      required: true,
    },

    // -----------------------------------------------------------------------
    // Messaging fields
    // -----------------------------------------------------------------------
    {
      id: 'roomId',
      title: 'Room ID',
      type: 'short-input',
      placeholder: 'Y2lzY29zcGFyazovL3Vz...',
      condition: {
        field: 'operation',
        value: [
          'webex_send_message',
          'webex_list_messages',
          'webex_get_message',
          'webex_delete_message',
        ],
      },
    },
    {
      id: 'toPersonEmail',
      title: 'To Person Email (DM)',
      type: 'short-input',
      placeholder: 'user@example.com',
      condition: { field: 'operation', value: 'webex_send_message' },
    },
    {
      id: 'text',
      title: 'Message Text',
      type: 'long-input',
      placeholder: 'Hello team!',
      condition: { field: 'operation', value: 'webex_send_message' },
    },
    {
      id: 'markdown',
      title: 'Message (Markdown)',
      type: 'long-input',
      placeholder: '**Hello** team!',
      condition: { field: 'operation', value: 'webex_send_message' },
    },
    {
      id: 'max',
      title: 'Max Messages',
      type: 'short-input',
      placeholder: '50',
      condition: { field: 'operation', value: 'webex_list_messages' },
    },
    {
      id: 'messageId',
      title: 'Message ID',
      type: 'short-input',
      placeholder: 'Y2lzY29zcGFyazovL3Vz...',
      condition: {
        field: 'operation',
        value: ['webex_get_message', 'webex_delete_message'],
      },
    },

    // -----------------------------------------------------------------------
    // Room fields
    // -----------------------------------------------------------------------
    {
      id: 'roomTitle',
      title: 'Room Title',
      type: 'short-input',
      placeholder: 'Project Alpha',
      required: true,
      condition: { field: 'operation', value: 'webex_create_room' },
    },
    {
      id: 'roomType',
      title: 'Room Type Filter',
      type: 'dropdown',
      options: [
        { label: 'All', id: '' },
        { label: 'Direct', id: 'direct' },
        { label: 'Group', id: 'group' },
      ],
      value: () => '',
      condition: { field: 'operation', value: 'webex_list_rooms' },
    },
    {
      id: 'roomIdDetail',
      title: 'Room ID',
      type: 'short-input',
      placeholder: 'Y2lzY29zcGFyazovL3Vz...',
      required: true,
      condition: { field: 'operation', value: ['webex_get_room', 'webex_list_members'] },
    },

    // -----------------------------------------------------------------------
    // People fields
    // -----------------------------------------------------------------------
    {
      id: 'personId',
      title: 'Person ID',
      type: 'short-input',
      placeholder: 'me',
      required: true,
      condition: { field: 'operation', value: 'webex_get_person' },
    },

    // -----------------------------------------------------------------------
    // Meeting fields
    // -----------------------------------------------------------------------
    {
      id: 'meetingTitle',
      title: 'Meeting Title',
      type: 'short-input',
      placeholder: 'Weekly Standup',
      required: true,
      condition: {
        field: 'operation',
        value: ['webex_create_meeting', 'webex_update_meeting'],
      },
    },
    {
      id: 'startTime',
      title: 'Start Time (ISO 8601)',
      type: 'short-input',
      placeholder: '2026-03-01T10:00:00Z',
      required: true,
      condition: {
        field: 'operation',
        value: ['webex_create_meeting', 'webex_update_meeting'],
      },
    },
    {
      id: 'endTime',
      title: 'End Time (ISO 8601)',
      type: 'short-input',
      placeholder: '2026-03-01T11:00:00Z',
      required: true,
      condition: {
        field: 'operation',
        value: ['webex_create_meeting', 'webex_update_meeting'],
      },
    },
    {
      id: 'agenda',
      title: 'Agenda',
      type: 'long-input',
      placeholder: 'Weekly sync to review progress...',
      condition: {
        field: 'operation',
        value: ['webex_create_meeting', 'webex_update_meeting'],
      },
    },
    {
      id: 'timezone',
      title: 'Timezone',
      type: 'short-input',
      placeholder: 'UTC',
      condition: {
        field: 'operation',
        value: ['webex_create_meeting', 'webex_update_meeting'],
      },
    },
    {
      id: 'meetingInvitees',
      title: 'Invitees (comma-separated emails)',
      type: 'short-input',
      placeholder: 'alice@example.com, bob@example.com',
      condition: { field: 'operation', value: 'webex_create_meeting' },
    },
    {
      id: 'meetingId',
      title: 'Meeting ID',
      type: 'short-input',
      placeholder: 'a1b2c3d4...',
      required: true,
      condition: {
        field: 'operation',
        value: ['webex_get_meeting', 'webex_update_meeting', 'webex_delete_meeting'],
      },
    },
  ],
  tools: {
    access: [
      'webex_send_message',
      'webex_list_messages',
      'webex_get_message',
      'webex_delete_message',
      'webex_list_rooms',
      'webex_create_room',
      'webex_get_room',
      'webex_list_members',
      'webex_get_person',
      'webex_create_meeting',
      'webex_list_meetings',
      'webex_get_meeting',
      'webex_update_meeting',
      'webex_delete_meeting',
    ],
    config: {
      tool: (params) => params.operation as string,
      params: (params) => {
        const mapped: Record<string, unknown> = {}

        // Map subblock IDs to tool param names
        if (params.roomId) mapped.roomId = params.roomId
        if (params.toPersonEmail) mapped.toPersonEmail = params.toPersonEmail
        if (params.text) mapped.text = params.text
        if (params.markdown) mapped.markdown = params.markdown
        if (params.max) mapped.max = Number(params.max)
        if (params.messageId) mapped.messageId = params.messageId

        // Room ops
        if (params.roomTitle) mapped.title = params.roomTitle
        if (params.roomType) mapped.type = params.roomType
        if (params.roomIdDetail) mapped.roomId = params.roomIdDetail

        // People
        if (params.personId) mapped.personId = params.personId

        // Meetings
        if (params.meetingTitle) mapped.title = params.meetingTitle
        if (params.startTime) mapped.start = params.startTime
        if (params.endTime) mapped.end = params.endTime
        if (params.agenda) mapped.agenda = params.agenda
        if (params.timezone) mapped.timezone = params.timezone
        if (params.meetingInvitees) mapped.invitees = params.meetingInvitees
        if (params.meetingId) mapped.meetingId = params.meetingId

        return mapped
      },
    },
  },
  inputs: {
    operation: { type: 'string', description: 'Operation to perform' },
  },
  outputs: {
    response: { type: 'json', description: 'Response from the Webex API' },
  },
}
