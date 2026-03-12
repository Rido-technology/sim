'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createLogger } from '@sim/logger'
import { Plus, Trash2, Users } from 'lucide-react'
import type { TagItem } from '@/components/emcn'
import {
  Button,
  Combobox,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TagInput,
  Textarea,
} from '@/components/emcn'
import { Skeleton } from '@/components/ui'
import type { PermissionGroupConfig } from '@/lib/permission-groups/types'
import { useOrganizationMembers, useOrganizations } from '@/hooks/queries/organization'
import {
  type PermissionGroupBulkMemberInput,
  type PermissionGroupMember,
  type PermissionGroupSummary,
  useAddPermissionGroupMember,
  useBulkAddPermissionGroupMembers,
  useCreatePermissionGroup,
  useDeletePermissionGroup,
  usePermissionGroupMembers,
  usePermissionGroups,
  useRemovePermissionGroupMember,
  useUpdatePermissionGroup,
} from '@/hooks/queries/permission-groups'

const logger = createLogger('AccessControl')

type ConfigToggleKey = Exclude<
  keyof PermissionGroupConfig,
  'allowedIntegrations' | 'allowedModelProviders'
>

type ToggleDefinition = {
  key: ConfigToggleKey
  label: string
  description: string
}

const PLATFORM_TOGGLES: ToggleDefinition[] = [
  {
    key: 'hideTraceSpans',
    label: 'Hide trace spans',
    description: 'Disable trace span visibility in logs and observability panels.',
  },
  {
    key: 'hideKnowledgeBaseTab',
    label: 'Hide knowledge tab',
    description: 'Remove Knowledge Base from the workspace navigation.',
  },
  {
    key: 'hideCopilot',
    label: 'Hide copilot',
    description: 'Disable the copilot experience for members in this group.',
  },
  {
    key: 'hideApiKeysTab',
    label: 'Hide API keys tab',
    description: 'Remove API Keys from settings for this group.',
  },
  {
    key: 'hideEnvironmentTab',
    label: 'Hide environment tab',
    description: 'Disable access to environment variables in settings.',
  },
  {
    key: 'hideFilesTab',
    label: 'Hide files tab',
    description: 'Remove file uploads panel for this group.',
  },
  {
    key: 'hideTemplates',
    label: 'Hide templates',
    description: 'Remove template catalog access in the workspace.',
  },
]

const TOOL_TOGGLES: ToggleDefinition[] = [
  {
    key: 'disableMcpTools',
    label: 'Disable MCP tools',
    description: 'Block all MCP tool usage for this group.',
  },
  {
    key: 'disableCustomTools',
    label: 'Disable custom tools',
    description: 'Block all custom tool usage for this group.',
  },
  {
    key: 'disableSkills',
    label: 'Disable skills',
    description: 'Prevent skill usage for members in this group.',
  },
  {
    key: 'disableInvitations',
    label: 'Disable invitations',
    description: 'Prevent members from inviting others.',
  },
]

const DEPLOY_TOGGLES: ToggleDefinition[] = [
  {
    key: 'hideDeployApi',
    label: 'Hide API deploy tab',
    description: 'Remove API deployment from the deploy modal.',
  },
  {
    key: 'hideDeployMcp',
    label: 'Hide MCP deploy tab',
    description: 'Remove MCP deployment from the deploy modal.',
  },
  {
    key: 'hideDeployA2a',
    label: 'Hide A2A deploy tab',
    description: 'Remove A2A deployment from the deploy modal.',
  },
  {
    key: 'hideDeployChatbot',
    label: 'Hide chatbot deploy tab',
    description: 'Remove chatbot deployment from the deploy modal.',
  },
  {
    key: 'hideDeployTemplate',
    label: 'Hide template deploy tab',
    description: 'Remove template deployment from the deploy modal.',
  },
]

type OrganizationMember = {
  id: string
  userId: string
  role: string
  userName?: string | null
  userEmail?: string | null
}

type PermissionGroupFormState = {
  name: string
  description: string
  autoAddNewMembers: boolean
  allowAllIntegrations: boolean
  allowAllModelProviders: boolean
  integrationTags: TagItem[]
  modelProviderTags: TagItem[]
  toggles: Record<ConfigToggleKey, boolean>
}

type CreateGroupFormState = {
  name: string
  description: string
  autoAddNewMembers: boolean
}

const EMPTY_FORM_STATE: PermissionGroupFormState = {
  name: '',
  description: '',
  autoAddNewMembers: false,
  allowAllIntegrations: true,
  allowAllModelProviders: true,
  integrationTags: [],
  modelProviderTags: [],
  toggles: {
    hideTraceSpans: false,
    hideKnowledgeBaseTab: false,
    hideCopilot: false,
    hideApiKeysTab: false,
    hideEnvironmentTab: false,
    hideFilesTab: false,
    disableMcpTools: false,
    disableCustomTools: false,
    disableSkills: false,
    hideTemplates: false,
    disableInvitations: false,
    hideDeployApi: false,
    hideDeployMcp: false,
    hideDeployA2a: false,
    hideDeployChatbot: false,
    hideDeployTemplate: false,
  },
}

const EMPTY_CREATE_FORM: CreateGroupFormState = {
  name: '',
  description: '',
  autoAddNewMembers: false,
}

function buildTagItems(values: string[] | null | undefined): TagItem[] {
  if (!values || values.length === 0) return []
  return values.map((value) => ({ value, isValid: true }))
}

function buildGroupFormState(group: PermissionGroupSummary): PermissionGroupFormState {
  const allowAllIntegrations = group.config.allowedIntegrations === null
  const allowAllModelProviders = group.config.allowedModelProviders === null

  return {
    name: group.name,
    description: group.description ?? '',
    autoAddNewMembers: group.autoAddNewMembers,
    allowAllIntegrations,
    allowAllModelProviders,
    integrationTags: buildTagItems(group.config.allowedIntegrations),
    modelProviderTags: buildTagItems(group.config.allowedModelProviders),
    toggles: {
      hideTraceSpans: group.config.hideTraceSpans,
      hideKnowledgeBaseTab: group.config.hideKnowledgeBaseTab,
      hideCopilot: group.config.hideCopilot,
      hideApiKeysTab: group.config.hideApiKeysTab,
      hideEnvironmentTab: group.config.hideEnvironmentTab,
      hideFilesTab: group.config.hideFilesTab,
      disableMcpTools: group.config.disableMcpTools,
      disableCustomTools: group.config.disableCustomTools,
      disableSkills: group.config.disableSkills,
      hideTemplates: group.config.hideTemplates,
      disableInvitations: group.config.disableInvitations,
      hideDeployApi: group.config.hideDeployApi,
      hideDeployMcp: group.config.hideDeployMcp,
      hideDeployA2a: group.config.hideDeployA2a,
      hideDeployChatbot: group.config.hideDeployChatbot,
      hideDeployTemplate: group.config.hideDeployTemplate,
    },
  }
}

function buildConfigFromForm(form: PermissionGroupFormState): PermissionGroupConfig {
  return {
    allowedIntegrations: form.allowAllIntegrations
      ? null
      : form.integrationTags.map((tag) => tag.value),
    allowedModelProviders: form.allowAllModelProviders
      ? null
      : form.modelProviderTags.map((tag) => tag.value),
    hideTraceSpans: form.toggles.hideTraceSpans,
    hideKnowledgeBaseTab: form.toggles.hideKnowledgeBaseTab,
    hideCopilot: form.toggles.hideCopilot,
    hideApiKeysTab: form.toggles.hideApiKeysTab,
    hideEnvironmentTab: form.toggles.hideEnvironmentTab,
    hideFilesTab: form.toggles.hideFilesTab,
    disableMcpTools: form.toggles.disableMcpTools,
    disableCustomTools: form.toggles.disableCustomTools,
    disableSkills: form.toggles.disableSkills,
    hideTemplates: form.toggles.hideTemplates,
    disableInvitations: form.toggles.disableInvitations,
    hideDeployApi: form.toggles.hideDeployApi,
    hideDeployMcp: form.toggles.hideDeployMcp,
    hideDeployA2a: form.toggles.hideDeployA2a,
    hideDeployChatbot: form.toggles.hideDeployChatbot,
    hideDeployTemplate: form.toggles.hideDeployTemplate,
  }
}

function groupMemberDisplay(member: PermissionGroupMember): string {
  return member.userName || member.userEmail || member.userId
}

/**
 * Settings modal content for managing permission groups.
 */
export function AccessControl() {
  const { data: organizationsData } = useOrganizations()
  const activeOrganization = organizationsData?.activeOrganization
  const organizationId = activeOrganization?.id

  const { data: groups = [], isPending: groupsLoading, error: groupsError } =
    usePermissionGroups(organizationId)
  const { data: orgMembersData } = useOrganizationMembers(organizationId || '')
  const orgMembers = (orgMembersData?.data || []) as OrganizationMember[]
  const hasAdminAccess = orgMembersData?.hasAdminAccess ?? false

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [formState, setFormState] = useState<PermissionGroupFormState>(EMPTY_FORM_STATE)
  const [createForm, setCreateForm] = useState<CreateGroupFormState>(EMPTY_CREATE_FORM)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [memberSelection, setMemberSelection] = useState<string>('')

  const createGroup = useCreatePermissionGroup()
  const updateGroup = useUpdatePermissionGroup()
  const deleteGroup = useDeletePermissionGroup()
  const addMember = useAddPermissionGroupMember()
  const removeMember = useRemovePermissionGroupMember()
  const bulkAddMembers = useBulkAddPermissionGroupMembers()

  useEffect(() => {
    if (!selectedGroupId && groups.length > 0) {
      setSelectedGroupId(groups[0].id)
    }
  }, [groups, selectedGroupId])

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) || null,
    [groups, selectedGroupId]
  )

  useEffect(() => {
    if (!selectedGroup) {
      setFormState(EMPTY_FORM_STATE)
      return
    }
    setFormState(buildGroupFormState(selectedGroup))
  }, [selectedGroup])

  const { data: groupMembers = [], isPending: membersLoading } = usePermissionGroupMembers(
    selectedGroup?.id
  )

  const availableMembers = useMemo(() => {
    if (!selectedGroup) return orgMembers
    const assigned = new Set(groupMembers.map((member) => member.userId))
    return orgMembers.filter((member) => !assigned.has(member.userId))
  }, [groupMembers, orgMembers, selectedGroup])

  const isSaving = updateGroup.isPending
  const isCreating = createGroup.isPending

  const handleCreateGroup = useCallback(async () => {
    if (!organizationId) return
    if (!createForm.name.trim()) {
      setCreateError('Group name is required')
      return
    }

    try {
      setCreateError(null)
      const payload = {
        organizationId,
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        autoAddNewMembers: createForm.autoAddNewMembers,
      }
      const group = await createGroup.mutateAsync(payload)
      setSelectedGroupId(group.id)
      setCreateModalOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create group'
      setCreateError(message)
      logger.error('Create permission group failed', { error })
    }
  }, [createForm, createGroup, organizationId])

  const handleUpdateGroup = useCallback(async () => {
    if (!selectedGroup) return

    try {
      setUpdateError(null)
      await updateGroup.mutateAsync({
        id: selectedGroup.id,
        name: formState.name.trim(),
        description: formState.description.trim() || null,
        autoAddNewMembers: formState.autoAddNewMembers,
        config: buildConfigFromForm(formState),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update group'
      setUpdateError(message)
      logger.error('Update permission group failed', { error })
    }
  }, [formState, selectedGroup, updateGroup])

  const handleDeleteGroup = useCallback(async () => {
    if (!deleteGroupId) return
    try {
      await deleteGroup.mutateAsync(deleteGroupId)
      setDeleteGroupId(null)
      if (selectedGroupId === deleteGroupId) {
        setSelectedGroupId(null)
      }
    } catch (error) {
      logger.error('Delete permission group failed', { error })
    }
  }, [deleteGroup, deleteGroupId, selectedGroupId])

  const handleAddMember = useCallback(async () => {
    if (!selectedGroup || !memberSelection) return
    try {
      await addMember.mutateAsync({ groupId: selectedGroup.id, userId: memberSelection })
      setMemberSelection('')
    } catch (error) {
      logger.error('Add permission group member failed', { error })
    }
  }, [addMember, memberSelection, selectedGroup])

  const handleBulkAdd = useCallback(async () => {
    if (!selectedGroup) return
    const payload: PermissionGroupBulkMemberInput = {
      groupId: selectedGroup.id,
      addAllOrgMembers: true,
    }
    try {
      await bulkAddMembers.mutateAsync(payload)
    } catch (error) {
      logger.error('Bulk add permission group members failed', { error })
    }
  }, [bulkAddMembers, selectedGroup])

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      if (!selectedGroup) return
      try {
        await removeMember.mutateAsync({ groupId: selectedGroup.id, memberId })
      } catch (error) {
        logger.error('Remove permission group member failed', { error })
      }
    },
    [removeMember, selectedGroup]
  )

  const setToggle = useCallback((key: ConfigToggleKey, value: boolean) => {
    setFormState((prev) => ({
      ...prev,
      toggles: { ...prev.toggles, [key]: value },
    }))
  }, [])

  const handleAddIntegrationTag = useCallback((value: string) => {
    const normalized = value.trim()
    if (!normalized) return false
    let accepted = false
    setFormState((prev) => {
      if (prev.integrationTags.some((item) => item.value === normalized)) {
        return prev
      }
      accepted = true
      return {
        ...prev,
        integrationTags: [...prev.integrationTags, { value: normalized, isValid: true }],
      }
    })
    return accepted
  }, [])

  const handleRemoveIntegrationTag = useCallback((_value: string, index: number) => {
    setFormState((prev) => ({
      ...prev,
      integrationTags: prev.integrationTags.filter((_, i) => i !== index),
    }))
  }, [])

  const handleAddModelProviderTag = useCallback((value: string) => {
    const normalized = value.trim()
    if (!normalized) return false
    let accepted = false
    setFormState((prev) => {
      if (prev.modelProviderTags.some((item) => item.value === normalized)) {
        return prev
      }
      accepted = true
      return {
        ...prev,
        modelProviderTags: [...prev.modelProviderTags, { value: normalized, isValid: true }],
      }
    })
    return accepted
  }, [])

  const handleRemoveModelProviderTag = useCallback((_value: string, index: number) => {
    setFormState((prev) => ({
      ...prev,
      modelProviderTags: prev.modelProviderTags.filter((_, i) => i !== index),
    }))
  }, [])

  if (!organizationId) {
    return (
      <div className='flex h-full items-center justify-center text-sm text-[var(--text-tertiary)]'>
        Create or select an organization to manage access control.
      </div>
    )
  }

  if (groupsLoading) {
    return (
      <div className='flex h-full flex-col gap-[12px]'>
        <Skeleton className='h-[20px] w-[160px]' />
        <Skeleton className='h-[36px] w-full' />
        <Skeleton className='h-[36px] w-full' />
        <Skeleton className='h-[36px] w-full' />
      </div>
    )
  }

  return (
    <div className='flex h-full gap-[16px]'>
      <div className='flex w-[260px] flex-col gap-[12px] border-r border-[var(--border-1)] pr-[12px]'>
        <div className='flex items-center justify-between'>
          <div className='text-[13px] font-medium text-[var(--text-primary)]'>Groups</div>
          <Button
            size='sm'
            variant='ghost'
            disabled={!hasAdminAccess}
            onClick={() => {
              setCreateForm({ ...EMPTY_CREATE_FORM })
              setCreateError(null)
              setCreateModalOpen(true)
            }}
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>

        {groupsError && (
          <div className='text-xs text-[var(--text-error)]'>
            {groupsError instanceof Error ? groupsError.message : 'Failed to load groups'}
          </div>
        )}

        {groups.length === 0 && (
          <div className='rounded-[6px] border border-dashed border-[var(--border-1)] p-[12px] text-xs text-[var(--text-tertiary)]'>
            No permission groups yet.
          </div>
        )}

        <div className='flex flex-1 flex-col gap-[6px] overflow-y-auto pr-[2px]'>
          {groups.map((group) => (
            <button
              key={group.id}
              type='button'
              onClick={() => setSelectedGroupId(group.id)}
              className={
                selectedGroupId === group.id
                  ? 'flex w-full flex-col gap-[2px] rounded-[6px] border border-[var(--border-1)] bg-[var(--surface-6)] px-[10px] py-[8px] text-left'
                  : 'flex w-full flex-col gap-[2px] rounded-[6px] border border-transparent px-[10px] py-[8px] text-left hover:border-[var(--border-1)] hover:bg-[var(--surface-5)]'
              }
            >
              <span className='text-[13px] font-medium text-[var(--text-primary)]'>
                {group.name}
              </span>
              <span className='text-[11px] text-[var(--text-tertiary)]'>
                {group.memberCount} members
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className='flex min-w-0 flex-1 flex-col gap-[16px] overflow-y-auto pr-[8px]'>
        {!selectedGroup && (
          <div className='rounded-[8px] border border-dashed border-[var(--border-1)] p-[16px] text-sm text-[var(--text-tertiary)]'>
            Select a group to view details.
          </div>
        )}

        {selectedGroup && (
          <div className='flex flex-col gap-[16px]'>
            <div className='flex items-center justify-between'>
              <div className='flex flex-col gap-[4px]'>
                <div className='text-[16px] font-semibold text-[var(--text-primary)]'>
                  {selectedGroup.name}
                </div>
                <div className='text-[12px] text-[var(--text-tertiary)]'>
                  {selectedGroup.description || 'No description'}
                </div>
              </div>
              <Button
                size='sm'
                variant='ghost'
                disabled={!hasAdminAccess}
                onClick={() => setDeleteGroupId(selectedGroup.id)}
              >
                <Trash2 className='h-4 w-4 text-[var(--text-error)]' />
              </Button>
            </div>

            <div className='grid gap-[12px]'>
              <div className='grid gap-[6px]'>
                <Label>Name</Label>
                <Input
                  value={formState.name}
                  disabled={!hasAdminAccess}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className='grid gap-[6px]'>
                <Label>Description</Label>
                <Textarea
                  value={formState.description}
                  disabled={!hasAdminAccess}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
              <div className='flex items-center justify-between rounded-[8px] border border-[var(--border-1)] px-[12px] py-[10px]'>
                <div>
                  <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                    Auto-add new members
                  </div>
                  <div className='text-[11px] text-[var(--text-tertiary)]'>
                    Automatically assign new organization members to this group.
                  </div>
                </div>
                <Switch
                  checked={formState.autoAddNewMembers}
                  disabled={!hasAdminAccess}
                  onCheckedChange={(value) =>
                    setFormState((prev) => ({ ...prev, autoAddNewMembers: value }))
                  }
                />
              </div>
            </div>

            <div className='grid gap-[12px]'>
              <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                Allowed integrations
              </div>
              <div className='flex items-center justify-between rounded-[8px] border border-[var(--border-1)] px-[12px] py-[10px]'>
                <div>
                  <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                    Allow all integrations
                  </div>
                  <div className='text-[11px] text-[var(--text-tertiary)]'>
                    Disable to restrict integrations to the list below.
                  </div>
                </div>
                <Switch
                  checked={formState.allowAllIntegrations}
                  disabled={!hasAdminAccess}
                  onCheckedChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      allowAllIntegrations: value,
                      integrationTags: value ? [] : prev.integrationTags,
                    }))
                  }
                />
              </div>
              {!formState.allowAllIntegrations && (
                <TagInput
                  items={formState.integrationTags}
                  disabled={!hasAdminAccess}
                  onAdd={handleAddIntegrationTag}
                  onRemove={handleRemoveIntegrationTag}
                  placeholder='Add integration IDs (e.g. slack, notion)'
                />
              )}
            </div>

            <div className='grid gap-[12px]'>
              <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                Allowed model providers
              </div>
              <div className='flex items-center justify-between rounded-[8px] border border-[var(--border-1)] px-[12px] py-[10px]'>
                <div>
                  <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                    Allow all model providers
                  </div>
                  <div className='text-[11px] text-[var(--text-tertiary)]'>
                    Disable to restrict providers to the list below.
                  </div>
                </div>
                <Switch
                  checked={formState.allowAllModelProviders}
                  disabled={!hasAdminAccess}
                  onCheckedChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      allowAllModelProviders: value,
                      modelProviderTags: value ? [] : prev.modelProviderTags,
                    }))
                  }
                />
              </div>
              {!formState.allowAllModelProviders && (
                <TagInput
                  items={formState.modelProviderTags}
                  disabled={!hasAdminAccess}
                  onAdd={handleAddModelProviderTag}
                  onRemove={handleRemoveModelProviderTag}
                  placeholder='Add provider IDs (e.g. openai, anthropic)'
                />
              )}
            </div>

            <div className='grid gap-[12px]'>
              <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                Platform visibility
              </div>
              <div className='grid gap-[8px]'>
                {PLATFORM_TOGGLES.map((item) => (
                  <div
                    key={item.key}
                    className='flex items-center justify-between rounded-[8px] border border-[var(--border-1)] px-[12px] py-[10px]'
                  >
                    <div>
                      <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                        {item.label}
                      </div>
                      <div className='text-[11px] text-[var(--text-tertiary)]'>
                        {item.description}
                      </div>
                    </div>
                    <Switch
                      checked={formState.toggles[item.key]}
                      disabled={!hasAdminAccess}
                      onCheckedChange={(value) => setToggle(item.key, value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className='grid gap-[12px]'>
              <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                Tooling restrictions
              </div>
              <div className='grid gap-[8px]'>
                {TOOL_TOGGLES.map((item) => (
                  <div
                    key={item.key}
                    className='flex items-center justify-between rounded-[8px] border border-[var(--border-1)] px-[12px] py-[10px]'
                  >
                    <div>
                      <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                        {item.label}
                      </div>
                      <div className='text-[11px] text-[var(--text-tertiary)]'>
                        {item.description}
                      </div>
                    </div>
                    <Switch
                      checked={formState.toggles[item.key]}
                      disabled={!hasAdminAccess}
                      onCheckedChange={(value) => setToggle(item.key, value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className='grid gap-[12px]'>
              <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                Deploy tabs
              </div>
              <div className='grid gap-[8px]'>
                {DEPLOY_TOGGLES.map((item) => (
                  <div
                    key={item.key}
                    className='flex items-center justify-between rounded-[8px] border border-[var(--border-1)] px-[12px] py-[10px]'
                  >
                    <div>
                      <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                        {item.label}
                      </div>
                      <div className='text-[11px] text-[var(--text-tertiary)]'>
                        {item.description}
                      </div>
                    </div>
                    <Switch
                      checked={formState.toggles[item.key]}
                      disabled={!hasAdminAccess}
                      onCheckedChange={(value) => setToggle(item.key, value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className='grid gap-[12px]'>
              <div className='flex items-center justify-between'>
                <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                  Members
                </div>
                <Button
                  size='sm'
                  variant='ghost'
                  disabled={!hasAdminAccess || !selectedGroup}
                  onClick={handleBulkAdd}
                >
                  <Users className='h-4 w-4' />
                </Button>
              </div>

              <div className='grid gap-[8px]'>
                <div className='flex items-center gap-[8px]'>
                  <Combobox
                    options={availableMembers.map((member) => ({
                      label: member.userName || member.userEmail || member.userId,
                      value: member.userId,
                    }))}
                    value={memberSelection}
                    onChange={setMemberSelection}
                    placeholder='Select member'
                    disabled={!hasAdminAccess}
                  />
                  <Button
                    size='sm'
                    disabled={!hasAdminAccess || !memberSelection}
                    onClick={handleAddMember}
                  >
                    Add
                  </Button>
                </div>

                <div className='rounded-[8px] border border-[var(--border-1)]'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Assigned</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {membersLoading && (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Skeleton className='h-[16px] w-full' />
                          </TableCell>
                        </TableRow>
                      )}
                      {!membersLoading && groupMembers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className='text-xs text-[var(--text-tertiary)]'>
                            No members assigned yet.
                          </TableCell>
                        </TableRow>
                      )}
                      {groupMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{groupMemberDisplay(member)}</TableCell>
                          <TableCell>
                            {new Date(member.assignedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className='text-right'>
                            <Button
                              size='sm'
                              variant='ghost'
                              disabled={!hasAdminAccess}
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {updateError && (
              <div className='text-xs text-[var(--text-error)]'>{updateError}</div>
            )}

            <div className='flex items-center justify-end gap-[8px]'>
              <Button
                disabled={!hasAdminAccess || isSaving}
                onClick={handleUpdateGroup}
              >
                Save changes
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <ModalContent size='sm'>
          <ModalHeader>
            <ModalTitle>Create permission group</ModalTitle>
          </ModalHeader>
          <ModalBody className='grid gap-[12px]'>
            <div className='grid gap-[6px]'>
              <Label>Name</Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className='grid gap-[6px]'>
              <Label>Description</Label>
              <Textarea
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className='flex items-center justify-between rounded-[8px] border border-[var(--border-1)] px-[12px] py-[10px]'>
              <div>
                <div className='text-[13px] font-medium text-[var(--text-primary)]'>
                  Auto-add new members
                </div>
                <div className='text-[11px] text-[var(--text-tertiary)]'>
                  Automatically assign new organization members to this group.
                </div>
              </div>
              <Switch
                checked={createForm.autoAddNewMembers}
                onCheckedChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, autoAddNewMembers: value }))
                }
              />
            </div>
            {createError && <div className='text-xs text-[var(--text-error)]'>{createError}</div>}
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button disabled={isCreating} onClick={handleCreateGroup}>
              Create group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal open={!!deleteGroupId} onOpenChange={() => setDeleteGroupId(null)}>
        <ModalContent size='sm'>
          <ModalHeader>
            <ModalTitle>Delete permission group</ModalTitle>
          </ModalHeader>
          <ModalBody className='text-sm text-[var(--text-secondary)]'>
            This will remove the group and unassign all members. This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={() => setDeleteGroupId(null)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDeleteGroup}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
