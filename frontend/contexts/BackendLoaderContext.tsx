import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import BackendLoader from '../components/BackendLoader';

// Types matches BackendLoaderProps but slightly modified for trigger
interface LoaderOptions {
    title?: string;
    subtitle?: string;
    successMessage?: string;
    errorMessage?: string;
    endpoint?: string;
    method?: string;
    serverHost?: string;
    isSecure?: boolean;
    completeDelay?: number;
}

interface LoaderState extends LoaderOptions {
    isOpen: boolean;
    status: 'loading' | 'success' | 'error';
    actualLatency?: number;
    actualStatusCode?: number;
    responseData?: Record<string, unknown>;
}

interface BackendLoaderContextType {
    showLoader: (options: LoaderOptions) => void;
    updateLoader: (updates: Partial<LoaderState>) => void;
    hideLoader: () => void;
}

const BackendLoaderContext = createContext<BackendLoaderContextType | undefined>(undefined);

export const BackendLoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<LoaderState>({
        isOpen: false,
        status: 'loading'
    });

    // Only used for exit animation handling
    const [renderLoader, setRenderLoader] = useState(false);

    const showLoader = useCallback((options: LoaderOptions) => {
        setRenderLoader(true);
        setState({
            ...options,
            isOpen: true,
            status: 'loading',
            actualLatency: undefined,
            actualStatusCode: undefined,
        });
    }, []);

    const updateLoader = useCallback((updates: Partial<LoaderState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const hideLoader = useCallback(() => {
        // Trigger exit animation in BackendLoader (handled via status or internal logic)
        // But since BackendLoader handles its own exit phase when we call onComplete/onDismiss logic...
        // We actually just want to close it. 
        // Realistically, BackendLoader expects to drive the exit.

        // For simplicity with current BackendLoader architecture:
        // We let the BackendLoader call 'onComplete' which will then trigger our cleanup
    }, []);

    // This is called by BackendLoader when its exit animation finishes
    const handleAnimationComplete = useCallback(() => {
        setRenderLoader(false);
        setState(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <BackendLoaderContext.Provider value={{ showLoader, updateLoader, hideLoader }}>
            {children}
            {renderLoader && (
                // Use Portal to ensure it is ALWAYS on top, even outside root if needed
                <BackendLoader
                    status={state.status}
                    title={state.title}
                    subtitle={state.subtitle}
                    successMessage={state.successMessage}
                    errorMessage={state.errorMessage}
                    endpoint={state.endpoint}
                    method={state.method}
                    serverHost={state.serverHost}
                    isSecure={state.isSecure}
                    completeDelay={state.completeDelay}
                    actualLatency={state.actualLatency}
                    actualStatusCode={state.actualStatusCode}
                    responseData={state.responseData}
                    // When animation is fully done
                    onComplete={handleAnimationComplete}
                    // If error dismissed
                    onDismiss={() => setState(prev => ({ ...prev, status: 'error' }))} // simplified
                />
            )}
        </BackendLoaderContext.Provider>
    );
};

export const useBackendLoader = () => {
    const context = useContext(BackendLoaderContext);
    if (!context) {
        throw new Error('useBackendLoader must be used within a BackendLoaderProvider');
    }
    return context;
};
