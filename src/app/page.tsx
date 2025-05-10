
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Icons } from '@/components/icons';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ScrollAnimatedSection } from '@/components/scroll-animated-section';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    // Initial call to set scrollY in case the page loads scrolled
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax factors - adjust for desired effect strength
  const parallaxFactorIcon = 0.3;
  const parallaxFactorImage = 0.15;
  const parallaxFactorText = 0.1;
  const parallaxFactorHeroBg = 0.4;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden"> {/* Added overflow-x-hidden for safety with transforms */}
        <section 
          className="container relative grid items-center gap-6 pb-12 pt-8 md:py-16 min-h-[80vh] md:min-h-screen place-content-center"
        >
          <div
            className="absolute inset-0 opacity-5 dark:opacity-[0.03] pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <div 
              className="absolute top-0 left-0 w-full h-[200%]"
              style={{ transform: `translateY(-${scrollY * parallaxFactorHeroBg}px)` }}
            >
              {/* Decorative background pattern or large blurred icons */}
              <Icons.AppLogo className="absolute -top-1/4 left-1/4 h-[500px] w-[500px] text-primary blur-2xl" />
              <Icons.Wallet className="absolute top-1/4 -right-1/4 h-[400px] w-[400px] text-accent blur-2xl transform rotate-12" />
               <Icons.Users className="absolute bottom-1/4 left-1/4 h-[300px] w-[300px] text-secondary blur-2xl transform -rotate-6" />
            </div>
          </div>

          <div
            className="relative z-10 mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center"
            style={{ transform: `translateY(${scrollY * parallaxFactorText * 0.5}px)` }}
          >
            <Icons.Wallet
              className="h-20 w-20 text-primary transition-transform duration-300 hover:scale-110"
              data-ai-hint="wallet security"
              style={{ transform: `translateY(-${scrollY * parallaxFactorIcon * 0.3}px) rotate(${scrollY * 0.03}deg)` }}
            />
            <h1 className="text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              ΣMFIRE <span className="text-primary">By MintFire</span>
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl md:text-2xl">
              Your Multi-Signature Wallet Solution. Create, manage, and secure your digital assets with M-of-N multi-signature wallets, enhanced with AI-powered transaction risk assessment.
            </p>
          </div>
          <div
            className="relative z-10 mx-auto flex w-full max-w-sm items-center justify-center space-x-4 mt-6"
            style={{ transform: `translateY(${scrollY * parallaxFactorText * 0.8}px)` }}
          >
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Link href="/signin">
                <span className="inline-flex items-center">
                  <Icons.Login className="mr-2 h-5 w-5" />
                  Sign In & Get Started
                </span>
              </Link>
            </Button>
          </div>
        </section>

        <section className="container py-16 md:py-24">
          <ScrollAnimatedSection animationClassName="animate-fadeInUp" threshold={0.2} className="mb-12 text-center">
             <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Features</h2>
             <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Empowering you with secure and flexible control over your digital assets.</p>
          </ScrollAnimatedSection>
          <div className="grid gap-8 md:grid-cols-3">
            <ScrollAnimatedSection animationClassName="animate-fadeInUp" threshold={0.3}>
              <div className="flex flex-col items-center text-center p-8 bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                <Icons.Users className="h-16 w-16 text-accent mb-6" />
                <h3 className="text-2xl font-semibold mb-3">M-of-N Signatures</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Require multiple owner approvals for transactions, enhancing security and control over your funds.
                </p>
              </div>
            </ScrollAnimatedSection>
            <ScrollAnimatedSection animationClassName="animate-fadeInUp-delay-200" threshold={0.3}>
              <div className="flex flex-col items-center text-center p-8 bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                <Icons.Proposal className="h-16 w-16 text-accent mb-6" />
                <h3 className="text-2xl font-semibold mb-3">Flexible Proposals</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Propose ETH transfers or smart contract interactions, with clear confirmation tracking.
                </p>
              </div>
            </ScrollAnimatedSection>
            <ScrollAnimatedSection animationClassName="animate-fadeInUp-delay-400" threshold={0.3}>
              <div className="flex flex-col items-center text-center p-8 bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                <Icons.Risk className="h-16 w-16 text-accent mb-6" />
                <h3 className="text-2xl font-semibold mb-3">AI Risk Assessment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Leverage AI to flag potentially risky transactions, providing an extra layer of diligence for owners. (Via AI Oracle)
                </p>
              </div>
            </ScrollAnimatedSection>
          </div>
        </section>
        
        <section className="container py-16 md:py-24">
           <ScrollAnimatedSection animationClassName="animate-fadeInUp" threshold={0.1}>
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
              <div className="lg:w-1/2 relative order-2 lg:order-1">
                 <div 
                    className="rounded-xl shadow-2xl overflow-hidden aspect-[4/3]"
                    style={{ transform: `translateY(-${Math.min(scrollY * parallaxFactorImage, 50)}px) perspective(1000px) rotateY(${Math.min(scrollY * -0.01, 5)}deg)` }}
                 >
                    <Image 
                        src="https://picsum.photos/800/600?random=1" 
                        alt="Abstract representation of digital security" 
                        width={800} 
                        height={600} 
                        className="rounded-xl object-cover w-full h-full"
                        data-ai-hint="blockchain security"
                    />
                 </div>
              </div>
              <div className="lg:w-1/2 text-center lg:text-left order-1 lg:order-2"
                   style={{ transform: `translateY(${Math.min(scrollY * parallaxFactorText * 0.2, 20)}px)` }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for Security and Ease of Use</h2>
                <p className="max-w-[600px] text-muted-foreground mb-8 mx-auto lg:mx-0 text-lg leading-relaxed">
                  ΣMFIRE By MintFire aims to simplify the complexities of multi-signature wallets while providing robust security features. Our clean interface and intuitive workflow make managing shared assets straightforward.
                </p>
                <Button variant="outline" asChild className="shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <Link href="/signin">Learn More & Sign In</Link>
                </Button>
              </div>
            </div>
           </ScrollAnimatedSection>
        </section>
        
        <section className="bg-card py-16 md:py-24">
          <div className="container">
            <ScrollAnimatedSection animationClassName="animate-fadeInUp" threshold={0.2}>
              <div className="text-center max-w-3xl mx-auto">
                <Icons.Risk className="h-20 w-20 text-primary mx-auto mb-8" data-ai-hint="shield protection" />
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Assets, Fortified</h2>
                <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
                  With ΣMFIRE By MintFire, experience a new standard in collaborative asset management. Secure, transparent, and intelligent.
                </p>
                <Button size="lg" asChild className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Link href="/dashboard/manage-wallets">
                    <Icons.Briefcase className="mr-2 h-5 w-5" /> Access Your Dashboard
                  </Link>
                </Button>
              </div>
            </ScrollAnimatedSection>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}

