export default function TestimonialSection() {
  const testimonials = [
    {
      text: "The delivery was super fast and the premium smartphone I ordered works perfectly. Highly recommend this store for quality electronics!",
      name: "Michael T.",
      rating: 5
    },
    {
      text: "Great selection of products and competitive prices. The checkout process was smooth and I received my wireless earbuds in pristine condition.",
      name: "Sarah L.",
      rating: 4.5
    },
    {
      text: "Customer service was exceptional when I had questions about my order. The gaming console arrived earlier than expected and in perfect condition.",
      name: "David R.",
      rating: 5
    }
  ];

  return (
    <section id="about">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex text-amber-500 mb-4">
              {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                <i key={i} className="fas fa-star"></i>
              ))}
              {testimonial.rating % 1 !== 0 && (
                <i className="fas fa-star-half-alt"></i>
              )}
            </div>
            <p className="text-gray-600 mb-4">{testimonial.text}</p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-gray-500">
                <i className="fas fa-user"></i>
              </div>
              <div>
                <p className="font-medium text-gray-800">{testimonial.name}</p>
                <p className="text-sm text-gray-500">Verified Buyer</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
