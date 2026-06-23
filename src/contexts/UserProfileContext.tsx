import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { isAuthenticated } from '../services/auth';
import { userService } from '../services/userService';
import { resolveMediaUrl } from '../utils/mediaUrl';

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    code: string;
    avatar: string | null;
    address: string;
    role: string;
}

interface UserProfileContextValue {
    profile: UserProfile;
    isProfileLoaded: boolean;
    refreshProfile: () => Promise<void>;
    setAvatar: (url: string | null) => void;
    updateProfile: (partial: Partial<UserProfile>) => void;
    clearProfile: () => void;
}

const EMPTY_PROFILE: UserProfile = {
    id: '',
    fullName: '',
    email: '',
    phone: '',
    code: '',
    avatar: null,
    address: '',
    role: '',
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

function mapUserToProfile(user: {
    id?: string | number;
    fullName?: string;
    email?: string;
    phone?: string;
    code?: string;
    avatar?: string | null;
    address?: string;
    role?: string;
}): UserProfile {
    return {
        id: user.id != null ? String(user.id) : '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        code: user.code || '',
        avatar: resolveMediaUrl(user.avatar),
        address: user.address || '',
        role: user.role?.toLowerCase() || 'customer',
    };
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
    const [isProfileLoaded, setIsProfileLoaded] = useState(false);

    const clearProfile = useCallback(() => {
        setProfile(EMPTY_PROFILE);
        setIsProfileLoaded(false);
    }, []);

    const refreshProfile = useCallback(async () => {
        if (!isAuthenticated()) {
            clearProfile();
            return;
        }

        try {
            const res = await userService.getMe();
            if (!res?.data) return;
            setProfile(mapUserToProfile(res.data));
            setIsProfileLoaded(true);
        } catch {
            // Giữ profile hiện tại nếu fetch thất bại
        }
    }, [clearProfile]);

    const setAvatar = useCallback((url: string | null) => {
        setProfile((current) => ({
            ...current,
            avatar: resolveMediaUrl(url),
        }));
    }, []);

    const updateProfile = useCallback((partial: Partial<UserProfile>) => {
        setProfile((current) => ({
            ...current,
            ...partial,
            avatar: partial.avatar !== undefined ? resolveMediaUrl(partial.avatar) : current.avatar,
        }));
        setIsProfileLoaded(true);
    }, []);

    useEffect(() => {
        if (isAuthenticated()) {
            void refreshProfile();
        } else {
            clearProfile();
        }
    }, [refreshProfile, clearProfile]);

    useEffect(() => {
        const handleFocus = () => {
            if (isAuthenticated()) {
                void refreshProfile();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [refreshProfile]);

    const value = useMemo(
        () => ({
            profile,
            isProfileLoaded,
            refreshProfile,
            setAvatar,
            updateProfile,
            clearProfile,
        }),
        [profile, isProfileLoaded, refreshProfile, setAvatar, updateProfile, clearProfile],
    );

    return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile(): UserProfileContextValue {
    const context = useContext(UserProfileContext);
    if (!context) {
        throw new Error('useUserProfile must be used within UserProfileProvider');
    }
    return context;
}
