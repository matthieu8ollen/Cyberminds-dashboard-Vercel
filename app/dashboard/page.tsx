import { SidebarNavigation } from "@/components/sidebar-navigation"
import { StickyBanner } from "@/components/ui/sticky-banner"
import { InspirationFeed } from "@/components/inspiration-feed"
import { FeatureCards } from "@/components/feature-cards"
import { WeeklySchedule } from "@/components/weekly-schedule"
import { WhatsNew } from "@/components/whats-new"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <SidebarNavigation />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <StickyBanner />

        <div className="flex-1 overflow-auto">
          <div className="flex flex-col gap-4 p-4 min-w-0">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Dashboard
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="min-w-0">
              <h1 className="text-3xl font-medium tracking-tight text-balance font-sans text-emerald-800 truncate">
                Writer Suite Dashboard
              </h1>
              <p className="text-gray-600 text-pretty">Good morning! Ready to create amazing content today?</p>
            </div>

            <div className="space-y-4 min-w-0">
              <InspirationFeed />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0">
                <div className="lg:col-span-2 min-w-0">
                  <FeatureCards />
                  <div className="mt-6">
                    <WhatsNew />
                  </div>
                </div>

                <WeeklySchedule />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
