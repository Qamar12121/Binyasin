import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useChangePassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });
type FormData = z.infer<typeof schema>;

export default function ChangePasswordPage() {
  const changePwd = useChangePassword();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors }, setError } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    changePwd.mutate({ data }, {
      onSuccess: () => { toast({ title: "Password changed successfully!" }); reset(); },
      onError: (err: any) => setError("currentPassword", { message: err?.data?.error || "Failed to change password" }),
    });
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Change Password</h1>
        <p className="text-muted-foreground text-sm mt-1">Update your account password</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Security Settings</p>
            <p className="text-xs text-muted-foreground">Choose a strong password with at least 8 characters</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Current Password</label>
            <Input {...register("currentPassword")} type="password" placeholder="Current password" data-testid="input-current-password" />
            {errors.currentPassword && <p className="text-red-400 text-xs mt-1">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-1.5 block">New Password</label>
            <Input {...register("newPassword")} type="password" placeholder="New password (min 8 chars)" data-testid="input-new-password" />
            {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Confirm New Password</label>
            <Input {...register("confirmPassword")} type="password" placeholder="Confirm new password" data-testid="input-confirm-password" />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={changePwd.isPending} data-testid="button-update-password">
            {changePwd.isPending ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
