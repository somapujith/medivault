import React from 'react';
import { Search } from 'lucide-react';
import './Common.css';

const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => {
    return (
        <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default SearchInput;
