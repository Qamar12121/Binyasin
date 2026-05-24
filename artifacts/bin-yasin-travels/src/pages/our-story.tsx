import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const timeline = [
  { year: "2005", title: "The Beginning", desc: "Haji Muhammad Yasin founded Bin Yasin Travels in Lahore with a simple mission: make Hajj and Umrah accessible for every Pakistani family." },
  { year: "2008", title: "First Umrah Package", desc: "Launched our first complete Umrah package program, sending 200 pilgrims in the inaugural season." },
  { year: "2012", title: "IATA Accreditation", desc: "Achieved IATA accreditation, cementing our status as a professional international travel agency." },
  { year: "2015", title: "Agent Network Launch", desc: "Launched our agent network program, partnering with 100+ travel agencies across Pakistan." },
  { year: "2019", title: "Digital Transformation", desc: "Introduced the online agent portal, allowing 24/7 booking, real-time availability, and instant confirmations." },
  { year: "2024", title: "Today & Beyond", desc: "Serving 500+ agent partners nationwide with cutting-edge technology and the same family values that started it all." },
];

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="text-primary text-sm font-semibold tracking-widest uppercase mb-2">Our Story</div>
            <h1 className="font-serif text-5xl font-bold text-foreground mb-4">A Journey of Trust</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From a single office in Lahore to Pakistan's most trusted travel agency network — the story of Bin Yasin Travels.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative flex gap-6 pl-20">
                  <div className="absolute left-5 top-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-4 ring-background">
                    <span className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>
                  <div className="bg-card border border-border rounded-xl p-5 flex-1">
                    <div className="text-primary text-sm font-bold mb-1">{item.year}</div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
