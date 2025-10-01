export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 px-4 md:px-24 lg:px-24 2xl:px-32 pt-20 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-12">
          <div className="mb-10 md:mb-0 md:w-1/4 flex flex-col items-center md:items-start">
            <span className="text-5xl md:text-6xl font-extrabold tracking-wider text-white leading-tight">
              Talento
            </span>
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs ml-4 tracking-widest text-gray-400">
                AI-д суурилсан ажлын платформ
              </span>
            </div>
          </div>
          <div className="mb-8 md:mb-0  md:w-1/5">
            <h3 className="text-base font-semibold text-white mb-3">
              Холбоо барих
            </h3>
            <ul className="text-sm space-y-3">
              <li>
                📧 Email:{" "}
                <a
                  href="mailto:info@yourproject.mn"
                  className="hover:underline hover:text-white"
                >
                  talento@gmail.com
                </a>
              </li>
              <li>
                ☎️ Утас:{" "}
                <a
                  href="tel:+97689229921"
                  className="hover:underline hover:text-white"
                >
                  +976 8922-9921
                </a>
              </li>
              <li>📍 Байршил: Улаанбаатар, Монгол</li>
            </ul>
          </div>
          <div className="mb-8 md:mb-0 md:w-1/5">
            <h3 className="text-base font-semibold text-white mb-3">
              Нийгмийн сүлжээ
            </h3>
            <ul className="text-sm space-y-3">
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-white"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-white"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-white"
                >
                  Instagram
                </a>{" "}
                /{" "}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-white"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
          <div className="md:w-1/5">
            <h3 className="text-base font-semibold text-white mb-3">
              Хууль, журам
            </h3>
            <ul className="text-sm space-y-3">
              <li>
                <a href="/terms" className="hover:underline hover:text-white">
                  Хэрэглэх нөхцөл
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:underline hover:text-white">
                  Хувийн мэдээлэл хамгаалах бодлого
                </a>
              </li>
              <li>
                <a href="/cookie" className="hover:underline hover:text-white">
                  Cookie policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 my-10"></div>
        <div className="text-center text-gray-500 text-xs font-light">
          © {new Date().getFullYear()} Talento. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
};
