import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types/auth";
import { hasPermission } from "../../services/auth";

interface RoleBasedComponentProps{
    allowedRoles: UserRole[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const RoleBasedComponent : React.FC<RoleBasedComponentProps> = ({
    allowedRoles, children, fallback=null
}) => {
    const { user } = useAuth();

    if(!user || !hasPermission(user.role, allowedRoles)){
        return <>{fallback}</>
    }
    return <>{children}</>;
}

export default RoleBasedComponent;