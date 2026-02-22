'use client'

import { useCallback, useMemo, useState } from 'react'
import { createLogger } from '@sim/logger'
import { Plus, Search } from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Checkbox,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTabs,
  ModalTabsContent,
  ModalTabsList,
  ModalTabsTrigger,
  Switch,
} from '@/components/emcn'
import { Input as BaseInput, Skeleton } from '@/components/ui'
import { useSession } from '@/lib/auth/auth-client'
import { getSubscriptionStatus } from '@/lib/billing/client'
import type { PermissionGroupConfig } from '@/lib/permission-groups/types'
import { getUserColor } from '@/lib/workspaces/colors'
import { getUserRole } from '@/lib/workspaces/organization'
import { getAllBlocks } from '@/blocks'
import {
  type PermissionGroup,
  useBulkAddPermissionGroupMembers,
  useCreatePermissionGroup,
  useDeletePermissionGroup,
  usePermissionGroupMembers,
  usePermissionGroups,
  useRemovePermissionGroupMember,
  useUpdatePermissionGroup,
} from '@/extra/permissions/hooks'
import { useOrganization, useOrganizations } from '@/hooks/queries/organization'
import { useSubscriptionData } from '@/hooks/queries/subscription'
import { PROVIDER_DEFINITIONS } from '@/providers/models'
import { getAllProviderIds } from '@/providers/utils'

const logger = createLogger('AccessControl')

// ---------------------------------------------------------------------------
// Module-level constants
// ---------------------------------------------------------------------------

const PLATFORM_FEATURES = [
  { id: 'hide-knowledge-base', label: 'Knowledge Base', category: 'Sidebar', configKey: 'hideKnowledgeBaseTab' },
  { id: 'hide-templates', label: 'Templates', category: 'Sidebar', configKey: 'hideTemplates' },
  { id: 'hide-copilot', label: 'Copilot', category: 'Workflow Panel', configKey: 'hideCopilot' },
  { id: 'hide-api-keys', label: 'API Keys', category: 'Settings Tabs', configKey: 'hideApiKeysTab' },
  { id: 'hide-environment', label: 'Environment', category: 'Settings Tabs', configKey: 'hideEnvironmentTab' },
  { id: 'hide-files', label: 'Files', category: 'Settings Tabs', configKey: 'hideFilesTab' },
  { id: 'hide-deploy-api', label: 'API', category: 'Deploy Tabs', configKey: 'hideDeployApi' },
  { id: 'hide-deploy-mcp', label: 'MCP', category: 'Deploy Tabs', configKey: 'hideDeployMcp' },
  { id: 'hide-deploy-a2a', label: 'A2A', category: 'Deploy Tabs', configKey: 'hideDeployA2a' },
  { id: 'hide-deploy-chatbot', label: 'Chat', category: 'Deploy Tabs', configKey: 'hideDeployChatbot' },
  { id: 'hide-deploy-template', label: 'Template', category: 'Deploy Tabs', configKey: 'hideDeployTemplate' },
  { id: 'disable-mcp', label: 'MCP Tools', category: 'Tools', configKey: 'disableMcpTools' },
  { id: 'disable-custom-tools', label: 'Custom Tools', category: 'Tools', configKey: 'disableCustomTools' },
  { id: 'disable-skills', label: 'Skills', category: 'Tools', configKey: 'disableSkills' },
  { id: 'hide-trace-spans', label: 'Trace Spans', category: 'Logs', configKey: 'hideTraceSpans' },
  { id: 'disable-invitations', label: 'Invitations', category: 'Collaboration', configKey: 'disableInvitations' },
] as const

type PlatformFeatureKey = (typeof PLATFORM_FEATURES)[number]['configKey']

const ALL_PLATFORM_CONFIG_KEYS = PLATFORM_FEATURES.map((f) => f.configKey) as PlatformFeatureKey[]

// ---------------------------------------------------------------------------
// FilterHeader
// ---------------------------------------------------------------------------

interface FilterHeaderProps {
  placeholder: string
  searchValue: string
  onSearchChange: (value: string) => void
  onToggleAll: () => void
  isAllSelected: boolean
}

function FilterHeader({
  placeholder,
  searchValue,
  onSearchChange,
  onToggleAll,
  isAllSelected,
}: FilterHeaderProps) {
  return (
    <div className='flex items-center gap-[8px]'>
      <div className='flex flex-1 items-center gap-[8px] rounded-[8px] border border-[var(--border)] bg-transparent px-[8px] py-[5px]'>
        <Search className='h-[14px] w-[14px] flex-shrink-0 text-[var(--text-tertiary)]' />
        <BaseInput
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className='h-auto flex-1 border-0 bg-transparent p-0 font-base text-[13px] leading-none placeholder:text-[var(--text-tertiary)] focus-visible:ring-0 focus-visible:ring-offset-0'
        />
      </div>
      <Button variant='tertiary' onClick={onToggleAll}>
        {isAllSelected ? 'Deselect All' : 'Select All'}
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// UnsavedChangesModal
// ---------------------------------------------------------------------------

interface UnsavedChangesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDiscard: () => void
  onSave: () => void
  isSaving: boolean
}

function UnsavedChangesModal({
  open,
  onOpenChange,
  onDiscard,
  onSave,
  isSaving,
}: UnsavedChangesModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size='sm'>
        <ModalHeader>Unsaved Changes</ModalHeader>
        <ModalBody>
          <p className='text-[12px] text-[var(--text-secondary)]'>
            You have unsaved changes. Do you want to save them before closing?
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant='destructive' onClick={onDiscard}>
            Discard Changes
          </Button>
          <Button variant='tertiary' onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// AddMembersModal
// ---------------------------------------------------------------------------

interface AddMembersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableMembers: any[]
  selectedMemberIds: Set<string>
  setSelectedMemberIds: React.Dispatch<React.SetStateAction<Set<string>>>
  onAddMembers: () => void
  isAdding: boolean
}

function AddMembersModal({
  open,
  onOpenChange,
  availableMembers,
  selectedMemberIds,
  setSelectedMemberIds,
  onAddMembers,
  isAdding,
}: AddMembersModalProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return availableMembers
    const query = searchTerm.toLowerCase()
    return availableMembers.filter((m: any) => {
      const name = m.user?.name || ''
      const email = m.user?.email || ''
      return name.toLowerCase().includes(query) || email.toLowerCase().includes(query)
    })
  }, [availableMembers, searchTerm])

  const allFilteredSelected = useMemo(
    () => filteredMembers.length > 0 && filteredMembers.every((m: any) => selectedMemberIds.has(m.userId)),
    [filteredMembers, selectedMemberIds]
  )

  const toggleAll = () => {
    const ids = new Set(filteredMembers.map((m: any) => m.userId))
    setSelectedMemberIds((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        ids.forEach((id) => next.delete(id))
      } else {
        ids.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const toggleMember = (userId: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev)
      next.has(userId) ? next.delete(userId) : next.add(userId)
      return next
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) setSearchTerm('')
        onOpenChange(o)
      }}
    >
      <ModalContent className='w-[420px]'>
        <ModalHeader>Add Members</ModalHeader>
        <ModalBody className='!pb-[16px]'>
          {availableMembers.length === 0 ? (
            <p className='text-[13px] text-[var(--text-muted)]'>
              All organization members are already in this group.
            </p>
          ) : (
            <div className='flex flex-col gap-[12px]'>
              <div className='flex items-center gap-[8px]'>
                <div className='flex flex-1 items-center gap-[8px] rounded-[8px] border border-[var(--border)] bg-transparent px-[8px] py-[5px]'>
                  <Search className='h-[14px] w-[14px] flex-shrink-0 text-[var(--text-tertiary)]' />
                  <BaseInput
                    placeholder='Search members...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='h-auto flex-1 border-0 bg-transparent p-0 font-base text-[13px] leading-none placeholder:text-[var(--text-tertiary)] focus-visible:ring-0 focus-visible:ring-offset-0'
                  />
                </div>
                <Button variant='tertiary' onClick={toggleAll}>
                  {allFilteredSelected ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className='max-h-[280px] overflow-y-auto'>
                {filteredMembers.length === 0 ? (
                  <p className='py-[16px] text-center text-[13px] text-[var(--text-muted)]'>
                    No members found matching &ldquo;{searchTerm}&rdquo;
                  </p>
                ) : (
                  <div className='flex flex-col'>
                    {filteredMembers.map((m: any) => {
                      const name = m.user?.name || 'Unknown'
                      const email = m.user?.email || ''
                      const isSelected = selectedMemberIds.has(m.userId)
                      return (
                        <button
                          key={m.userId}
                          type='button'
                          onClick={() => toggleMember(m.userId)}
                          className='flex items-center gap-[10px] rounded-[4px] px-[8px] py-[6px] hover:bg-[var(--surface-2)]'
                        >
                          <Checkbox checked={isSelected} />
                          <Avatar size='sm'>
                            {m.user?.image && <AvatarImage src={m.user.image} alt={name} />}
                            <AvatarFallback
                              style={{ background: getUserColor(m.userId || email) }}
                              className='border-0 text-[10px] text-white'
                            >
                              {name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1 text-left'>
                            <div className='truncate text-[13px] text-[var(--text-primary)]'>{name}</div>
                            <div className='truncate text-[11px] text-[var(--text-muted)]'>{email}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant='default'
            onClick={() => {
              setSearchTerm('')
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            variant='tertiary'
            onClick={onAddMembers}
            disabled={selectedMemberIds.size === 0 || isAdding}
          >
            {isAdding ? 'Adding...' : 'Add Members'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// AccessControlSkeleton
// ---------------------------------------------------------------------------

function AccessControlSkeleton() {
  return (
    <div className='flex h-full flex-col gap-[16px]'>
      <div className='flex flex-col gap-[8px]'>
        <Skeleton className='h-[14px] w-[100px]' />
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-[12px]'>
            <Skeleton className='h-9 w-9 rounded-[6px]' />
            <div className='flex flex-col gap-[4px]'>
              <Skeleton className='h-[14px] w-[120px]' />
              <Skeleton className='h-[12px] w-[80px]' />
            </div>
          </div>
          <Skeleton className='h-[32px] w-[60px] rounded-[6px]' />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AccessControl – main component
// ---------------------------------------------------------------------------

export function AccessControl() {
  const { data: session } = useSession()
  const { data: organizationsData, isPending: orgsLoading } = useOrganizations()
  const { data: subscriptionData, isPending: subLoading } = useSubscriptionData()

  const activeOrganization = organizationsData?.activeOrganization
  const subscriptionStatus = getSubscriptionStatus(subscriptionData?.data)
  const hasEnterprisePlan = subscriptionStatus.isEnterprise
  const userRole = getUserRole(activeOrganization, session?.user?.email)
  const isOrgAdminOrOwner = userRole === 'owner' || userRole === 'admin'
  const canManage = hasEnterprisePlan && isOrgAdminOrOwner && !!activeOrganization?.id

  const queryEnabled = !!activeOrganization?.id
  const { data: permissionGroups = [], isPending: groupsLoading } = usePermissionGroups(
    activeOrganization?.id,
    queryEnabled
  )

  const isLoading = orgsLoading || subLoading || (queryEnabled && groupsLoading)
  const { data: organization } = useOrganization(activeOrganization?.id || '')

  const createPermissionGroup = useCreatePermissionGroup()
  const updatePermissionGroup = useUpdatePermissionGroup()
  const deletePermissionGroup = useDeletePermissionGroup()
  const bulkAddMembers = useBulkAddPermissionGroupMembers()

  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewingGroup, setViewingGroup] = useState<PermissionGroup | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [newGroupAutoAdd, setNewGroupAutoAdd] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<{ id: string; name: string } | null>(null)
  const [deletingGroupIds, setDeletingGroupIds] = useState<Set<string>>(new Set())

  const { data: members = [], isPending: membersLoading } = usePermissionGroupMembers(viewingGroup?.id)
  const removeMember = useRemovePermissionGroupMember()

  const [showConfigModal, setShowConfigModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<PermissionGroupConfig | null>(null)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set())
  const [providerSearchTerm, setProviderSearchTerm] = useState('')
  const [integrationSearchTerm, setIntegrationSearchTerm] = useState('')
  const [platformSearchTerm, setPlatformSearchTerm] = useState('')
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false)

  const filteredPlatformFeatures = useMemo(() => {
    if (!platformSearchTerm.trim()) return PLATFORM_FEATURES
    const search = platformSearchTerm.toLowerCase()
    return PLATFORM_FEATURES.filter(
      (f) => f.label.toLowerCase().includes(search) || f.category.toLowerCase().includes(search)
    )
  }, [platformSearchTerm])

  const platformCategories = useMemo(() => {
    const cats: Record<string, typeof filteredPlatformFeatures> = {}
    for (const feature of filteredPlatformFeatures) {
      if (!cats[feature.category]) cats[feature.category] = []
      cats[feature.category].push(feature)
    }
    return cats
  }, [filteredPlatformFeatures])

  const hasConfigChanges = useMemo(
    () =>
      !!(viewingGroup && editingConfig && JSON.stringify(viewingGroup.config) !== JSON.stringify(editingConfig)),
    [viewingGroup, editingConfig]
  )

  const allBlocks = useMemo(() => {
    return getAllBlocks()
      .filter((b) => !b.hideFromToolbar && b.type !== 'start_trigger')
      .sort((a, b) => {
        const order = { triggers: 0, blocks: 1, tools: 2 }
        const catA = order[a.category as keyof typeof order] ?? 3
        const catB = order[b.category as keyof typeof order] ?? 3
        return catA !== catB ? catA - catB : a.name.localeCompare(b.name)
      })
  }, [])

  const allProviderIds = useMemo(() => getAllProviderIds(), [])

  const filteredProviders = useMemo(() => {
    if (!providerSearchTerm.trim()) return allProviderIds
    const query = providerSearchTerm.toLowerCase()
    return allProviderIds.filter((id) => id.toLowerCase().includes(query))
  }, [allProviderIds, providerSearchTerm])

  const filteredBlocks = useMemo(() => {
    if (!integrationSearchTerm.trim()) return allBlocks
    const query = integrationSearchTerm.toLowerCase()
    return allBlocks.filter((b) => b.name.toLowerCase().includes(query))
  }, [allBlocks, integrationSearchTerm])

  const orgMembers = useMemo(() => organization?.members || [], [organization])

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return permissionGroups
    const q = searchTerm.toLowerCase()
    return permissionGroups.filter((g) => g.name.toLowerCase().includes(q))
  }, [permissionGroups, searchTerm])

  const closeConfigModal = useCallback(() => {
    setShowConfigModal(false)
    setProviderSearchTerm('')
    setIntegrationSearchTerm('')
    setPlatformSearchTerm('')
  }, [])

  const handleCreatePermissionGroup = useCallback(async () => {
    if (!newGroupName.trim() || !activeOrganization?.id) return
    setCreateError(null)
    try {
      await createPermissionGroup.mutateAsync({
        organizationId: activeOrganization.id,
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || undefined,
        autoAddNewMembers: newGroupAutoAdd,
      })
      setShowCreateModal(false)
      setNewGroupName('')
      setNewGroupDescription('')
      setNewGroupAutoAdd(false)
    } catch (error) {
      logger.error('Failed to create permission group', error)
      setCreateError(error instanceof Error ? error.message : 'Failed to create permission group')
    }
  }, [newGroupName, newGroupDescription, newGroupAutoAdd, activeOrganization?.id, createPermissionGroup])

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false)
    setNewGroupName('')
    setNewGroupDescription('')
    setNewGroupAutoAdd(false)
    setCreateError(null)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!deletingGroup || !activeOrganization?.id) return
    setDeletingGroupIds((prev) => new Set(prev).add(deletingGroup.id))
    try {
      await deletePermissionGroup.mutateAsync({
        permissionGroupId: deletingGroup.id,
        organizationId: activeOrganization.id,
      })
      setDeletingGroup(null)
      if (viewingGroup?.id === deletingGroup.id) setViewingGroup(null)
    } catch (error) {
      logger.error('Failed to delete permission group', error)
    } finally {
      setDeletingGroupIds((prev) => {
        const next = new Set(prev)
        next.delete(deletingGroup.id)
        return next
      })
    }
  }, [deletingGroup, activeOrganization?.id, deletePermissionGroup, viewingGroup?.id])

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      if (!viewingGroup) return
      try {
        await removeMember.mutateAsync({ permissionGroupId: viewingGroup.id, memberId })
      } catch (error) {
        logger.error('Failed to remove member', error)
      }
    },
    [viewingGroup, removeMember]
  )

  const handleSaveConfig = useCallback(async () => {
    if (!viewingGroup || !editingConfig || !activeOrganization?.id) return
    try {
      await updatePermissionGroup.mutateAsync({
        id: viewingGroup.id,
        organizationId: activeOrganization.id,
        config: editingConfig,
      })
      closeConfigModal()
      setEditingConfig(null)
      setViewingGroup((prev) => (prev ? { ...prev, config: editingConfig } : null))
    } catch (error) {
      logger.error('Failed to update config', error)
    }
  }, [viewingGroup, editingConfig, activeOrganization?.id, updatePermissionGroup, closeConfigModal])

  const handleAddSelectedMembers = useCallback(async () => {
    if (!viewingGroup || selectedMemberIds.size === 0) return
    try {
      await bulkAddMembers.mutateAsync({
        permissionGroupId: viewingGroup.id,
        userIds: Array.from(selectedMemberIds),
      })
      setShowAddMembersModal(false)
      setSelectedMemberIds(new Set())
    } catch (error) {
      logger.error('Failed to add members', error)
    }
  }, [viewingGroup, selectedMemberIds, bulkAddMembers])

  const handleToggleAutoAdd = useCallback(
    async (enabled: boolean) => {
      if (!viewingGroup || !activeOrganization?.id) return
      try {
        await updatePermissionGroup.mutateAsync({
          id: viewingGroup.id,
          organizationId: activeOrganization.id,
          autoAddNewMembers: enabled,
        })
        setViewingGroup((prev) => (prev ? { ...prev, autoAddNewMembers: enabled } : null))
      } catch (error) {
        logger.error('Failed to toggle auto-add', error)
      }
    },
    [viewingGroup, activeOrganization?.id, updatePermissionGroup]
  )

  const toggleItem = useCallback(
    (type: 'integration' | 'provider', key: string) => {
      if (!editingConfig) return
      const field = type === 'integration' ? 'allowedIntegrations' : 'allowedModelProviders'
      const allKeys = type === 'integration' ? allBlocks.map((b) => b.type) : allProviderIds
      const current = editingConfig[field]
      let next: string[] | null
      if (current === null) {
        next = allKeys.filter((k) => k !== key)
      } else if (current.includes(key)) {
        const filtered = current.filter((k) => k !== key)
        next = filtered.length === allKeys.length ? null : filtered
      } else {
        const added = [...current, key]
        next = added.length === allKeys.length ? null : added
      }
      setEditingConfig({ ...editingConfig, [field]: next })
    },
    [editingConfig, allBlocks, allProviderIds]
  )

  const isAllowed = useCallback(
    (type: 'integration' | 'provider', key: string) => {
      if (!editingConfig) return true
      const list = type === 'integration' ? editingConfig.allowedIntegrations : editingConfig.allowedModelProviders
      return list === null || list.includes(key)
    },
    [editingConfig]
  )

  const availableMembersToAdd = useMemo(() => {
    const existing = new Set(members.map((m) => m.userId))
    return orgMembers.filter((m: any) => !existing.has(m.userId))
  }, [orgMembers, members])

  const allPlatformFeaturesVisible = useMemo(
    () => ALL_PLATFORM_CONFIG_KEYS.every((k) => !editingConfig?.[k as keyof PermissionGroupConfig]),
    [editingConfig]
  )

  if (isLoading) return <AccessControlSkeleton />

  if (viewingGroup) {
    return (
      <>
        <div className='flex h-full flex-col gap-[16px]'>
          <div className='flex flex-col gap-[4px]'>
            <div className='flex items-center justify-between'>
              <h3 className='font-medium text-[14px] text-[var(--text-primary)]'>{viewingGroup.name}</h3>
              <Button
                variant='default'
                onClick={() => {
                  setEditingConfig({ ...viewingGroup.config })
                  setShowConfigModal(true)
                }}
              >
                Configure
              </Button>
            </div>
            {viewingGroup.description && (
              <p className='text-[13px] text-[var(--text-muted)]'>{viewingGroup.description}</p>
            )}
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex flex-col gap-[2px]'>
              <span className='font-medium text-[13px] text-[var(--text-primary)]'>Auto-add new members</span>
              <span className='text-[12px] text-[var(--text-muted)]'>
                Automatically add new organization members to this group
              </span>
            </div>
            <Switch
              checked={viewingGroup.autoAddNewMembers}
              onCheckedChange={handleToggleAutoAdd}
              disabled={updatePermissionGroup.isPending}
            />
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto'>
            <div className='flex flex-col gap-[8px]'>
              <div className='flex items-center justify-between'>
                <span className='font-medium text-[13px] text-[var(--text-secondary)]'>Members</span>
                <Button
                  variant='tertiary'
                  onClick={() => {
                    setSelectedMemberIds(new Set())
                    setShowAddMembersModal(true)
                  }}
                >
                  <Plus className='mr-[6px] h-[13px] w-[13px]' />
                  Add
                </Button>
              </div>

              {membersLoading ? (
                <div className='flex flex-col gap-[16px]'>
                  {[1, 2].map((i) => (
                    <div key={i} className='flex items-center justify-between'>
                      <div className='flex items-center gap-[12px]'>
                        <Skeleton className='h-8 w-8 rounded-full' />
                        <div className='flex flex-col gap-[4px]'>
                          <Skeleton className='h-[14px] w-[100px]' />
                          <Skeleton className='h-[12px] w-[150px]' />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <p className='text-[13px] text-[var(--text-muted)]'>
                  No members yet. Click &ldquo;Add&rdquo; to get started.
                </p>
              ) : (
                <div className='flex flex-col gap-[16px]'>
                  {members.map((m) => {
                    const name = m.userName || 'Unknown'
                    return (
                      <div key={m.id} className='flex items-center justify-between'>
                        <div className='flex flex-1 items-center gap-[12px]'>
                          <Avatar size='md'>
                            {m.userImage && <AvatarImage src={m.userImage} alt={name} />}
                            <AvatarFallback
                              style={{ background: getUserColor(m.userId || m.userEmail || '') }}
                              className='border-0 text-white'
                            >
                              {name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0'>
                            <div className='flex items-center gap-[8px]'>
                              <span className='truncate font-medium text-[14px] text-[var(--text-primary)]'>{name}</span>
                            </div>
                            <div className='truncate text-[12px] text-[var(--text-muted)]'>{m.userEmail}</div>
                          </div>
                        </div>
                        <Button
                          variant='ghost'
                          onClick={() => handleRemoveMember(m.id)}
                          disabled={removeMember.isPending}
                          className='flex-shrink-0'
                        >
                          Remove
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className='mt-auto flex items-center justify-end'>
            <Button onClick={() => setViewingGroup(null)} variant='tertiary'>
              Back
            </Button>
          </div>
        </div>

        {/* Config modal */}
        <Modal
          open={showConfigModal}
          onOpenChange={(open) => {
            if (!open && hasConfigChanges) {
              setShowUnsavedChanges(true)
            } else {
              if (!open) closeConfigModal()
              setShowConfigModal(open)
            }
          }}
        >
          <ModalContent size='xl' className='max-h-[80vh]'>
            <ModalHeader>Configure Permissions</ModalHeader>
            <ModalTabs defaultValue='providers'>
              <ModalTabsList>
                <ModalTabsTrigger value='providers'>Model Providers</ModalTabsTrigger>
                <ModalTabsTrigger value='blocks'>Blocks</ModalTabsTrigger>
                <ModalTabsTrigger value='platform'>Platform</ModalTabsTrigger>
              </ModalTabsList>

              <ModalTabsContent value='providers'>
                <ModalBody className='h-[400px]'>
                  <div className='flex flex-col gap-[8px]'>
                    <FilterHeader
                      placeholder='Search providers...'
                      searchValue={providerSearchTerm}
                      onSearchChange={setProviderSearchTerm}
                      onToggleAll={() => {
                        const allAllowed = editingConfig?.allowedModelProviders === null || editingConfig?.allowedModelProviders?.length === allProviderIds.length
                        setEditingConfig((prev) => prev ? { ...prev, allowedModelProviders: allAllowed ? [] : null } : prev)
                      }}
                      isAllSelected={editingConfig?.allowedModelProviders === null || editingConfig?.allowedModelProviders?.length === allProviderIds.length}
                    />
                    <div className='grid max-h-[340px] grid-cols-3 gap-[8px] overflow-y-auto'>
                      {filteredProviders.map((providerId) => {
                        const ProviderIcon = PROVIDER_DEFINITIONS[providerId]?.icon
                        const providerName = PROVIDER_DEFINITIONS[providerId]?.name || providerId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                        return (
                          <div key={providerId} className='flex items-center gap-[8px]'>
                            <Checkbox checked={isAllowed('provider', providerId)} onCheckedChange={() => toggleItem('provider', providerId)} />
                            <div className='relative flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center'>
                              {ProviderIcon && <ProviderIcon className='!h-[16px] !w-[16px]' />}
                            </div>
                            <span className='truncate font-medium text-[13px]'>{providerName}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </ModalBody>
              </ModalTabsContent>

              <ModalTabsContent value='blocks'>
                <ModalBody className='h-[400px]'>
                  <div className='flex flex-col gap-[8px]'>
                    <FilterHeader
                      placeholder='Search blocks...'
                      searchValue={integrationSearchTerm}
                      onSearchChange={setIntegrationSearchTerm}
                      onToggleAll={() => {
                        const allAllowed = editingConfig?.allowedIntegrations === null || editingConfig?.allowedIntegrations?.length === allBlocks.length
                        setEditingConfig((prev) => prev ? { ...prev, allowedIntegrations: allAllowed ? ['start_trigger'] : null } : prev)
                      }}
                      isAllSelected={editingConfig?.allowedIntegrations === null || editingConfig?.allowedIntegrations?.length === allBlocks.length}
                    />
                    <div className='grid max-h-[340px] grid-cols-3 gap-[8px] overflow-y-auto'>
                      {filteredBlocks.map((block) => {
                        const BlockIcon = block.icon
                        return (
                          <div key={block.type} className='flex items-center gap-[8px]'>
                            <Checkbox checked={isAllowed('integration', block.type)} onCheckedChange={() => toggleItem('integration', block.type)} />
                            <div className='relative flex h-[16px] w-[16px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[4px]' style={{ background: block.bgColor }}>
                              {BlockIcon && <BlockIcon className='!h-[10px] !w-[10px] text-white' />}
                            </div>
                            <span className='truncate font-medium text-[13px]'>{block.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </ModalBody>
              </ModalTabsContent>

              <ModalTabsContent value='platform'>
                <ModalBody className='h-[400px]'>
                  <div className='flex flex-col gap-[8px]'>
                    <FilterHeader
                      placeholder='Search features...'
                      searchValue={platformSearchTerm}
                      onSearchChange={setPlatformSearchTerm}
                      onToggleAll={() => {
                        setEditingConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                ...Object.fromEntries(
                                  ALL_PLATFORM_CONFIG_KEYS.map((k) => [k, allPlatformFeaturesVisible])
                                ),
                              }
                            : prev
                        )
                      }}
                      isAllSelected={allPlatformFeaturesVisible}
                    />
                    <div className='grid max-h-[340px] grid-cols-3 gap-x-[24px] gap-y-[16px] overflow-y-auto'>
                      {Object.entries(platformCategories).map(([category, features]) => (
                        <div key={category} className='flex flex-col gap-[8px]'>
                          <span className='font-medium text-[11px] text-[var(--text-tertiary)] uppercase tracking-wide'>
                            {category}
                          </span>
                          <div className='flex flex-col gap-[8px]'>
                            {features.map((feature) => (
                              <div key={feature.id} className='flex items-center gap-[8px]'>
                                <Checkbox
                                  id={feature.id}
                                  checked={!editingConfig?.[feature.configKey as keyof PermissionGroupConfig]}
                                  onCheckedChange={(checked) =>
                                    setEditingConfig((prev) =>
                                      prev ? { ...prev, [feature.configKey]: checked !== true } : prev
                                    )
                                  }
                                />
                                <Label htmlFor={feature.id} className='cursor-pointer font-normal text-[13px]'>
                                  {feature.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ModalBody>
              </ModalTabsContent>
            </ModalTabs>
            <ModalFooter>
              <Button
                variant='default'
                onClick={() => {
                  if (hasConfigChanges) {
                    setShowUnsavedChanges(true)
                  } else {
                    setShowConfigModal(false)
                    closeConfigModal()
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant='tertiary'
                onClick={handleSaveConfig}
                disabled={updatePermissionGroup.isPending || !hasConfigChanges}
              >
                {updatePermissionGroup.isPending ? 'Saving...' : 'Save'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <UnsavedChangesModal
          open={showUnsavedChanges}
          onOpenChange={setShowUnsavedChanges}
          onDiscard={() => {
            setShowUnsavedChanges(false)
            setShowConfigModal(false)
            setEditingConfig(null)
            closeConfigModal()
          }}
          onSave={() => {
            setShowUnsavedChanges(false)
            handleSaveConfig()
          }}
          isSaving={updatePermissionGroup.isPending}
        />

        <AddMembersModal
          open={showAddMembersModal}
          onOpenChange={setShowAddMembersModal}
          availableMembers={availableMembersToAdd}
          selectedMemberIds={selectedMemberIds}
          setSelectedMemberIds={setSelectedMemberIds}
          onAddMembers={handleAddSelectedMembers}
          isAdding={bulkAddMembers.isPending}
        />
      </>
    )
  }

  return (
    <>
      <div className='flex h-full flex-col gap-[16px]'>
        <div className='flex items-center gap-[8px]'>
          <div className='flex flex-1 items-center gap-[8px] rounded-[8px] border border-[var(--border)] bg-transparent px-[8px] py-[5px] transition-colors duration-100 dark:bg-[var(--surface-4)] dark:hover:border-[var(--border-1)] dark:hover:bg-[var(--surface-5)]'>
            <Search className='h-[14px] w-[14px] flex-shrink-0 text-[var(--text-tertiary)]' strokeWidth={2} />
            <BaseInput
              placeholder='Search permission groups...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='h-auto flex-1 border-0 bg-transparent p-0 font-base leading-none placeholder:text-[var(--text-tertiary)] focus-visible:ring-0 focus-visible:ring-offset-0'
            />
          </div>
          <Button variant='tertiary' onClick={() => setShowCreateModal(true)}>
            <Plus className='mr-[6px] h-[13px] w-[13px]' />
            Create
          </Button>
        </div>

        <div className='relative min-h-0 flex-1 overflow-y-auto'>
          {filteredGroups.length === 0 && searchTerm.trim() ? (
            <div className='py-[16px] text-center text-[13px] text-[var(--text-muted)]'>
              No results found matching &ldquo;{searchTerm}&rdquo;
            </div>
          ) : permissionGroups.length === 0 ? (
            <div className='flex h-full items-center justify-center text-[13px] text-[var(--text-muted)]'>
              Click &ldquo;Create&rdquo; above to get started
            </div>
          ) : (
            <div className='flex flex-col gap-[8px]'>
              {filteredGroups.map((group) => (
                <div key={group.id} className='flex items-center justify-between'>
                  <div className='flex flex-col'>
                    <div className='flex items-center gap-[8px]'>
                      <span className='font-medium text-[14px]'>{group.name}</span>
                      {group.autoAddNewMembers && (
                        <span className='rounded-[4px] bg-[var(--surface-3)] px-[6px] py-[2px] text-[10px] text-[var(--text-muted)]'>
                          Auto-enrolls
                        </span>
                      )}
                    </div>
                    <span className='text-[13px] text-[var(--text-muted)]'>
                      {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className='flex flex-shrink-0 items-center gap-[8px]'>
                    <Button variant='default' onClick={() => setViewingGroup(group)}>
                      Details
                    </Button>
                    <Button
                      variant='ghost'
                      onClick={() => setDeletingGroup({ id: group.id, name: group.name })}
                      disabled={deletingGroupIds.has(group.id)}
                    >
                      {deletingGroupIds.has(group.id) ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      <Modal open={showCreateModal} onOpenChange={handleCloseCreateModal}>
        <ModalContent size='sm'>
          <ModalHeader>Create Permission Group</ModalHeader>
          <ModalBody>
            <div className='flex flex-col gap-[12px]'>
              <div className='flex flex-col gap-[4px]'>
                <Label>Name</Label>
                <Input
                  value={newGroupName}
                  onChange={(e) => {
                    setNewGroupName(e.target.value)
                    if (createError) setCreateError(null)
                  }}
                  placeholder='e.g., Marketing Team'
                />
              </div>
              <div className='flex flex-col gap-[4px]'>
                <Label>Description (optional)</Label>
                <Input
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder='e.g., Limited access for marketing users'
                />
              </div>
              <div className='flex items-center gap-[8px]'>
                <Checkbox
                  id='auto-add-members'
                  checked={newGroupAutoAdd}
                  onCheckedChange={(checked) => setNewGroupAutoAdd(checked === true)}
                />
                <Label htmlFor='auto-add-members' className='cursor-pointer font-normal'>
                  Auto-add new organization members
                </Label>
              </div>
              {createError && <p className='text-[12px] text-[var(--text-error)]'>{createError}</p>}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant='default' onClick={handleCloseCreateModal}>
              Cancel
            </Button>
            <Button
              variant='tertiary'
              onClick={handleCreatePermissionGroup}
              disabled={!newGroupName.trim() || createPermissionGroup.isPending}
            >
              {createPermissionGroup.isPending ? 'Creating...' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deletingGroup} onOpenChange={() => setDeletingGroup(null)}>
        <ModalContent size='sm'>
          <ModalHeader>Delete Permission Group</ModalHeader>
          <ModalBody>
            <p className='text-[12px] text-[var(--text-secondary)]'>
              Are you sure you want to delete{' '}
              <span className='font-medium text-[var(--text-primary)]'>{deletingGroup?.name}</span>?
              All members will be removed from this group.{' '}
              <span className='text-[var(--text-error)]'>This action cannot be undone.</span>
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant='default' onClick={() => setDeletingGroup(null)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDelete} disabled={deletePermissionGroup.isPending}>
              {deletePermissionGroup.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
