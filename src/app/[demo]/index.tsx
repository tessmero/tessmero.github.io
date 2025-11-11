'use client'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ClientDemoPage() {
  const params = useParams()
  const demo = params?.demo

  useEffect(() => {
    // pass url params to iframe (used for collide-o-scope)
    function handleLoad() {
      const iframe = document.getElementById('gameFrame') as HTMLIFrameElement
      const parentParams = window.location.search
      const iframeSrc = `/iframe/${demo}/index.html`
      if (parentParams) {
        iframe.src = iframeSrc + (iframeSrc.includes('?') ? '&' : '?') + parentParams.substring(1)
      }
      else {
        iframe.src = iframeSrc
      }
    }

    // allow js inside iframe to update url params (used for collide-o-scope)
    function handleMessage(event: MessageEvent) {
      if (event.data.type === 'updateUrlSuffix') {
        window.history.pushState({}, '', event.data.suffix)
      }
    }

    handleLoad()
    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [demo])

  return (
    <iframe
      id="gameFrame"
      className="w-full h-full border-none"
      allowFullScreen
    />
  )
}
