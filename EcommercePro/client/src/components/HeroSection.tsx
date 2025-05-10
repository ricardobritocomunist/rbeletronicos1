import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-10 mb-12">
      <div className="bg-black rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Summer Tech Sale</h1>
            <p className="text-gray-300 mb-6">Get up to 40% off on the latest electronic gadgets. Limited time offer!</p>
            <Button 
              onClick={scrollToProducts} 
              variant="secondary"
              className="bg-white text-black font-semibold w-max hover:bg-gray-50 transition-colors"
            >
              Shop Now
            </Button>
          </div>
          
          <div className="md:w-1/2 p-8 flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
              alt="Collection of premium electronics" 
              className="rounded-xl shadow-lg w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
