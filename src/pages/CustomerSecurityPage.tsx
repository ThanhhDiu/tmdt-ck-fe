import React from 'react';
import { SettingsMain } from '../components/settings';
import { ChangePasswordTab } from '../components/provider-profile/ChangePasswordTab';

export default function CustomerSecurityPage() {
    return (
        <SettingsMain>
            <ChangePasswordTab />
        </SettingsMain>
    );
}
