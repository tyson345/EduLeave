interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4">
        {icon}
      </div>
      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-gray-500 dark:text-gray-400">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}
