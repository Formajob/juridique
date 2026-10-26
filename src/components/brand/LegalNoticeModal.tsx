import * as React from "react"

// Store for legal notice acceptance
let legalNoticeAccepted = false

export function subscribeLegalNotice(callback: () => void) {
  // In a real implementation, this would subscribe to storage events
  return () => {}
}

export function getLegalNoticeAcceptedSnapshot() {
  return legalNoticeAccepted
}

export function getLegalNoticeAcceptedServerSnapshot() {
  return false
}

export function rememberLegalNoticeAccepted() {
  legalNoticeAccepted = true
}

export default function LegalNoticeModal({ 
  isOpen, 
  onAccept 
}: { 
  isOpen: boolean
  onAccept: () => void 
}) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <h2 className="text-lg font-bold mb-4">Mentions légales</h2>
        <p className="text-sm text-gray-600 mb-4">
          Veuillez accepter les mentions légales pour continuer.
        </p>
        <button
          onClick={onAccept}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Accepter
        </button>
      </div>
    </div>
  )
}
