"use client"

import { getErrorMessage } from "@/lib/error-utils"

import { useEffect, useState } from "react"
import { format, isPast, isFuture, isWithinInterval, addDays } from "date-fns"
import { Check, Clock, Lock, CalendarDays } from "lucide-react"
import { workflowService } from "@/lib/services/workflow"
import type { StageDeadline, DelegationProgress, WorkflowStage, StageStatus } from "@/lib/types"

interface TimelineStage {
  stage: WorkflowStage
  label: string
  description: string
  deadline?: string
  status: StageStatus
}

const STAGE_CONFIG: Record<WorkflowStage, { label: string; description: string }> = {
  PRE_REGISTRATION: {
    label: "Pre-registration",
    description: "Confirm participation and delegation size"
  },
  PAYMENT: {
    label: "Payment",
    description: "Submit participation fee payment"
  },
  PARTICIPANTS: {
    label: "Participant Details",
    description: "Register all delegation members"
  },
  TRAVEL: {
    label: "Travel Information",
    description: "Provide arrival and departure details"
  },
  INVITATIONS: {
    label: "Invitation Letters",
    description: "Download official invitation letters"
  }
}

const STAGE_ORDER: WorkflowStage[] = [
  'PRE_REGISTRATION',
  'PAYMENT',
  'PARTICIPANTS',
  'TRAVEL',
  'INVITATIONS'
]

export function Timeline() {
  const [stages, setStages] = useState<TimelineStage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStage, setCurrentStage] = useState<WorkflowStage | null>(null)

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true)
      const [deadlines, progress] = await Promise.all([
        workflowService.getStageDeadlines(),
        workflowService.getDelegationProgress()
      ])

      // Create a map of deadlines by stage
      const deadlineMap = new Map<WorkflowStage, string>()
      deadlines.forEach(d => {
        deadlineMap.set(d.stage, d.deadline_at)
      })

      // Create a map of statuses by stage from progress
      const statusMap = new Map<WorkflowStage, StageStatus>()
      progress.stages.forEach(s => {
        statusMap.set(s.stage, s.status)
      })

      // Build timeline stages
      const timelineStages: TimelineStage[] = STAGE_ORDER.map(stage => ({
        stage,
        label: STAGE_CONFIG[stage].label,
        description: STAGE_CONFIG[stage].description,
        deadline: deadlineMap.get(stage),
        status: statusMap.get(stage) || 'LOCKED'
      }))

      setStages(timelineStages)
      setCurrentStage(progress.current_stage)
      setError(null)
    } catch (err: unknown) {
      console.error("Failed to fetch timeline data:", err)
      setError(getErrorMessage(err, "Failed to load timeline"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Refresh when window regains focus
    const handleFocus = () => fetchData(false)
    window.addEventListener('focus', handleFocus)

    // Also refresh every 30 seconds
    const interval = setInterval(() => fetchData(false), 30000)

    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        {error}
      </div>
    )
  }

  const getStatusIcon = (stage: TimelineStage, isCurrent: boolean) => {
    if (stage.status === 'COMPLETED') {
      return <Check className="w-4 h-4 text-white" />
    }
    if (stage.status === 'LOCKED') {
      return <Lock className="w-3.5 h-3.5 text-gray-400" />
    }
    if (isCurrent) {
      return <Clock className="w-4 h-4 text-white" />
    }
    return <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
  }

  const getStatusStyles = (stage: TimelineStage, isCurrent: boolean) => {
    if (stage.status === 'COMPLETED') {
      return "bg-[#00795d] border-[#00795d]"
    }
    if (isCurrent) {
      return "bg-[#2f3090] border-[#2f3090] ring-4 ring-[#2f3090]/20"
    }
    if (stage.status === 'LOCKED') {
      return "bg-gray-100 border-gray-200"
    }
    return "bg-white border-gray-300"
  }

  const getLineStyles = (index: number, stage: TimelineStage, nextStage?: TimelineStage) => {
    if (stage.status === 'COMPLETED') {
      return "bg-[#00795d]"
    }
    return "bg-gray-200"
  }

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null
    const date = new Date(deadline)
    return format(date, "MMM d, yyyy")
  }

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null
    const date = new Date(deadline)
    const now = new Date()

    if (isPast(date)) {
      return { text: "Ended", className: "text-gray-400" }
    }

    // Check if within 7 days
    if (isWithinInterval(now, { start: now, end: addDays(now, 7) }) && isFuture(date) && date <= addDays(now, 7)) {
      return { text: "Ending soon", className: "text-orange-500 font-medium" }
    }

    return { text: "Open until", className: "text-gray-500" }
  }

  return (
    <div className="relative">
      {/* Title with icon */}
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-4 h-4 text-[#2f3090]" />
        <h3 className="font-semibold text-gray-800">Important Dates</h3>
      </div>

      <div className="space-y-0">
        {stages.map((stage, index) => {
          const isCurrent = stage.stage === currentStage
          const deadlineStatus = getDeadlineStatus(stage.deadline)
          const isLast = index === stages.length - 1

          return (
            <div key={stage.stage} className="relative">
              <div className="flex items-start gap-3">
                {/* Timeline node */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${getStatusStyles(stage, isCurrent)}`}
                  >
                    {getStatusIcon(stage, isCurrent)}
                  </div>
                  {/* Connector line */}
                  {!isLast && (
                    <div
                      className={`w-0.5 h-12 ${getLineStyles(index, stage, stages[index + 1])}`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-4 ${isLast ? '' : 'pb-6'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${isCurrent ? 'text-[#2f3090]' : stage.status === 'COMPLETED' ? 'text-[#00795d]' : 'text-gray-700'}`}>
                      {stage.label}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-[#2f3090]/10 text-[#2f3090] rounded-full">
                        Current
                      </span>
                    )}
                    {stage.status === 'COMPLETED' && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-[#00795d]/10 text-[#00795d] rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{stage.description}</p>
                  {stage.deadline && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                      <span className={deadlineStatus?.className}>{deadlineStatus?.text}</span>
                      <span className="font-medium text-gray-700">{formatDeadline(stage.deadline)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Overall Progress</span>
          <span className="font-medium text-gray-700">
            {stages.filter(s => s.status === 'COMPLETED').length} of {stages.length} completed
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#00795d] to-[#2f3090] rounded-full transition-all duration-500"
            style={{ width: `${(stages.filter(s => s.status === 'COMPLETED').length / stages.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
