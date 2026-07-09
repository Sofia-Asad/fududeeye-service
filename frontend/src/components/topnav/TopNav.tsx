import type { Role } from '@/types/auth'
import NotificationsMenu, { type NotificationItem } from '@/components/topnav/NotificationsMenu'
import UserProfileMenu from '@/components/topnav/UserProfileMenu'
import VisitMarketplaceButton from '@/components/topnav/VisitMarketplaceButton'
import WeatherWidget from '@/components/topnav/WeatherWidget'

/** Desktop top navigation bar — Visit Marketplace, Notifications, Weather, User Profile, in that order. */
export default function TopNav({
  notifications,
  fullName,
  role,
  userId,
  onLogout,
}: {
  notifications: NotificationItem[]
  fullName: string
  role?: Role
  userId?: number
  onLogout: () => void
}) {
  return (
    <div className="desktop-topnav">
      <VisitMarketplaceButton />
      <NotificationsMenu items={notifications} />
      <WeatherWidget />
      <UserProfileMenu fullName={fullName} role={role} userId={userId} onLogout={onLogout} />
    </div>
  )
}
