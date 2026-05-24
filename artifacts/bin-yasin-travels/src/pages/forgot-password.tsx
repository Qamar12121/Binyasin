import { motion } from "framer-motion";
import { Link } from "wouter";
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@workspace/api-client-react";

const schema = z.object({ email: z.string().email("Invalid email address") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const forgotMutation = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    forgotMutation.mutate({ data }, { onSuccess: () => setSent(true) });
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold font-serif">BYT</span>
            </div>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-white mb-1">Forgot Password</h1>
          <p className="text-white/60 text-sm">Enter your email to receive your password</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Check Your Email</h3>
              <p className="text-white/60 text-sm mb-6">We've sent password recovery instructions to your email address. Please check your inbox.</p>
              <Link href="/login">
                <Button className="w-full bg-primary text-primary-foreground">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white/80 mb-1.5 block">Email Address</label>
                <Input {...register("email")} type="email" placeholder="your@email.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/30" data-testid="input-email" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={forgotMutation.isPending} data-testid="button-send-password">
                {forgotMutation.isPending ? "Sending..." : "Send My Password"}
              </Button>
              <Link href="/login" className="flex items-center justify-center gap-2 text-white/60 hover:text-white text-sm transition-colors mt-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
