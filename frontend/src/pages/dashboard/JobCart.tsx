import { motion } from "framer-motion"
import { MapPin, Building2, Bookmark, ExternalLink, TrendingUp, AlertCircle, Sparkles, Globe, Clock } from "lucide-react"
import { cn } from "../../utils/utils"

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: "Remote" | "Hybrid" | "On-site"
  matchPercentage: number
  probabilityScore: "High" | "Medium" | "Low"
  missingSkills: string[]
  aiRecommendation: string
  postedAt: string
  salary?: string
}

interface JobCardProps {
  job: Job
  index?: number
}

function JobCart({ job, index = 0 }: JobCardProps) {
  const getProbabilityColor = (score: string) => {
    switch (score) {
      case "High": return "text-green-600 bg-green-100"
      case "Medium": return "text-amber-600 bg-amber-100"
      case "Low": return "text-red-600 bg-red-100"
      default: return "text-gray-500 bg-gray-100"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#FF4500]/20 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg truncate group-hover:text-[#FF4500] transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <Building2 className="w-4 h-4 shrink-0" />
            <span className="truncate">{job.company}</span>
          </div>
        </div>

        {/* Match Badge */}
        <div className="shrink-0 text-center">
          <div className={cn(
            "w-14 h-14 rounded-xl flex flex-col items-center justify-center",
            job.matchPercentage >= 80 ? "bg-green-100" :
            job.matchPercentage >= 60 ? "bg-amber-100" : "bg-red-100"
          )}>
            <span className={cn(
              "text-lg font-bold",
              job.matchPercentage >= 80 ? "text-green-600" :
              job.matchPercentage >= 60 ? "text-amber-600" : "text-red-600"
            )}>
              {job.matchPercentage}%
            </span>
            <span className="text-[10px] text-gray-500">Match</span>
          </div>
        </div>
      </div>

      {/* Location & Type */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
          <MapPin className="w-3 h-3" />
          {job.location}
        </span>
        <span className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs",
          job.type === "Remote" ? "bg-blue-100 text-blue-600" :
          job.type === "Hybrid" ? "bg-purple-100 text-purple-600" :
          "bg-gray-100 text-gray-600"
        )}>
          <Globe className="w-3 h-3" />
          {job.type}
        </span>
        <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs", getProbabilityColor(job.probabilityScore))}>
          <TrendingUp className="w-3 h-3" />
          {job.probabilityScore} Probability
        </span>
      </div>

      {/* Missing Skills */}
      {job.missingSkills.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Missing Skills:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {job.missingSkills.map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-md">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendation */}
      <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 mb-4">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#FF4500] shrink-0 mt-0.5" />
          <p className="text-sm text-gray-900 leading-relaxed">
            <span className="font-semibold text-[#FF4500]">AI Insight: </span>
            {job.aiRecommendation}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{job.postedAt}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF4500] hover:bg-[#e03e00] text-white text-sm rounded-lg transition-colors">
            Apply
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default JobCart
