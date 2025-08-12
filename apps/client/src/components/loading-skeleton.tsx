import React from 'react';

export default function LoadingSkeleton() {
    return (
        <div style={{
            backgroundColor: '#1a1b1e',
            minHeight: '100vh',
            color: '#c1c2c5'
        }}>
            {/* Header skeleton */}
            <div style={{
                height: '60px',
                backgroundColor: '#25262b',
                borderBottom: '1px solid #373a40',
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px'
            }}>
                <div style={{
                    width: '120px',
                    height: '24px',
                    backgroundColor: '#495057',
                    borderRadius: '4px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
            </div>

            {/* Content skeleton */}
            <div style={{
                padding: '24px',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <div style={{
                    width: '60%',
                    height: '32px',
                    backgroundColor: '#495057',
                    borderRadius: '4px',
                    marginBottom: '16px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
                <div style={{
                    width: '100%',
                    height: '20px',
                    backgroundColor: '#495057',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
                <div style={{
                    width: '80%',
                    height: '20px',
                    backgroundColor: '#495057',
                    borderRadius: '4px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
}
