import { useState, useRef, useEffect } from 'react'
import { Save, X, Bookmark, MoreVertical, Pencil, RefreshCw, Trash2 } from 'lucide-react'
import { Label } from '../atoms/Typography'
import type { FilterPreset, SLAFilterState } from '../../../../shared/filter-types'

interface FilterPresetBarProps {
  presets: FilterPreset[]
  onLoad: (presetId: string) => void
  onSave: (name: string) => Promise<void>
  onDelete: (presetId: string) => Promise<void>
  onUpdate?: (
    presetId: string,
    updates: { name?: string; filters?: SLAFilterState }
  ) => Promise<void>
  currentFilters?: SLAFilterState
}

export function FilterPresetBar({
  presets,
  onLoad,
  onSave,
  onDelete,
  onUpdate,
  currentFilters
}: FilterPresetBarProps): JSX.Element {
  const [saving, setSaving] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameError, setRenameError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{
    presetId: string
    type: 'delete' | 'update'
  } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    if (menuOpenId) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpenId])

  const handleSave = async (): Promise<void> => {
    const trimmed = presetName.trim()
    if (!trimmed) {
      setError('Name cannot be empty')
      return
    }
    if (trimmed.length > 50) {
      setError('Name must be 50 characters or less')
      return
    }
    setError(null)
    try {
      await onSave(trimmed)
      setPresetName('')
      setSaving(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preset')
    }
  }

  const handleRename = async (presetId: string): Promise<void> => {
    const trimmed = renameValue.trim()
    if (!trimmed) {
      setRenameError('Name cannot be empty')
      return
    }
    if (trimmed.length > 50) {
      setRenameError('Name must be 50 characters or less')
      return
    }
    setRenameError(null)
    try {
      await onUpdate?.(presetId, { name: trimmed })
      setRenamingId(null)
      setRenameValue('')
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : 'Failed to rename')
    }
  }

  const handleConfirmAction = async (): Promise<void> => {
    if (!confirmAction) return
    try {
      if (confirmAction.type === 'delete') {
        await onDelete(confirmAction.presetId)
      } else if (confirmAction.type === 'update' && currentFilters) {
        await onUpdate?.(confirmAction.presetId, { filters: currentFilters })
      }
    } catch (err) {
      console.error(`Failed to ${confirmAction.type} preset:`, err)
    }
    setConfirmAction(null)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Preset label */}
      {(presets.length > 0 || saving) && (
        <div className="flex items-center gap-1.5 text-brand-text-sec">
          <Bookmark size={12} />
          <Label className="text-xs uppercase tracking-wider">Quick Filters</Label>
        </div>
      )}

      {/* Preset chips */}
      {presets.map((preset) => (
        <div key={preset.id} className="group relative inline-flex items-center">
          {renamingId === preset.id ? (
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => {
                  setRenameValue(e.target.value)
                  setRenameError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename(preset.id)
                  if (e.key === 'Escape') {
                    setRenamingId(null)
                    setRenameValue('')
                    setRenameError(null)
                  }
                }}
                maxLength={50}
                autoFocus
                className="px-2 py-1 rounded-md text-xs bg-brand-card/80 border border-brand-purple/40
                  text-brand-text-pri focus:outline-none focus:border-brand-cyan/40 w-36"
              />
              <button
                type="button"
                onClick={() => handleRename(preset.id)}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium
                  bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 transition-colors"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => {
                  setRenamingId(null)
                  setRenameValue('')
                  setRenameError(null)
                }}
                className="p-0.5 rounded text-brand-text-sec hover:text-brand-text-pri transition-colors"
              >
                <X size={12} />
              </button>
              {renameError && (
                <span className="text-[10px] text-red-400">{renameError}</span>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onLoad(preset.id)}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border
                  bg-brand-purple/10 text-brand-purple border-brand-purple/30
                  hover:bg-brand-purple/20 hover:border-brand-purple/50
                  transition-all duration-150"
              >
                {preset.name}
              </button>

              {/* Confirmation inline */}
              {confirmAction?.presetId === preset.id ? (
                <div className="ml-1 flex items-center gap-1">
                  <span className="text-[10px] text-brand-text-sec">
                    {confirmAction.type === 'delete' ? 'Delete?' : 'Update?'}
                  </span>
                  <button
                    type="button"
                    onClick={handleConfirmAction}
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400
                      hover:bg-red-500/30 border border-red-500/30 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    className="px-1.5 py-0.5 rounded text-[10px] font-medium text-brand-text-sec
                      hover:text-brand-text-pri transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : (
                /* Kebab menu button */
                <div className="relative" ref={menuOpenId === preset.id ? menuRef : null}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpenId(menuOpenId === preset.id ? null : preset.id)
                    }}
                    className="ml-0.5 opacity-0 group-hover:opacity-100 p-0.5 rounded
                      text-brand-text-sec hover:text-brand-text-pri transition-all duration-150"
                  >
                    <MoreVertical size={12} />
                  </button>

                  {/* Dropdown menu */}
                  {menuOpenId === preset.id && (
                    <div className="absolute top-full right-0 mt-1 z-50 w-44
                      bg-brand-card border border-white/10 rounded-lg shadow-lg py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingId(preset.id)
                          setRenameValue(preset.name)
                          setMenuOpenId(null)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-brand-text-sec
                          hover:text-brand-text-pri hover:bg-white/5 transition-colors"
                      >
                        <Pencil size={12} />
                        Rename
                      </button>
                      {onUpdate && currentFilters && (
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmAction({ presetId: preset.id, type: 'update' })
                            setMenuOpenId(null)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-brand-text-sec
                            hover:text-brand-text-pri hover:bg-white/5 transition-colors"
                        >
                          <RefreshCw size={12} />
                          Update with current filters
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmAction({ presetId: preset.id, type: 'delete' })
                          setMenuOpenId(null)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400
                          hover:text-red-300 hover:bg-white/5 transition-colors"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Save button / form */}
      {saving ? (
        <div className="inline-flex items-center gap-1.5">
          <input
            type="text"
            value={presetName}
            onChange={(e) => {
              setPresetName(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') {
                setSaving(false)
                setPresetName('')
                setError(null)
              }
            }}
            placeholder="Preset name..."
            maxLength={50}
            autoFocus
            className="px-2 py-1 rounded-md text-xs bg-brand-card/80 border border-white/10
              text-brand-text-pri placeholder:text-brand-text-sec/50
              focus:outline-none focus:border-brand-cyan/40 w-40"
          />
          <button
            type="button"
            onClick={handleSave}
            className="px-2 py-1 rounded-md text-xs font-medium
              bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30
              hover:bg-brand-cyan/30 transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setSaving(false)
              setPresetName('')
              setError(null)
            }}
            className="p-1 rounded text-brand-text-sec hover:text-brand-text-pri transition-colors"
          >
            <X size={14} />
          </button>
          {error && (
            <span className="text-[10px] text-red-400">{error}</span>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setSaving(true)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
            text-brand-text-sec hover:text-brand-cyan border border-dashed border-white/10
            hover:border-brand-cyan/30 transition-all duration-150"
          title="Save current filters as preset"
        >
          <Save size={12} />
          Save Filter
        </button>
      )}
    </div>
  )
}
