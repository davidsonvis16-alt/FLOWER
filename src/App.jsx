import { MotionConfig } from 'framer-motion';
import { ShopProvider } from './shop.jsx';
import { MobileMenu, Nav, TopBar } from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Mood from './components/Mood.jsx';
import Products from './components/Products.jsx';
import Builder from './components/Builder.jsx';
import Delivery from './components/Delivery.jsx';
import Club from './components/Club.jsx';
import { Reminders, Reviews } from './components/Reviews.jsx';
import Footer, { Gallery } from './components/Footer.jsx';
import { Account, Auth, Checkout, Drawer, Scrim, SearchOverlay, Toast } from './components/Overlays.jsx';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
    <ShopProvider>
      <TopBar />
      <Nav />
      <MobileMenu />
      <main id="top">
        <Hero />
        <Products />
        <Reviews />
        <Mood />
        <Builder />
        <Delivery />
        <Club />
        <Reminders />
        <Gallery />
      </main>
      <Footer />
      <Scrim />
      <Drawer />
      <Account />
      <Checkout />
      <Auth />
      <SearchOverlay />
      <Toast />
    </ShopProvider>
    </MotionConfig>
  );
}
