interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
