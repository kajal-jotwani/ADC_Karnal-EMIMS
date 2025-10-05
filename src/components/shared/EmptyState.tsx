import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <div className={`text-center py-12 ${className}`}>
            <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" aria-hidden="true"/>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
            {action && (
                <button type="button" onClick={action.onClick} className="btn btn-primary">
                    {action.label}
                </button>
            )}

        </div>
    );
};

export default EmptyState;