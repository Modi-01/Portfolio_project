import { useState } from "react";
import "./FAQ.css";

const QUESTIONS = [
  {
    question: "How do I change my meal selection?",
    answer:
      "You can update your weekly meal selection anytime before Thursday 11:59 PM from your dashboard. Changes made after that will apply to the following week.",
  },
  {
    question: "Are the containers recyclable?",
    answer:
      "Yes, all our packaging is 100% compostable and recyclable, designed to keep your meals fresh while minimizing environmental impact.",
  },
  {
    question: "Can I pause my subscription?",
    answer:
      "Absolutely. You can pause or skip any week from your account dashboard, no cancellation fees or commitments required.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq">

      <div className="faq-title">
        <h2>Frequently Asked Questions</h2>
        <div className="title-line"></div>
      </div>

      <div className="faq-list">

        {QUESTIONS.map((item, index) => (
          <div className="faq-item-wrap" key={item.question}>
            <div className="faq-item" onClick={() => toggle(index)} style={{ cursor: "pointer" }}>
              <span>{item.question}</span>
              <span>{openIndex === index ? "−" : "+"}</span>
            </div>
            {openIndex === index && (
              <p style={{ padding: "0 0 16px", color: "#5e5e5b", fontSize: "14px" }}>
                {item.answer}
              </p>
            )}
          </div>
        ))}

      </div>

    </section>
  );
}

export default FAQ;
