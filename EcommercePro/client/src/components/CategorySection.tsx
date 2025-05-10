import { Link } from 'wouter';

export default function CategorySection() {
  const categories = [
    {
      name: 'Smartphones',
      icon: 'fas fa-mobile-alt',
      bgColor: 'bg-gray-100',
      iconColor: 'text-black'
    },
    {
      name: 'Laptops',
      icon: 'fas fa-laptop',
      bgColor: 'bg-gray-100',
      iconColor: 'text-black'
    },
    {
      name: 'Audio',
      icon: 'fas fa-headphones',
      bgColor: 'bg-gray-100',
      iconColor: 'text-black'
    },
    {
      name: 'Gaming',
      icon: 'fas fa-gamepad',
      bgColor: 'bg-gray-100',
      iconColor: 'text-black'
    }
  ];

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Popular Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <Link 
            href="/#products" 
            key={index} 
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-center"
          >
            <div className={`w-16 h-16 ${category.bgColor} rounded-full flex items-center justify-center mb-3`}>
              <i className={`${category.icon} ${category.iconColor} text-2xl`}></i>
            </div>
            <span className="text-gray-800 font-medium">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
