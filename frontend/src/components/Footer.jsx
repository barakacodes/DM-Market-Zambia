import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">DM Market Zambia</h3>
          <p className="text-sm">Your trusted pan-African commerce super‑app.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-2">Quick Links</h4>
          <ul className="space-y-1 text-sm">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms & Privacy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-2">Contact</h4>
          <p className="text-sm">Lusaka, Zambia</p>
          <p className="text-sm">support@dmmarket.co.zm</p>
        </div>
      </div>
      <div className="border-t border-gray-700 text-center py-4 text-sm">
        &copy; {new Date().getFullYear()} DM Market Zambia. All rights reserved.
      </div>
    </footer>
  );
}
