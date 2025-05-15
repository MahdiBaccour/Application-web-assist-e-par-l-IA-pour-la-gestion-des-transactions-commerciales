// components/CarouselSection.jsx
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import Image from 'next/image';

export default function CarouselSection({ 
  theme, 
  emblaRef, 
  scrollPrev, 
  scrollNext, 
  scrollTo, 
  selectedIndex, 
  carouselItems 
}) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="embla overflow-hidden relative" ref={emblaRef}>
          <div className="embla__container flex">
            {carouselItems.map((item, index) => (
              <div className="embla__slide flex-[0_0_100%] min-w-0" key={index}>
                <div className="relative h-96 rounded-2xl overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-8">
                    <h3 className="text-3xl font-bold text-white">{item.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className={`embla__prev absolute top-1/2 left-4 transform -translate-y-1/2 p-2 rounded-full bg-base-100/50 hover:bg-base-100`}
            onClick={scrollPrev}
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <button
            className={`embla__next absolute top-1/2 right-4 transform -translate-y-1/2 p-2 rounded-full bg-base-100/50 hover:bg-base-100`}
            onClick={scrollNext}
          >
            <FiArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-center mt-4 space-x-2">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === selectedIndex ? 'bg-primary' : 'bg-base-300'
              }`}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}