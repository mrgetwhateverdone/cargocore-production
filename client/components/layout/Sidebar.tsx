import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  GitBranch,
  ChartNoAxesColumn,
  Package,
  Archive,
  Warehouse,
  DollarSign,
  Globe,
  FileText,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  className?: string
  mobile?: boolean
}

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Workflows', icon: GitBranch, href: '/workflows' },
  { name: 'Analytics', icon: ChartNoAxesColumn, href: '/analytics' },
  { name: 'Orders', icon: Package, href: '/orders' },
  { name: 'Inventory', icon: Archive, href: '/inventory' },
  { name: 'Warehouses', icon: Warehouse, href: '/warehouses' },
  { name: 'Cost Management', icon: DollarSign, href: '/cost-management' },
  { name: 'Economic Intelligence', icon: Globe, href: '/intelligence' },
  { name: 'Generate Report', icon: FileText, href: '/reports' },
  { name: 'AI Assistant', icon: MessageSquare, href: '/assistant' },
  { name: 'Settings', icon: Settings, href: '/settings' }
]

export function Sidebar({ collapsed = false, onToggle, className, mobile = false }: SidebarProps) {
  const location = useLocation()

  return (
    <div className={cn(
      'bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300',
      collapsed && !mobile ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header Section */}
      <div className="h-16 px-4 border-b border-gray-200 flex flex-col justify-center relative">
        {!collapsed || mobile ? (
          <>
            <h1 className="text-xl font-bold text-blue-600">CargoCore</h1>
            <p className="text-xs text-gray-500">3PL Operations Platform</p>
          </>
        ) : (
          <h1 className="text-xl font-bold text-blue-600 text-center">CC</h1>
        )}
        
        {/* Collapse Toggle Button (Desktop only) */}
        {!mobile && onToggle && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50"
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3 text-gray-600" />
            ) : (
              <ChevronLeft className="h-3 w-3 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          // This part of the code handles active state for dashboard and root routes
          const isActive = location.pathname === item.href || 
                          (item.href === '/dashboard' && location.pathname === '/')
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100',
                collapsed && !mobile && 'justify-center px-2'
              )}
            >
              <Icon className={cn(
                'h-5 w-5',
                !collapsed || mobile ? 'mr-3' : 'mr-0'
              )} />
              {(!collapsed || mobile) && (
                <span>{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}