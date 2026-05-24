import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Contact Us</div>
            <h1 className="font-serif text-5xl font-bold text-foreground mb-4">Get In Touch</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Ready to start working together? Our team is here to answer your questions.</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              {[
                { icon: Phone, title: "Helpline", value: "+923018780888", href: "tel:+923018780888" },
                { icon: Mail, title: "Email", value: "info@binyasintravels.com", href: "mailto:info@binyasintravels.com" },
                { icon: MapPin, title: "Office", value: "Main Bazaar, Lahore, Pakistan" },
                { icon: Clock, title: "Hours", value: "Mon–Sat: 9AM–7PM" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-0.5">{item.title}</div>
                    {item.href ? (
                      <a href={item.href} className="text-foreground font-medium hover:text-primary transition-colors">{item.value}</a>
                    ) : (
                      <div className="text-foreground font-medium">{item.value}</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <span className="text-green-400 text-2xl">✓</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground text-sm">We'll get back to you within 24 hours.</p>
                  <Button onClick={() => setSubmitted(false)} className="mt-4 bg-primary text-primary-foreground">Send Another</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Full Name *</label>
                      <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Your name" required data-testid="input-contact-name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Phone</label>
                      <Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+92..." data-testid="input-contact-phone" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Email *</label>
                    <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" required data-testid="input-contact-email" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Message *</label>
                    <Textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} placeholder="How can we help you?" rows={5} required data-testid="textarea-contact-message" />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground" data-testid="button-contact-submit">Send Message</Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
