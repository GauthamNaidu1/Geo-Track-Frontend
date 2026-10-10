import { useState } from 'react'

interface UserManualProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserManual({ isOpen, onClose }: UserManualProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'worklogs'>('attendance')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>👋</span> Welcome to Geo-Track!
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Your comprehensive guide to using the platform.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'attendance'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            📍 Geofenced Attendance
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'leaves'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            🏖️ Leave Management
          </button>
          <button
            onClick={() => setActiveTab('worklogs')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'worklogs'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            📝 Work Logs
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 text-lg mb-2">How Geofencing Works</h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-400 leading-relaxed">
                  Geo-Track uses your device's GPS to ensure you are physically present at your designated office location before allowing you to check in.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">1</div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Enable Location Services</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">When you visit the Attendance tab, your browser will ask for location permissions. You must click <strong>Allow</strong>.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">2</div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Select Your Office</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Choose the office you are currently reporting to from the dropdown list.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">3</div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Check In</h4>
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Click the "Check In" button. The system will verify that your GPS coordinates fall within the required radius of the office (usually 50 meters).</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 flex gap-3 items-start">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-300 text-sm">Troubleshooting</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">If your check-in fails, ensure you are connected to Wi-Fi (which improves GPS accuracy indoors) and try refreshing your browser location.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="text-2xl mb-2">📝</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Applying for Leave</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                    Navigate to the <strong>My Leaves</strong> tab and click "Request Leave". You can choose from various leave types configured by your organization (e.g., Sick, Casual, Annual).
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="text-2xl mb-2">⏳</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Approval Process</h3>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                    Once submitted, your request is marked as <strong>Pending</strong>. Your manager will receive a notification to review it. You will be notified once it is approved or rejected.
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 mt-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Pro Tip:</strong> You can track your remaining leave balances directly from the My Leaves dashboard!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'worklogs' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Work Summaries</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Work Logs help you and your manager track your daily productivity and identify any roadblocks early.
              </p>
              
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-green-500">✓</span> What to include
                  </h4>
                  <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-slate-400 list-disc list-inside ml-2">
                    <li>Key tasks completed today</li>
                    <li>Meetings attended and outcomes</li>
                    <li>Progress on long-term projects</li>
                  </ul>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-red-500">🚫</span> Highlighting Blockers
                  </h4>
                  <p className="mt-2 text-sm text-gray-600 dark:text-slate-400 ml-6">
                    Use the "Blockers" field if you are waiting on someone else, missing permissions, or experiencing technical issues. This immediately flags the issue to your manager.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-right">
          <button
            onClick={onClose}
            className="btn btn-primary w-full sm:w-auto px-8"
          >
            I understand, let's go!
          </button>
        </div>
      </div>
    </div>
  )
}
