import { motion } from "framer-motion";
import { Award, Users, Globe, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">About Us</div>
            <h1 className="font-serif text-5xl font-bold text-foreground mb-4">Who We Are</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Bin Yasin Travels is Pakistan's trusted travel agency, dedicated to making pilgrimages and international travel accessible for every Pakistani.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded in 2005, Bin Yasin Travels has grown from a small family business to one of Pakistan's most respected travel agencies. We specialize in Hajj and Umrah packages, group flights, and visa assistance.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our agent-first approach means we empower travel agents across Pakistan with competitive rates, professional tools, and unwavering support. We believe every agent deserves a reliable partner.
              </p>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, title: "IATA Accredited", desc: "Internationally recognized accreditation" },
                { icon: Users, title: "500+ Partners", desc: "Travel agencies across Pakistan" },
                { icon: Globe, title: "25+ Destinations", desc: "Worldwide coverage" },
                { icon: Clock, title: "19+ Years", desc: "Trusted experience" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-semibold text-foreground text-sm">{item.title}</div>
                  <div className="text-muted-foreground text-xs mt-1">{item.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-card border border-border rounded-2xl p-8 text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {[
                { title: "Integrity", desc: "We operate with complete transparency and honesty in every transaction." },
                { title: "Excellence", desc: "We deliver premium service quality in every aspect of our work." },
                { title: "Partnership", desc: "We grow together with our agent partners, supporting their success." },
              ].map((v, i) => (
                <div key={i} className="text-center">
                  <div className="w-2 h-2 bg-primary rounded-full mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
