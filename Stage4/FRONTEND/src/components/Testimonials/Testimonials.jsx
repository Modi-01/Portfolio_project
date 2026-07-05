import "./Testimonials.css";
import avatar from "../../assets/avatar.png";

function Testimonials() {
  return (
    <section className="testimonials">

      <div className="testimonial-left">

        <h2>
          What our community
          <br />
          is saying
        </h2>

        <div className="quote-mark">❞</div>

        <div className="main-card">

          <p className="review">
            "Quiet Premium didn't just save me 10 hours of
            cooking every week—it actually changed how I
            feel. My energy levels are stable throughout
            the day, and I finally have a relationship with
            food that isn't stressful."
          </p>

          <div className="profile">

            <img src={avatar} alt="Elena" />

            <div>

              <h4>Elena Rodriguez</h4>

              <span>Product Manager at TechFlow</span>

            </div>

          </div>

        </div>

      </div>

      <div className="testimonial-right">

        <div className="small-card">
          <p>
            "The muscle gain plan is the first one that actually
            gives me enough clean calories."
          </p>

          <strong>James L.</strong>
        </div>

        <div className="small-card">
          <p>
            "The salmon bowls are better than most high-end
            restaurants in the city."
          </p>

          <strong>Marcus K.</strong>
        </div>

        <div className="small-card">
          <p>
            "I've lost 8kg without feeling hungry.
            The meals are incredible."
          </p>

          <strong>Sarah M.</strong>
        </div>

      </div>

    </section>
  );
}

export default Testimonials;