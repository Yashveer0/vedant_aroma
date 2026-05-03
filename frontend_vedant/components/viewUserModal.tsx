"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AdminUser } from '@/lib/api/admin';

// Define the props for the component
interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
}

// A styled row for displaying a piece of user data
const InfoRow = ({ label, value, isBadge = false }: { label: string; value?: string; isBadge?: boolean }) => {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between border-b py-2">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {isBadge ? (
         <Badge variant={value === 'Active' ? 'default' : 'destructive'}>{value}</Badge>
      ) : (
        <p className="text-sm text-gray-900">{value}</p>
      )}
    </div>
  );
};

export function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Viewing information for {user.fullName}.</DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-2">
            <InfoRow label="Full Name" value={user.fullName} />
            <InfoRow label="Email Address" value={user.email} />
            {/* <InfoRow label="Gender" value={user.gender} /> */}
            <InfoRow label="Role" value={user.role} />
            {/* <InfoRow label="Account Status" value={user.status} isBadge /> */}
            <InfoRow label="User Verified" value={user.isVerified ? 'Yes' : 'No'} />
            <InfoRow label="Joined On" value={new Date(user.createdAt).toLocaleDateString()} />
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}