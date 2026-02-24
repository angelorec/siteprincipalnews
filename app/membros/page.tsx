import { MemberDashboard } from "@/components/member-dashboard"
import { AuthGuard } from "@/components/auth-guard"

export default function MembersPage() {
  return (
    <AuthGuard>
      <MemberDashboard />
    </AuthGuard>
  )
}
