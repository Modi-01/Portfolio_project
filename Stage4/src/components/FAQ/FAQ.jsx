import "./FAQ.css";

function FAQ() {
  return (
    <section className="faq">

      <div className="faq-title">
        <h2>Frequently Asked Questions</h2>
        <div className="title-line"></div>
      </div>

      <div className="faq-list">

        <div className="faq-item">
          <span>How do I change my meal selection?</span>
          <span>+</span>
        </div>

        <div className="faq-item">
          <span>Are the containers recyclable?</span>
          <span>+</span>
        </div>

        <div className="faq-item">
          <span>Can I pause my subscription?</span>
          <span>+</span>
        </div>

      </div>

    </section>
  );
}

export default FAQ;