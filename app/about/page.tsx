'use client';

import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AboutHero from '../../components/AboutHero';
import VideoBento from '../../components/VideoBento';
import TiltedCard from '../../components/TiltedCard';

// Stagger child elements
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as any,
    },
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <AboutHero />

      {/* Video Bento Section (Synchronized split player) */}
      <VideoBento />

      {/* Main Narrative / Story Section */}
      <section className="relative w-full py-20 md:py-32 px-6 md:px-16 lg:px-24 bg-[#080808] overflow-hidden border-t border-b border-white/5">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative z-10">
          
          {/* Left Column: Big Bold Statement */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="sticky top-28"
            >
              <span className="font-bebas text-xs md:text-sm tracking-[0.35em] text-white/30 uppercase block mb-4">
                Our Genesis
              </span>
              <h2 className="font-bebas text-5xl md:text-7xl uppercase text-white leading-[0.9] tracking-tight">
                Rivals <br />
                Became <br />
                <span className="text-white/40">Brothers.</span>
              </h2>
              <div className="w-12 h-[2px] bg-white mt-8 mb-6 origin-left" />
              <p className="text-sm md:text-base text-white/60 leading-relaxed font-medium max-w-sm">
                How two of the internet's biggest adversaries came together to challenge the beverage giants and change the culture forever.
              </p>
              <div className="mt-8 overflow-hidden rounded-lg border border-white/10 group max-w-sm">
                <img
                  src="/assets/creators/ksivlogan1.png"
                  alt="From rivalry to brothers"
                  className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105"
                />
                <div className="p-3 bg-white/[0.02] border-t border-white/5">
                  <p className="text-center font-bebas uppercase text-white text-xs tracking-wider">
                    From rivalry to brothers.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Detailed Narrative & Stats */}
          <div className="lg:col-span-7 space-y-16">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-10% 0px' }}
              className="space-y-8"
            >
              <motion.p
                variants={itemVariants}
                className="font-bebas text-2xl md:text-3xl uppercase tracking-wide text-white leading-snug"
              >
                "We created PRIME to showcase what happens when rivals come together as brothers and business partners to fill the void where great taste meets function."
              </motion.p>
              
              <motion.p
                variants={itemVariants}
                className="text-white/70 leading-relaxed text-sm md:text-base font-normal"
              >
                In 2022, former rivals Logan Paul and KSI founded PRIME, setting out to disrupt the sports drink category. They wanted an elite hydration formula that didn't compromise on taste. Through intense collaboration and a shared refusal to settle, they built a brand that speaks to the athletes, creators, and boundary-pushers of today.
              </motion.p>

              <motion.p
                variants={itemVariants}
                className="text-white/70 leading-relaxed text-sm md:text-base font-normal"
              >
                Since launching our first product, PRIME Hydration, we've continued to expand our offerings to help you hydrate and fuel your day. PRIME is formulated with premium ingredients like coconut water, BCAAs, and key electrolytes to keep you refreshed and ready for whatever's next.
              </motion.p>
            </motion.div>

            {/* Premium Stats Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-8 border-t border-white/10 pt-12"
            >
              <motion.div variants={itemVariants} className="space-y-1">
                <span className="font-bebas text-xs tracking-widest text-white/30 uppercase block">Founded</span>
                <span className="font-bebas text-4xl md:text-5xl text-white font-black">2022</span>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <span className="font-bebas text-xs tracking-widest text-white/30 uppercase block">Global Reach</span>
                <span className="font-bebas text-4xl md:text-5xl text-white font-black">40+ COUNTRIES</span>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <span className="font-bebas text-xs tracking-widest text-white/30 uppercase block">Annual Sales</span>
                <span className="font-bebas text-4xl md:text-5xl text-white font-black">1.2B+ USD</span>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <span className="font-bebas text-xs tracking-widest text-white/30 uppercase block">Co-Founders</span>
                <span className="font-bebas text-4xl md:text-5xl text-white font-black">LOGAN & KSI</span>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="w-full py-20 md:py-32 px-6 md:px-16 lg:px-24 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center justify-center text-center mb-16 md:mb-24">
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-bebas text-xs md:text-sm tracking-[0.35em] text-white/30 uppercase block mb-4"
            >
              The Visionaries
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-bebas text-5xl md:text-7xl uppercase text-white tracking-tight"
            >
              Meet The Founders
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-16 h-[2px] bg-white mt-6"
            />
          </div>

          {/* Founders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Founder 1: Logan Paul */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full aspect-[4/5] md:aspect-[3/4]"
            >
              <TiltedCard
                imageSrc="/assets/creators/logan.png"
                altText="Logan Paul"
                captionText="Logan Paul"
                containerHeight="100%"
                containerWidth="100%"
                imageHeight="100%"
                imageWidth="100%"
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                  <div className="flex flex-col justify-between h-full w-full relative z-20 text-left">
                    <div className="absolute -right-6 -bottom-16 font-bebas font-black text-white/[0.015] text-[24rem] select-none leading-none pointer-events-none">
                      L
                    </div>
                    <div>
                      <span className="font-bebas text-xs tracking-widest text-[#00E5FF] uppercase block mb-1">
                        Co-Founder
                      </span>
                      <h3 className="font-bebas text-4xl md:text-5xl text-white uppercase tracking-wide">
                        Logan Paul
                      </h3>
                    </div>
                    <div className="mt-auto">
                      <p className="text-white/80 text-xs md:text-sm leading-relaxed mb-6 max-w-sm font-medium drop-shadow-md">
                        Athlete, creator, and entertainer who leverages viral power and strategic business drive to elevate products from simple ideas to record-breaking cultural sensations.
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bebas uppercase tracking-widest text-white/40">
                          Socials:
                        </span>
                        <a href="https://instagram.com/loganpaul" target="_blank" rel="noreferrer" className="text-white/85 hover:text-white text-xs transition-colors font-semibold">
                          Instagram
                        </a>
                        <span className="text-white/20">|</span>
                        <a href="https://youtube.com/loganpaul" target="_blank" rel="noreferrer" className="text-white/85 hover:text-white text-xs transition-colors font-semibold">
                          YouTube
                        </a>
                      </div>
                    </div>
                  </div>
                }
              />
            </motion.div>

            {/* Founder 2: KSI */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="w-full aspect-[4/5] md:aspect-[3/4]"
            >
              <TiltedCard
                imageSrc="/assets/creators/ksi.png"
                altText="KSI"
                captionText="KSI"
                containerHeight="100%"
                containerWidth="100%"
                imageHeight="100%"
                imageWidth="100%"
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                  <div className="flex flex-col justify-between h-full w-full relative z-20 text-left">
                    <div className="absolute -right-6 -bottom-16 font-bebas font-black text-white/[0.015] text-[24rem] select-none leading-none pointer-events-none">
                      K
                    </div>
                    <div>
                      <span className="font-bebas text-xs tracking-widest text-[#00E5FF] uppercase block mb-1">
                        Co-Founder
                      </span>
                      <h3 className="font-bebas text-4xl md:text-5xl text-white uppercase tracking-wide">
                        KSI
                      </h3>
                    </div>
                    <div className="mt-auto">
                      <p className="text-white/80 text-xs md:text-sm leading-relaxed mb-6 max-w-sm font-medium drop-shadow-md">
                        Musician, professional boxer, and content pioneer who brings creative authenticity and unstoppable global fandom to disrupt the landscape and challenge industry giants.
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bebas uppercase tracking-widest text-white/40">
                          Socials:
                        </span>
                        <a href="https://instagram.com/ksi" target="_blank" rel="noreferrer" className="text-white/85 hover:text-white text-xs transition-colors font-semibold">
                          Instagram
                        </a>
                        <span className="text-white/20">|</span>
                        <a href="https://youtube.com/ksi" target="_blank" rel="noreferrer" className="text-white/85 hover:text-white text-xs transition-colors font-semibold">
                          YouTube
                        </a>
                      </div>
                    </div>
                  </div>
                }
              />
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
