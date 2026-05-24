import { motion } from "framer-motion";
import { Plane, Package, FileText, Globe, Users, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const services = [
  { icon: Plane, title: "Group Tickets", desc: "KSA, UAE, Qatar one-way group flights at the most competitive fares in Pakistan. Real-time availability and instant confirmations.", features: ["Multiple airlines", "Real-time availability", "Instant confirmation", "Flexible dates"] },
  { icon: Plane, title: "Umrah Tickets", desc: "Dedicated Umrah flights with full passenger support. Multiple origin cities and return options.", features: ["Direct flights", "Multiple origins", "Return options", "Group discounts"] },
  { icon: Package, title: "Complete Umrah Packages", desc: "All-inclusive packages covering flights, accommodation, transport, and visa. Economy to Luxury tiers.", features: ["Economy/VIP/Luxury", "Hotel included", "Visa included", "Transport included"] },
  { icon: FileText, title: "Work Visa Services", desc: "Expert guidance on Gulf country work visa applications. Complete documentation support.", features: ["Gulf countries", "Documentation help", "Fast processing", "Expert guidance"] },
  { icon: Globe, title: "Visit Visa Services", desc: "Hassle-free visit visa processing for UAE, Saudi Arabia, Qatar, and more.", features: ["Multiple countries", "Online tracking", "Quick processing", "High approval rate"] },
  { icon: CreditCard, title: "Agent Credit System", desc: "Flexible credit facilities for trusted agent partners. Manage your account with our online ledger.", features: ["Credit facilities", "Online ledger", "Transaction history", "Monthly statements"] },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Services</div>
            <h1 className="font-serif text-5xl font-bold text-foreground mb-4">Everything You Need</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Comprehensive travel solutions for professional travel agents across Pakistan.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {services.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{s.desc}</p>
                <ul className="space-y-1.5">
                  {s.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-foreground/70">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-primary rounded-2xl p-8 text-center">
            <h2 className="font-serif text-3xl font-bold text-primary-foreground mb-3">Ready to Partner With Us?</h2>
            <p className="text-primary-foreground/80 mb-6">Join 500+ travel agencies already benefiting from our services.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/register"><Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">Register as Agent</Button></Link>
              <Link href="/contact"><Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Contact Us</Button></Link>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
