import { motion } from "framer-motion";
import { Link } from "wouter";
import { Plane, Package, FileText, Globe, Star, Phone, Mail, MapPin, ChevronRight, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

const services = [
  { icon: Plane, title: "Group Tickets", desc: "Affordable group flight packages to Saudi Arabia, UAE, Qatar and beyond. Best rates guaranteed for travel agents.", color: "from-blue-500/20 to-primary/20" },
  { icon: Plane, title: "Umrah Tickets", desc: "Dedicated Umrah flights with trusted airlines. Flexible dates, multiple origin cities.", color: "from-primary/20 to-yellow-500/20" },
  { icon: Package, title: "Complete Umrah Packages", desc: "All-inclusive Umrah packages with hotel, transport, visa and guided tours. Economy, VIP, and Luxury tiers.", color: "from-purple-500/20 to-primary/20" },
  { icon: FileText, title: "Work Visa Information", desc: "Expert guidance on work visa applications for Gulf countries. Fast processing, documentation support.", color: "from-green-500/20 to-primary/20" },
  { icon: Globe, title: "Visit Visa Information", desc: "Visit visa assistance for UAE, Saudi Arabia, Qatar, and other destinations. Reliable and hassle-free.", color: "from-orange-500/20 to-primary/20" },
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

const airlines = [
  { name: "PIA", logo: "https://www.gstatic.com/flights/airline_logos/70px/PK.png" },
  { name: "Airblue", logo: "https://www.gstatic.com/flights/airline_logos/70px/ED.png" },
  { name: "FlyJinnah", logo: "https://www.gstatic.com/flights/airline_logos/70px/9P.png" },
  { name: "SereneAir", logo: "https://www.gstatic.com/flights/airline_logos/70px/ER.png" },
  { name: "Qatar Airways", logo: "https://www.gstatic.com/flights/airline_logos/70px/QR.png" },
  { name: "Emirates", logo: "https://www.gstatic.com/flights/airline_logos/70px/EK.png" },
  { name: "Saudi Airlines", logo: "https://www.gstatic.com/flights/airline_logos/70px/SV.png" },
  { name: "Flydubai", logo: "https://www.gstatic.com/flights/airline_logos/70px/FZ.png" },
  { name: "Air Arabia", logo: "https://www.gstatic.com/flights/airline_logos/70px/G9.png" },
  { name: "AirSial", logo: "https://www.gstatic.com/flights/airline_logos/70px/PF.png" },
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
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 font-semibold px-8 group transition-all duration-300">
                  Join As Agent
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="tel:+923018780888">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:border-primary/50 font-semibold px-8 transition-all duration-300">
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
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center group cursor-default">
                <div className="font-serif text-3xl font-bold text-primary-foreground group-hover:scale-110 transition-transform duration-300">{s.value}</div>
                <div className="text-primary-foreground/70 text-sm mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Airline Partners Strip */}
      <section className="py-10 bg-secondary/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-6">
            <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">Our Airline Partners</p>
          </motion.div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {airlines.map((airline, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group flex flex-col items-center gap-2 cursor-default">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-border/50 flex items-center justify-center
                  group-hover:bg-white/10 group-hover:border-primary/30 group-hover:shadow-md group-hover:shadow-primary/10
                  group-hover:-translate-y-1 transition-all duration-300 p-2">
                  <img src={airline.logo} alt={airline.name} className="w-10 h-10 object-contain" />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors duration-300">{airline.name}</span>
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
                className="group bg-card border border-border rounded-xl p-6
                  hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1
                  transition-all duration-300 cursor-default relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4
                    group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                    <s.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  <div className="mt-4 flex items-center text-primary text-sm font-medium gap-1 group-hover:gap-2 transition-all duration-300">
                    Learn more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - with Medina background */}
      <section className="py-20 relative overflow-hidden">
        {/* Medina Background */}
        <div className="absolute inset-0">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Masjid_al-Nabawi.jpg/1280px-Masjid_al-Nabawi.jpg"
            alt="Masjid Al Nabawi, Medina"
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.2)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/90 via-secondary/80 to-secondary/90" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Why Choose Us</div>
              <h2 className="font-serif text-4xl font-bold text-white mb-6">Trusted by Top Agents Since 2005</h2>
              <p className="text-white/70 leading-relaxed mb-6">For nearly two decades, Bin Yasin Travels has been the backbone of Pakistan's travel agent community — providing competitive rates, reliable service, and a professional booking portal.</p>
              <ul className="space-y-3">
                {["IATA Accredited Agency", "Real-time seat availability", "Instant ticket confirmation", "Dedicated agent support team", "Competitive group fares", "Secure payment processing"].map((item, i) => (
                  <motion.li key={i}
                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 text-white/80 group cursor-default hover:text-white transition-colors duration-200">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Group Bookings", value: "12,500+", color: "bg-primary/20 border-primary/30", textColor: "text-primary" },
                  { label: "Umrah Pilgrims", value: "8,200+", color: "bg-blue-500/20 border-blue-500/30", textColor: "text-blue-400" },
                  { label: "Partner Cities", value: "25+", color: "bg-green-500/20 border-green-500/30", textColor: "text-green-400" },
                  { label: "Years Active", value: "19+", color: "bg-purple-500/20 border-purple-500/30", textColor: "text-purple-400" },
                ].map((c, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className={`${c.color} border rounded-xl p-6 text-center backdrop-blur-sm
                      hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-default`}>
                    <div className={`font-serif text-3xl font-bold ${c.textColor} mb-1`}>{c.value}</div>
                    <div className="text-white/60 text-sm">{c.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Medina Gallery Section */}
      <section className="py-16 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10">
            <div className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Sacred Destinations</div>
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">Makkah & Madinah</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Experience the spiritual heart of Islam with our premium Umrah and Hajj packages.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/20201008_Makkah_Masjid_al-Haram.jpg/640px-20201008_Makkah_Masjid_al-Haram.jpg", alt: "Masjid Al Haram, Makkah", label: "Masjid Al Haram" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Masjid_al-Nabawi.jpg/640px-Masjid_al-Nabawi.jpg", alt: "Masjid Al Nabawi, Madinah", label: "Masjid Al Nabawi" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Aerial_view_of_the_Kaaba%2C_the_Masjid_al-Haram_and_the_surrounding_Mecca_cityscape.jpg/640px-Aerial_view_of_the_Kaaba%2C_the_Masjid_al-Haram_and_the_surrounding_Mecca_cityscape.jpg", alt: "Aerial Makkah", label: "Holy Kaaba" },
            ].map((img, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="group relative rounded-xl overflow-hidden aspect-video cursor-pointer">
                <img src={img.src} alt={img.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent
                  group-hover:from-secondary/60 transition-all duration-300" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white text-sm font-semibold group-hover:text-primary transition-colors duration-300">{img.label}</p>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/40 rounded-xl transition-all duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/50">
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
                className="group bg-card border border-border rounded-xl p-6
                  hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1
                  transition-all duration-300 cursor-default">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${j * 30}ms` }} />
                  ))}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed mb-4 italic group-hover:text-foreground/90 transition-colors duration-300">"{t.text}"</p>
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
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Get In Touch</div>
              <h2 className="font-serif text-4xl font-bold text-foreground mb-6">Contact Us</h2>
              <p className="text-muted-foreground mb-8">Ready to partner with us? Reach out to our team and start offering premium travel services to your clients.</p>
              <ul className="space-y-4">
                <li className="group flex items-center gap-3 cursor-pointer hover:text-primary transition-colors duration-200">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <a href="tel:+923018780888" className="text-foreground/80 group-hover:text-primary transition-colors">+923018780888</a>
                </li>
                <li className="group flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground/80 group-hover:text-foreground transition-colors">info@binyasintravels.com</span>
                </li>
                <li className="group flex items-start gap-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200 flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground/80 group-hover:text-foreground transition-colors mt-2">Main Bazaar, Lahore, Punjab, Pakistan</span>
                </li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                {submitted && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm">Message sent successfully! We'll be in touch soon.</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Your Name</label>
                      <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="Full Name" required data-testid="input-contact-name"
                        className="focus:border-primary/50 transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Phone</label>
                      <Input value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        placeholder="+92..." data-testid="input-contact-phone"
                        className="focus:border-primary/50 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Email</label>
                    <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com" required data-testid="input-contact-email"
                      className="focus:border-primary/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Message</label>
                    <Textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      placeholder="How can we help you?" rows={4} required data-testid="textarea-contact-message"
                      className="focus:border-primary/50 transition-colors" />
                  </div>
                  <Button type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                    data-testid="button-contact-submit">
                    Send Message
                  </Button>
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
