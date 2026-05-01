import { useContext } from "react";
import PermissionsContext, {  type PermissionsContextType } from "./PermissionsProvider";

const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  
  return context;
};

export default usePermissions;