import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    "Kurumsal": [
      { name: "Hakkımızda", path: "/about" },
      { name: "Kariyer", path: "/careers" },
      { name: "İletişim", path: "/contact" },
      { name: "Blog", path: "/blog" }
    ],
    "Müşteri Hizmetleri": [
      { name: "Sıkça Sorulan Sorular", path: "/faq" },
      { name: "Kargo Takip", path: "/shipping" },
      { name: "İade Politikası", path: "/returns" },
      { name: "Gizlilik Politikası", path: "/privacy" }
    ],
    "Kategoriler": [
      { name: "Elektronik", path: "/category/electronics" },
      { name: "Moda", path: "/category/fashion" },
      { name: "Ev & Yaşam", path: "/category/home-living" },
      { name: "Spor", path: "/category/sports" }
    ]
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        {/* Üst Kısım */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo ve Açıklama */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                ShopOrbit
              </span>
            </motion.div>
            <p className="text-gray-400">
              Alışverişin yeni boyutu ile tanışın. Binlerce ürün, yüzlerce marka tek bir yerde.
            </p>
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                <motion.a
                  key={social}
                  href={`https://${social}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="material-icons">{social}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Linkleri */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <motion.li key={link.name} whileHover={{ x: 3 }}>
                    <Link 
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Alt Kısım */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 ShopOrbit. Tüm hakları saklıdır.
            </p>
        
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
