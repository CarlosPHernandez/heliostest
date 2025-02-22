import Image from 'next/image'

const testimonials = [
  {
    name: 'Gricelda Ortiz',
    location: 'Burlington, NC',
    image: '/images/testimonial 1.webp',
    quote: "I got 5 proposals from different sales people that were knocking in my neighborhood and the prices were all over the place. I gave Helios a try and was able to see my quote in minutes. It was super easy and headache free. I didn't have to worry about being pushed into making a purchase on the spot."
  },
  {
    name: 'Dylan Sorkin',
    location: 'Burlington, NC',
    image: '/images/testimonial2.webp',
    quote: "I was skeptical at first but the process was smooth and easy. After I placed my order Juan reached out to me and kindly went over the details of my system. The price did change but only by a couple hundred bucks, turns out I need a bit more panels because of my pool. Super happy, panels look great!"
  },
  {
    name: 'Monica Hernandez',
    location: 'Asheville, NC',
    image: '/images/testimonial3.webp',
    quote: "I only used helios to compare two quotes I had, but when I compared the price helios offered me and how fast and easy it was I decided to go with them instead. I never felt misled or pressured, they answered all my questions on the discovery call. Highly recommend it!"
  }
]

export function Testimonials() {
  return (
    <section className="py-8 sm:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Hear from our customers</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={testimonial.image}
                  alt={`Solar installation for ${testimonial.name}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={90}
                />
              </div>

              <div className="p-4 sm:p-6 text-center">
                <blockquote className="text-sm sm:text-base text-gray-800 mb-3 sm:mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-sm text-gray-500">
                  - {testimonial.name.split(' ')[0]}
                  <span className="text-xs text-gray-400 block mt-1">{testimonial.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 