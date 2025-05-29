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
                <div className="relative h-[40rem] rounded-2xl overflow-hidden px-2 py-4">
                  <div className="relative w-full h-full transform scale-100 hover:scale-105 transition-transform duration-500">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transform-gpu"
                      style={{ transform: 'scale(0.9)' }}
                      priority={index === 0}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black p-8">
                      <h3 className="text-3xl font-bold text-white">{item.title}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className={`embla__prev absolute top-1/2 left-8 transform -translate-y-1/2 p-3 rounded-full bg-base-100/50 hover:bg-base-100 transition-all`}
            onClick={scrollPrev}
          >
            <FiArrowLeft className="w-8 h-8" />
          </button>
          <button
            className={`embla__next absolute top-1/2 right-8 transform -translate-y-1/2 p-3 rounded-full bg-base-100/50 hover:bg-base-100 transition-all`}
            onClick={scrollNext}
          >
            <FiArrowRight className="w-8 h-8" />
          </button>
        </div>

        <div className="flex justify-center mt-6 space-x-3">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              className={`w-4 h-4 rounded-full transition-all ${
                index === selectedIndex ? 'bg-primary scale-125' : 'bg-base-300'
              }`}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}