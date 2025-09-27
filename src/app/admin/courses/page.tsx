import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"

export default function CoursesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Your Courses
          </h1>
          <p className="text-slate-400 mt-1">Manage and create your educational content</p>
        </div>
        <Link 
          href="/admin/courses/create"
          className={buttonVariants({
            variant: "ocean",
            size: "lg",
            className: "shadow-lg hover:shadow-xl shadow-cyan-500/25"
          })}
        >
          Create New Course
        </Link>
      </div>

      <div className="grid gap-6">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No courses yet</h2>
          <p className="text-slate-400 mb-6">Start building your educational content by creating your first course</p>
          <Link 
            href="/admin/courses/create"
            className={buttonVariants({
              variant: "gradient",
              size: "lg"
            })}
          >
            Create Your First Course
          </Link>
        </div>
      </div>
    </div>
  )
}
