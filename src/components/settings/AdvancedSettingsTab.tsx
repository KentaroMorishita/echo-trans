import React from "react"

export const AdvancedSettingsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="text-center text-gray-500 py-8">
        <p className="text-lg">Advanced Settings</p>
        <p className="text-sm">Future features will be added here</p>
      </div>
      
      {/* 将来的な拡張用 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Coming Soon</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Keyboard shortcuts</li>
          <li>• Custom translation prompts</li>
          <li>• Export preferences</li>
          <li>• Performance optimization</li>
        </ul>
      </div>
    </div>
  )
}