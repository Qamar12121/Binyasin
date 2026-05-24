import { motion } from "framer-motion";
import { Link } from "wouter";
import { Plane, Package, FileText, Globe, Star, Phone, Mail, MapPin, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

const services = [
  { icon: Plane, title: "Group Tickets", desc: "Affordable group flight packages to Saudi Arabia, UAE, Qatar and beyond. Best rates guaranteed for travel agents." },
  { icon: Plane, title: "Umrah Tickets", desc: "Dedicated Umrah flights with trusted airlines. Flexible dates, multiple origin cities." },
  { icon: Package, title: "Complete Umrah Packages", desc: "All-inclusive Umrah packages with hotel, transport, visa and guided tours. Economy, VIP, and Luxury tiers." },
  { icon: FileText, title: "Work Visa Information", desc: "Expert guidance on work visa applications for Gulf countries. Fast processing, documentation support." },
  { icon: Globe, title: "Visit Visa Information", desc: "Visit visa assistance for UAE, Saudi Arabia, Qatar, and other destinations. Reliable and hassle-free." },
];

const testimonials = [
  { name: "Muhammad Usman", agency: "Usman Travel Agency, Lahore", text: "Bin Yasin Travels has been our trusted partner for 5 years. Their group ticket rates are unmatched and the booking process is seamless.", stars: 5 },
  { name: "Fatima Malik", agency: "Al-Noor Travels, Karachi", text: "Excellent Umrah packages with top-tier hotels. Our clients always come back satisfied. Highly recommend their VIP Umrah packages.", stars: 5 },
  { name: "Ahmed Raza", agency: "Paradise Tours, Islamabad", text: "The online agent portal makes managing bookings so easy. Real-time availability, instant confirmations, and professional support team.", stars: 5 },
  { name: "Sana Qureshi", agency: "Golden Crescent Travel, Faisalabad", text: "We've booked thousands of passengers through Bin Yasin Travels. Their reliability and competitive pricing keep us coming back.", stars: 5 },
];

const stats = [
  { value: "50,000+", label: "Happy Travelers" },
  { value: "500+", label: "Partner Agencies" },
  { value: "19+", label: "Years Experience" },
  { value: "99%", label: "Satisfaction Rate" },
];

export default function HomePage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-secondary">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/20201008_Makkah_Masjid_al-Haram.jpg/1280px-20201008_Makkah_Masjid_al-Haram.jpg"
            alt="Masjid Al Haram Kaaba"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.35)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-secondary/60 to-transparent" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Pakistan's Premier Travel Agency
              </div>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Your Journey<br />
              <span className="text-primary">Begins Here</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-white/70 text-xl leading-relaxed mb-8 max-w-xl">
              Bin Yasin Travels — trusted by 500+ travel agencies across Pakistan for premium group tickets, Umrah packages, and visa services.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 group">
                  Join As Agent
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="tel:+923018780888">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-semibold px-8">
                  <Phone className="w-4 h-4 mr-2" />
                  +923018780888
                </Button>
              </a>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {[0,1,2].map(i => (
            <motion.div key={i} className={`rounded-full bg-white/30 ${i === 0 ? "w-8 h-2" : "w-2 h-2"}`}
              animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="font-serif text-3xl font-bold text-primary-foreground">{s.value}</div>
                <div className="text-primary-foreground/70 text-sm mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <div className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">What We Offer</div>
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Comprehensive travel services tailored for professional travel agents across Pakistan.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                <div className="mt-4 flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                  Learn more <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Why Choose Us</div>
              <h2 className="font-serif text-4xl font-bold text-foreground mb-6">Trusted by Top Agents Since 2005</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">For nearly two decades, Bin Yasin Travels has been the backbone of Pakistan's travel agent community — providing competitive rates, reliable service, and a professional booking portal.</p>
              <ul className="space-y-4">
                {["IATA Accredited Agency", "Real-time seat availability", "Instant ticket confirmation", "Dedicated agent support team", "Competitive group fares", "Secure payment processing"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground/80">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Group Bookings", value: "12,500+", color: "bg-primary/20" },
                  { label: "Umrah Pilgrims", value: "8,200+", color: "bg-blue-500/20" },
                  { label: "Partner Cities", value: "25+", color: "bg-green-500/20" },
                  { label: "Years Active", value: "19+", color: "bg-purple-500/20" },
                ].map((c, i) => (
                  <div key={i} className={`${c.color} rounded-xl p-6 text-center`}>
                    <div className="font-serif text-3xl font-bold text-foreground mb-1">{c.value}</div>
                    <div className="text-muted-foreground text-sm">{c.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-12">
            <div className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Testimonials</div>
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">What Agents Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-foreground text-sm">{t.name}</div>
                  <div className="text-primary text-xs mt-0.5">{t.agency}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Get In Touch</div>
              <h2 className="font-serif text-4xl font-bold text-foreground mb-6">Contact Us</h2>
              <p className="text-muted-foreground mb-8">Ready to partner with us? Reach out to our team and start offering premium travel services to your clients.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary" /><a href="tel:+923018780888" className="text-foreground/80 hover:text-primary transition-colors">+923018780888</a></li>
                <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary" /><span className="text-foreground/80">info@binyasintravels.com</span></li>
                <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-primary mt-0.5" /><span className="text-foreground/80">Main Bazaar, Lahore, Punjab, Pakistan</span></li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-card border border-border rounded-xl p-6">
                {submitted && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm">Message sent successfully! We'll be in touch soon.</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Your Name</label>
                      <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" required data-testid="input-contact-name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Phone</label>
                      <Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+92..." data-testid="input-contact-phone" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Email</label>
                    <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="your@email.com" required data-testid="input-contact-email" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Message</label>
                    <Textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} placeholder="How can we help you?" rows={4} required data-testid="textarea-contact-message" />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground" data-testid="button-contact-submit">Send Message</Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
