import { useState } from 'react'
import { FolderOpen, CheckCircle } from 'lucide-react'
import { Button, Card, H3, Text } from '@design-system'

interface StorageStepProps {
  storagePath: string
  onPathSelected: (path: string) => void
}

export function StorageStep({ storagePath, onPathSelected }: StorageStepProps): JSX.Element {
  const [selecting, setSelecting] = useState(false)

  const handleSelect = async (): Promise<void> => {
    setSelecting(true)
    try {
      const dir = await window.api.selectDirectory()
      if (dir) {
        await window.api.setStorageRoot(dir)
        onPathSelected(dir)
      }
    } finally {
      setSelecting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <H3>Storage Location</H3>
        <Text className="mt-1">
          Choose a directory where AGMS will store all project data, configurations, and cached
          reports.
        </Text>
      </div>

      <Card className="flex items-center gap-4">
        <div className="flex-1">
          {storagePath ? (
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-400" />
              <span className="text-sm text-brand-text-pri font-mono">{storagePath}</span>
            </div>
          ) : (
            <span className="text-sm text-brand-text-sec">No directory selected</span>
          )}
        </div>
        <Button
          variant="glass"
          onClick={handleSelect}
          loading={selecting}
          icon={<FolderOpen size={16} />}
        >
          Browse
        </Button>
      </Card>
    </div>
  )
}
