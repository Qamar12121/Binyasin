import { Link } from "wouter";
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm font-serif">BYT</span>
              </div>
              <div>
                <div className="font-serif font-bold text-white text-sm leading-none">Bin Yasin</div>
                <div className="text-primary text-xs font-medium tracking-wider">TRAVELS</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Pakistan's trusted travel partner for Hajj, Umrah, and international travel services since 2005.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-primary hover:bg-white/20 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {[["Home", "/"], ["About Us", "/about"], ["Our Story", "/our-story"], ["Services", "/services"], ["Contact", "/contact"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-white/60 hover:text-primary text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 text-white/60 text-sm">
              {["Group Tickets", "Umrah Tickets", "Umrah Packages", "Work Visa", "Visit Visa"].map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/60 text-sm">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:+923018780888" className="hover:text-primary transition-colors">+923018780888</a>
              </li>
              <li className="flex items-center gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span>info@binyasintravels.com</span>
              </li>
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Main Bazaar, Lahore, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-sm">© 2024 Bin Yasin Travels. All rights reserved.</p>
          <p className="text-white/40 text-sm">IATA Accredited | Licensed Travel Agent</p>
        </div>
      </div>
    </footer>
  );
}
