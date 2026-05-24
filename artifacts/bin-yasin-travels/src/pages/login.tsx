import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Plane } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const loginMutation = useLogin();

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate({ data: { email: data.email, password: data.password, rememberMe: data.rememberMe ?? false } }, {
      onSuccess: (res) => {
        login(res);
        setLocation(res.user.role === "admin" ? "/admin" : "/dashboard");
      },
      onError: (err: any) => {
        setError("password", { message: err?.data?.error || "Invalid credentials" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md">
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
          <h1 className="font-serif text-3xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-white/60 text-sm">Sign in to your agent account</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/80 mb-1.5 block">Email Address</label>
              <Input {...register("email")} type="email" placeholder="your@email.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" data-testid="input-email" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-white/80 mb-1.5 block">Password</label>
              <div className="relative">
                <Input {...register("password")} type={showPass ? "text" : "password"} placeholder="••••••••" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-10" data-testid="input-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register("rememberMe")} type="checkbox" className="w-4 h-4 rounded" data-testid="checkbox-remember-me" />
                <span className="text-sm text-white/60">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">Forgot Password?</Link>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground font-semibold" disabled={loginMutation.isPending} data-testid="button-login">
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-center text-white/60 text-sm mt-4">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
