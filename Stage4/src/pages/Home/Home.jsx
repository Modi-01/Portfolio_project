import { useEffect } from "react";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import Benefits from "../../components/Benefits/Benefits";
import MealPlans from "../../components/MealPlans/MealPlans";
import Testimonials from "../../components/Testimonials/Testimonials";
import FAQ from "../../components/FAQ/FAQ";
import Footer from "../../components/Footer/Footer";

function Home() {
  useEffect(() => {
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <Benefits />
      <MealPlans />
      <Testimonials />
      <FAQ />
      <Footer />
    </>
  );
}

export default Home;