'use client';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: 'project' | 'search';
}

export default function EmptyState({ title, description, icon = 'project' }: EmptyStateProps) {
    const renderIcon = () => {
        if (icon === 'search') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            );
        }
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        );
    };

    return (
        <div className="text-center py-12">
            {renderIcon()}
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    );
}