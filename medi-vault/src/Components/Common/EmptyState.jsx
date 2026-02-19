import React from 'react';
import { FileQuestion } from 'lucide-react';
import './Common.css';

const EmptyState = ({ title = 'No records found', description = 'Try adjusting your search or filters.', icon: Icon = FileQuestion, action }) => {
    return (
        <div className="empty-state-container">
            <div className="empty-state-icon-wrapper">
                <Icon className="empty-state-icon" />
            </div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-desc">{description}</p>
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
};


export default EmptyState;
