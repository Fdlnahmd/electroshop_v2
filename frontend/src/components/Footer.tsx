import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/favicon.svg" alt="ElectroShop Logo" className="w-8 h-8" />
              <span className="font-bold text-xl tracking-tight">ElectroShop</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Pilihan terbaik untuk komponen elektronik, mikrokontroler, sensor, module IoT, dan berbagai alat pendukung elektronika berkualitas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Kategori</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link to="/?category=Arduino" className="hover:text-primary transition-colors">Arduino</Link></li>
              <li><Link to="/?category=IC" className="hover:text-primary transition-colors">IC</Link></li>
              <li><Link to="/?category=Sensor" className="hover:text-primary transition-colors">Sensor</Link></li>
              <li><Link to="/?category=Resistor" className="hover:text-primary transition-colors">Resistor</Link></li>
              <li><Link to="/?category=Kapasitor" className="hover:text-primary transition-colors">Kapasitor</Link></li>
              <li><Link to="/?category=LED" className="hover:text-primary transition-colors">LED</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><button className="hover:text-primary transition-colors">Help Center</button></li>
              <li><button className="hover:text-primary transition-colors">Track Order</button></li>
              <li><button className="hover:text-primary transition-colors">Returns & Refunds</button></li>
              <li><button className="hover:text-primary transition-colors">Contact Us</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Newsletter</h4>
            <p className="text-sm text-gray-500 mb-4">Subscribe for the latest product drops and updates.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary"
              />
              <button 
                type="submit" 
                className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Join
              </button>
            </form>
          </div>
          
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ElectroShop. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <button className="hover:text-gray-900">Privacy Policy</button>
            <button className="hover:text-gray-900">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
