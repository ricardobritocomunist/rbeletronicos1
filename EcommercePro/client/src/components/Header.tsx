import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/use-auth';

export default function Header() {
  const { state, toggleCart } = useCart();
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm fixed top-0 w-full z-30">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-black font-bold text-xl flex items-center">
          RB Eletrônicos
        </Link>
        
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex space-x-6">
            <Link 
              href="/" 
              className={`text-gray-700 hover:text-black transition-colors ${
                location === '/' ? 'text-black' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              href="/#products" 
              className="text-gray-700 hover:text-black transition-colors"
            >
              Produtos
            </Link>
            <Link 
              href="/#about" 
              className="text-gray-700 hover:text-black transition-colors"
            >
              Sobre
            </Link>
            <Link 
              href="/#contact" 
              className="text-gray-700 hover:text-black transition-colors"
            >
              Contato
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/profile">
                <Avatar className="h-8 w-8 border border-slate-200 hover:border-slate-300 transition-colors">
                  <AvatarFallback className="bg-black text-white">
                    {user.name ? user.name.substring(0, 2).toUpperCase() : user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-black focus:outline-none"
              aria-label="Shopping cart"
            >
              <i className="fas fa-shopping-cart text-xl"></i>
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {state.items.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Button>
          </div>
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden focus:outline-none"
                aria-label="Menu"
              >
                <i className="fas fa-bars text-xl"></i>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="py-4 space-y-6">
                {user && (
                  <div className="flex items-center mb-4 p-2 bg-slate-50 rounded-md">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback className="bg-black text-white">
                        {user.name ? user.name.substring(0, 2).toUpperCase() : user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name || user.username}</p>
                      <Link 
                        href="/profile"
                        className="text-sm text-gray-500 hover:text-black transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Ver perfil
                      </Link>
                    </div>
                  </div>
                )}

                <nav className="space-y-1">
                  <Link
                    href="/"
                    className="block py-2 text-gray-700 hover:text-black transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/#products"
                    className="block py-2 text-gray-700 hover:text-black transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Produtos
                  </Link>
                  <Link
                    href="/#about"
                    className="block py-2 text-gray-700 hover:text-black transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sobre
                  </Link>
                  <Link
                    href="/#contact"
                    className="block py-2 text-gray-700 hover:text-black transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contato
                  </Link>
                </nav>

                {!user && (
                  <div className="pt-2 border-t">
                    <Link
                      href="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full">
                        Login / Cadastro
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
