import React from 'react';
import { Search, X } from 'lucide-react';
import './Common.css';

const SearchInput = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
    return (
        <div className={`search-input-wrapper ${className}`}>
            <Search className="search-icon" />
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <button
                    className="search-clear-btn"
                    onClick={() => onChange('')}
                    aria-label="Clear search"
                    type="button"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
};

export default SearchInput;
