"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Lock } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"

interface RestrictedContentPreviewProps {
    images: string[]
}

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
}

export function RestrictedContentPreview({ images }: RestrictedContentPreviewProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        if (images.length === 0) return
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }, 4000) // Increased interval for less CPU churn
        return () => clearInterval(interval)
    }, [images.length])

    return (
        <motion.div
            className="w-full pb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeIn}
        >
            <div className="relative aspect-square w-full filter saturate-[0.2] hover:saturate-100 transition-all duration-700 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={images[currentImageIndex]}
                            alt="Exclusive Preview"
                            fill
                            sizes="(max-width: 420px) 100vw, 400px"
                            className="object-cover blur-[8px]"
                            loading="lazy"
                        />
                    </motion.div>
                </AnimatePresence>
                <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black to-transparent z-20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-px bg-primary" />
                        <Lock className="w-8 h-8 text-white" />
                        <div className="flex flex-col items-start">
                            <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-400">Restricted Area</span>
                            <span className="text-xl font-playfair font-black italic">Unlock Full Content</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
