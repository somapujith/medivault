import React from 'react';
import './Skeleton.css';

const Skeleton = ({ className = '', style = {}, width, height, variant = 'text' }) => {
    const styles = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
        ...style,
    };

    return (
        <div
            className={`skeleton skeleton-${variant} ${className}`}
            style={styles}
        />
    );
};

export default Skeleton;
