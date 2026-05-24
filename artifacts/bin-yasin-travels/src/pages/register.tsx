import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  agencyName: z.string().min(2, "Agency name required"),
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Invalid email"),
  cellNumber: z.string().min(10, "Valid phone required"),
  city: z.string().min(2, "City required"),
  password: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const registerMutation = useRegister();

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    registerMutation.mutate({ data }, {
      onSuccess: (res) => { login(res); setLocation("/dashboard"); },
      onError: (err: any) => { setError("email", { message: err?.data?.error || "Registration failed" }); },
    });
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold font-serif">BYT</span>
            </div>
            <div className="text-left">
              <div className="font-serif font-bold text-white text-sm leading-none">Bin Yasin</div>
              <div className="text-primary text-xs font-medium tracking-wider">TRAVELS</div>
            </div>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-white mb-1">Create Account</h1>
          <p className="text-white/60 text-sm">Register as a travel agent partner</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/80 mb-1.5 block">Agency Name</label>
              <Input {...register("agencyName")} placeholder="Your Travel Agency" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" data-testid="input-agency-name" />
              {errors.agencyName && <p className="text-red-400 text-xs mt-1">{errors.agencyName.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-white/80 mb-1.5 block">Full Name</label>
              <Input {...register("fullName")} placeholder="Your Full Name" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" data-testid="input-full-name" />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-white/80 mb-1.5 block">Email Address</label>
              <Input {...register("email")} type="email" placeholder="your@email.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" data-testid="input-email" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-white/80 mb-1.5 block">Cell Number</label>
                <Input {...register("cellNumber")} placeholder="+923..." className="bg-white/5 border-white/10 text-white placeholder:text-white/30" data-testid="input-cell-number" />
                {errors.cellNumber && <p className="text-red-400 text-xs mt-1">{errors.cellNumber.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-white/80 mb-1.5 block">City</label>
                <Input {...register("city")} placeholder="Lahore" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" data-testid="input-city" />
                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-white/80 mb-1.5 block">Password</label>
              <div className="relative">
                <Input {...register("password")} type={showPass ? "text" : "password"} placeholder="Min 8 characters" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-10" data-testid="input-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-white/80 mb-1.5 block">Confirm Password</label>
              <Input {...register("confirmPassword")} type="password" placeholder="Confirm password" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" data-testid="input-confirm-password" />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-semibold" disabled={registerMutation.isPending} data-testid="button-register">
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-white/60 text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
