import { useEffect } from 'react';
import { ShopProvider } from './shop.jsx';
import { MobileMenu, Nav, TopBar } from './components/Header.jsx';
import Hero, { Marquee } from './components/Hero.jsx';
import Mood from './components/Mood.jsx';
import Products from './components/Products.jsx';
import Builder from './components/Builder.jsx';
import Delivery from './components/Delivery.jsx';
import Club from './components/Club.jsx';
import ReviewsAndReminders from './components/Reviews.jsx';
import Footer, { Gallery } from './components/Footer.jsx';
import { Checkout, Drawer, Scrim, SearchOverlay, Toast } from './components/Overlays.jsx';

// fade sections in as they scroll into view
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function App() {
  useReveal();
  return (
    <ShopProvider>
      <TopBar />
      <Nav />
      <MobileMenu />
      <main id="top">
        <Hero />
        <Marquee />
        <Mood />
        <Products />
        <Builder />
        <Delivery />
        <Club />
        <ReviewsAndReminders />
        <Gallery />
      </main>
      <Footer />
      <Scrim />
      <Drawer />
      <Checkout />
      <SearchOverlay />
      <Toast />
    </ShopProvider>
  );
}
