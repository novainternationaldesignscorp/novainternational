import React, { useState, useEffect, useRef } from "react";
import "./billboard.css";

const Billboard = () => {
  const slides = [
    { type: "image", src: "/images/Blue-Dress-1-nova-international.jpg" },
    { type: "image", src: "/images/Blue-Dress-2-nova-international.jpg" },
    { type: "image", src: "/images/red-clutch.png" },
    { type: "image", src: "/images/brown-dress-1-nova-international.jpg" },
    { type: "image", src: "/images/brown-dress-2-nova-international.jpg" },
    { type: "image", src: "/images/bladeless-fan-novainternationaldesigns.png" },
    { type: "image", src: "/images/Blue-Dress-3-nova-international.jpg" },
    { type: "image", src: "/images/golden-clutch.png" },
    { type: "image", src: "/images/brown-dress-3-nova-international.jpg" },
    { type: "image", src: "/images/Baby-monitor-blue.png" },
    { type: "image", src: "/images/brown-dress-4-nova-international.jpg" },
    { type: "image", src: "/images/Blue-Dress-4-nova-international.jpg" },
    { type: "image", src: "/images/magenta-clutch2.png" },
    { type: "image", src: "/images/chura-box.png" },
    { type: "image", src: "/images/digital-photoframe.png" },
    { type: "image", src: "/images/Blue-Dress-5-nova-international.jpg" },
    { type: "image", src: "/images/gittery-gold-clutch.png" },
    { type: "image", src: "/images/chura-box-closed-logo.png" },
    { type: "image", src: "/images/silver-clutch.png" },
    { type: "image", src: "/images/Blue-Dress-6-nova-international.jpg" },
    { type: "image", src: "/images/vaccum-sealing-machine-by-Nova-International-Designs-Corporation.png" },  
    { type: "image", src: "/images/robot.png" },
    { type: "image", src: "/images/light.png" },  
    { type: "video", src: "/videos/Robot-final.mp4" },
    { type: "video", src: "/videos/campfire-speaker-black-logo.mp4" },
    { type: "video", src: "/videos/Bladeless-fan-final.mp4" },
    { type: "video", src: "/videos/SeasonsGreeting3.mp4" },  
  ];

  // Clone first and last slide for seamless loop
  const extendedSlides = [slides[slides.length - 1], ...slides, slides[0]];

  const [index, setIndex] = useState(1); // Start at first real slide
  const [transition, setTransition] = useState(true);
  const timeoutRef = useRef(null);
  const videoRefs = useRef([]);

  const delay = 3000;

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const goNext = () => setIndex((prev) => prev + 1);
  const goPrev = () => setIndex((prev) => prev - 1);

  // Pause all videos safely
  const pauseAllVideos = () => {
    videoRefs.current.forEach((video) => {
      if (video && !video.paused) {
        video.pause();
        video.currentTime = 0;
      }
    });
  };

  // Auto-slide & play videos safely
  useEffect(() => {
    resetTimeout();
    pauseAllVideos();

    const currentSlide = extendedSlides[index];

    if (currentSlide.type === "image") {
      timeoutRef.current = setTimeout(goNext, delay);
    } else if (currentSlide.type === "video") {
      const video = videoRefs.current[index];
      if (video) {
        video.currentTime = 0;
        // Safely handle play promise
        video.play().catch((err) => {
          // Ignore AbortError (expected if paused immediately)
          if (err.name !== "AbortError") console.error(err);
        });
      }
    }

    return () => resetTimeout();
  }, [index]);

  // Handle seamless loop
  const handleTransitionEnd = () => {
    if (index === 0) {
      setTransition(false);
      setIndex(slides.length);
    } else if (index === extendedSlides.length - 1) {
      setTransition(false);
      setIndex(1);
    }
  };

  // Re-enable transition after jump
  useEffect(() => {
    if (!transition) {
      const t = setTimeout(() => setTransition(true), 20);
      return () => clearTimeout(t);
    }
  }, [transition]);

  return (
    <div className="billboard-container">
      {/* SLIDES */}
      <div
        className="billboard-inner"
        style={{
          transform: `translateX(-${index * 100}%)`,
          transition: transition ? "transform 0.5s ease" : "none",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedSlides.map((slide, i) => (
          <div className="billboard-item" key={i}>
            {slide.type === "image" ? (
              <img src={slide.src} alt={`Slide ${i}`} />
            ) : (
              <video
                ref={(el) => (videoRefs.current[i] = el)}
                src={slide.src}
                controls
                onEnded={goNext}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* BUTTONS */}
      <button
        className="arrow left"
        onClick={() => {
          pauseAllVideos();
          goPrev();
        }}
      >
        ❮
      </button>
      <button
        className="arrow right"
        onClick={() => {
          pauseAllVideos();
          goNext();
        }}
      >
        ❯
      </button>

      {/* DOTS */}
      <div className="dots">
        {slides.map((_, i) => {
          const dotIndex = i + 1; // Adjust for cloned slide
          return (
            <div
              key={i}
              className={`dot ${index === dotIndex ? "active" : ""}`}
              onClick={() => {
                pauseAllVideos();
                setIndex(dotIndex);
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default Billboard;
