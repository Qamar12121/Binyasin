import { motion } from "framer-motion";
import { User, Upload, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useUpdateProfile, getGetProfileQueryKey, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  agencyName: z.string().min(2, "Required"),
  fullName: z.string().min(2, "Required"),
  cellNumber: z.string().min(10, "Required"),
  city: z.string().min(2, "Required"),
});
type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, login, token } = useAuth();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      agencyName: user?.agencyName || "",
      fullName: user?.fullName || "",
      cellNumber: user?.cellNumber || "",
      city: user?.city || "",
    },
  });

  const onSubmit = (data: FormData) => {
    updateProfile.mutate({ data }, {
      onSuccess: (updated) => {
        login({ token: token!, user: updated as any });
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Profile updated successfully!" });
      },
      onError: () => toast({ title: "Update failed", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Update your agency information</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-serif">
              {user?.agencyName?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">{user?.agencyName}</h2>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <p className="text-muted-foreground text-xs mt-0.5 capitalize">{user?.role} • {user?.city}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Agency Name</label>
              <Input {...register("agencyName")} data-testid="input-agency-name" />
              {errors.agencyName && <p className="text-red-400 text-xs mt-1">{errors.agencyName.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Full Name</label>
              <Input {...register("fullName")} data-testid="input-full-name" />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Cell Number</label>
              <Input {...register("cellNumber")} data-testid="input-cell-number" />
              {errors.cellNumber && <p className="text-red-400 text-xs mt-1">{errors.cellNumber.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">City</label>
              <Input {...register("city")} data-testid="input-city" />
              {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
            </div>
          </div>
          <div className="pt-2">
            <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Email Address</label>
            <Input value={user?.email || ""} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed. Contact admin for help.</p>
          </div>
          <Button type="submit" className="bg-primary text-primary-foreground" disabled={updateProfile.isPending} data-testid="button-save-profile">
            <Save className="w-4 h-4 mr-2" />
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
