export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="/" className="nav-logo" style={{ marginBottom: '16px' }}>
              <div className="nav-logo-icon">T</div>
              TeamUp
            </a>
            <p>
              TeamUp helps teams work faster, smarter and more efficiently,
              delivering the visibility and data-driven insights to mitigate
              risk and ensure compliance.
            </p>
            <div className="footer-contact">
              <a href="mailto:hello@teamup.com">✉ hello@teamup.com</a>
              <a href="tel:+621987654321">📞 +621 987 654 321</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Solution</h4>
            <ul>
              <li><a href="#">Why TeamUp</a></li>
              <li><a href="#">Features</a></li>
              <li><a href="#">OpenAI</a></li>
              <li><a href="#">Technology</a></li>
              <li><a href="#">Security</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customers</h4>
            <ul>
              <li><a href="#">Procurement</a></li>
              <li><a href="#">Sales</a></li>
              <li><a href="#">Legal</a></li>
              <li><a href="#">Medium</a></li>
              <li><a href="#">Enterprise</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="/pricing">Pricing</a></li>
              <li><a href="#">Contact Sales</a></li>
              <li><a href="#">Changelog</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© Copyright 2024 TeamUp. All rights reserved.</p>
          <div className="footer-socials">
            <a href="#" className="footer-social-btn">𝕏</a>
            <a href="#" className="footer-social-btn">in</a>
            <a href="#" className="footer-social-btn">ig</a>
            <a href="#" className="footer-social-btn">▶</a>
          </div>
        </div>
      </div>
    </footer>
  );
}