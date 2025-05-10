
import { Icons } from '@/components/icons';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-20 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Icons.AppLogo className="h-6 w-6 text-primary" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {currentYear} ΣMFIRE By MintFire. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-2">
           {/* Optional: Add social links or other footer links here */}
           <a href="https://github.com/avik-root/EMFIRE" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
             <Icons.ExternalLink className="h-5 w-5 text-muted-foreground hover:text-foreground" />
           </a>
        </div>
      </div>
    </footer>
  );
}

