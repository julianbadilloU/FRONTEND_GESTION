import { Dog, Mail } from "lucide-react";
import Link from "next/link";

// --- Custom Social Icons as SVGs (Fix for missing lucide brand icons) ---
const FacebookIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ size = 16, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export function AlbergueFooter() {
  return (
    <footer className="bg-[#d5e4cb] border-t border-[#c3d9b5] px-6 py-5 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-gray-700">
          <Dog size={16} className="text-[#5e924e]" />
          <span className="font-bold text-sm tracking-tight">FurMatch</span>
        </Link>

        {/* Contact */}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="font-medium">Contact Us</span>
          <span className="text-gray-400">|</span>
          <Mail size={14} className="text-gray-500 shrink-0" />
          <span>info@furmatchcom</span>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-2">
          {[FacebookIcon, InstagramIcon, TwitterIcon].map((Icon, i) => (
            <button
              key={i}
              className="w-7 h-7 rounded-full border border-[#a9c99a] flex items-center justify-center text-gray-500 hover:bg-[#a9c99a] hover:text-white transition-colors"
            >
              <Icon size={13} />
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
