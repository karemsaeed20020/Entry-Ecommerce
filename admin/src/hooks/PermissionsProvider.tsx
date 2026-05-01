import { createContext, type ReactNode } from "react";
import useAuthStore from "../store/useAuthStore";

export type PermissionsContextType = {
  canPerformCRUD: boolean;
  isReadOnly: boolean;
  isAdmin: boolean;
  can: (permission: string) => boolean;
};

// We export the Context so the hook file can consume it
 const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);
export default PermissionsContext;  

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const { canPerformCRUD, isReadOnly, checkIsAdmin, user } = useAuthStore();

  const value = {
    canPerformCRUD: canPerformCRUD(),
    isReadOnly: isReadOnly(),
    isAdmin: checkIsAdmin(),
    can: (permission: string) => {
      if (checkIsAdmin()) return true;
      if (user?.permissions && Array.isArray(user.permissions)) {
        return user.permissions.includes(permission);
      }
      return false;
    },
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};