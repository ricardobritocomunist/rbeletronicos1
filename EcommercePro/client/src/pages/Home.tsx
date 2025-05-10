import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import TestimonialSection from "@/components/TestimonialSection";
import CartDrawer from "@/components/CartDrawer";

export default function Home() {
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <>
      <main className="container mx-auto px-4 pt-24 pb-16">
        <HeroSection />

        {/* Products Section */}
        <section id="products" className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">Featured Products</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black">
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Most Popular</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array(8)
                .fill(0)
                .map((_, index) => (
                  <div key={`skeleton-${index}`} className="bg-white rounded-xl shadow-sm p-4">
                    <Skeleton className="w-full h-48 rounded-md mb-4" />
                    <Skeleton className="w-3/4 h-6 rounded-md mb-2" />
                    <Skeleton className="w-full h-16 rounded-md mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="w-1/4 h-6 rounded-md" />
                      <Skeleton className="w-1/3 h-8 rounded-md" />
                    </div>
                  </div>
                ))
            ) : error ? (
              <div className="col-span-4 py-10 text-center">
                <p className="text-red-500">Error loading products. Please try again later.</p>
              </div>
            ) : (
              products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </section>

        <CategorySection />
        <TestimonialSection />
      </main>
      
      <CartDrawer />
    </>
  );
}
