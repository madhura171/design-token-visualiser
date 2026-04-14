import { useState } from 'react'

export function usePdfDownload() {
  const [downloading, setDownloading] = useState(false)

  const download = (_elementId: string, _filename = 'design-tokens.pdf') => {
    setDownloading(true)
    // Use the browser's native print dialog — the user can save as PDF from there.
    // A short delay lets any pending React state flush before the dialog opens.
    setTimeout(() => {
      window.print()
      setDownloading(false)
    }, 100)
  }

  return { download, downloading }
}
