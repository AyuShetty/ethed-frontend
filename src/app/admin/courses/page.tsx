import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive"
import { DataTable } from "@/components/sidebar/data-table"
import { SectionCards } from "@/components/sidebar/section-cards"
import { SiteHeader } from "@/components/sidebar/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import Link from "next/link"

export default function CoursesPage() {
  return (
<>
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">Your Courses</h1>
  <Link href="/admin/courses/create" className="btn btn-primary">
    Create New Course
  </Link>
</div>

<div>
  <h1>Here you will see all of your courses</h1>
</div>
              </>
  )
}
