import { Github, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

const columns = [
  {
    title: 'Product',
    items: ['Features', 'Workflow', 'AI Engine', 'Pricing'],
  },
  {
    title: 'Resources',
    items: ['Documentation', 'Case Studies', 'Blog', 'Partners'],
  },
  {
    title: 'Company',
    items: ['About', 'Careers', 'Contact', 'Security'],
  },
  {
    title: 'Legal',
    items: ['Privacy', 'Terms', 'Cookies', 'Compliance'],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black py-10">
      <div className="section-shell">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-zinc-800 bg-[#080808] text-[14px] font-semibold text-[#E3B341]">
                R
              </div>
              <span className="text-[18px] font-semibold text-[#F0F6FC]">ReqGuard</span>
            </div>
            <p className="mt-4 max-w-xs text-[15px] leading-7 text-[#8B949E]">
              Intelligent requirement analysis for teams that want to reduce rework before development becomes expensive.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#E3B341]">{column.title}</h3>
              <ul className="mt-4 space-y-3 text-[15px] text-[#8B949E]">
                {column.items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-[#F0F6FC]">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-[#30363D] pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-[#8B949E]">© 2026 ReqGuard</p>
          <p className="text-[13px] text-[#8B949E]">Made by Param Shelke &amp; Team</p>
          <div className="flex items-center gap-3 text-[#8B949E]">
            {[Github, Linkedin, Twitter].map((Icon, index) => (
              <a key={index} href="#" aria-label="Social link" className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-[#080808] hover:border-[#E3B341] hover:text-[#E3B341]">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
