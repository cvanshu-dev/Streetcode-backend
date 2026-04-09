"use client"

import { useEffect, useState, useCallback } from "react"
import { Button, Heading, Text, clx } from "@medusajs/ui"
import { motion, AnimatePresence } from "framer-motion"

const slides = [
  {
    image: "/img2.jpg",
    title: "Street Essentials",
    subtitle: "Minimal everyday streetwear designed for comfort and style.",
    buttonText: "Shop T-Shirts",
    link: "/collections/tshirts",
  },
  {
    image: "/img3.jpg",
    title: "Performance Fit",
    subtitle: "Premium compression wear built for training and movement.",
    buttonText: "Shop Compression",
    link: "/collections/compression",
  },
  {
    image: "/img4.jpg",
    title: "New Season Drop",
    subtitle: "Fresh arrivals made for modern street fashion.",
    buttonText: "Explore Collection",
    link: "/collections/new",
  },
]

const Hero = () => {
  const [index, setIndex] = useState(0)

  const nextSlide = useCallback(() => {
    setIndex((prev) => (prev + 1) % slides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(nextSlide, 7000)
    return () => clearInterval(timer)
  }, [nextSlide])

  return (
    <section className="relative h-[92vh] w-full overflow-hidden bg-neutral-950">
      {/* Background Layer with Parallax Scale */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={`bg-${index}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <img
            src={slides[index].image}
            alt={slides[index].title}
            className="h-full w-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-20 flex h-full items-end pb-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
            >
              <motion.div transition={{ duration: 0.5 }}>
                <Heading className="text-5xl md:text-8xl font-bold uppercase tracking-tighter text-white mb-4">
                  {slides[index].title.split(" ").map((word, i) => (
                    <span key={i} className="inline-block mr-4">{word}</span>
                  ))}
                </Heading>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 0.8 }} 
                transition={{ delay: 0.2 }}
              >
                <Text className="text-lg md:text-xl text-neutral-200 max-w-lg mb-8 leading-relaxed">
                  {slides[index].subtitle}
                </Text>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="primary"
                  size="large"
                  className="bg-white text-black hover:bg-neutral-200 transition-all duration-300 rounded-none px-10 h-14 text-sm uppercase tracking-widest font-bold"
                  onClick={() => (window.location.href = slides[index].link)}
                >
                  {slides[index].buttonText}
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Premium Pagination Indicators */}
        <div className="absolute right-6 md:right-16 bottom-24 flex flex-col gap-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="group relative h-12 w-1 flex items-center justify-center"
            >
              <div 
                className={clx(
                  "h-full w-[2px] transition-all duration-500",
                  index === i ? "bg-white" : "bg-white/20 group-hover:bg-white/40"
                )} 
              />
              {index === i && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute left-[-4px] w-3 h-3 bg-white rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero