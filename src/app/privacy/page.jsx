import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = { title: "Privacy Policy | Accord Tours & Travels" };

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-heading mb-3 text-[1.1rem] font-bold text-slate-800">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="1 September 2026">
      <Section title="1. Introduction">
        <p>
          This Privacy Policy explains how Accord Tours &amp; Travels ("we", "us") collects, uses
          and protects the personal information you share with us when you book a cab, browse
          this website, or contact us.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Your name, phone number and email address, provided when you make a booking.</li>
          <li>Trip details — pickup/drop locations, dates, times and vehicle preference.</li>
          <li>Feedback and ratings you submit after a completed trip.</li>
          <li>Basic technical information (browser type, device, approximate location) collected automatically to help the website run and to secure it against abuse.</li>
          <li>Payment-related information, once online payments are enabled — handled directly by our payment gateway partner and not stored on our own servers.</li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>To confirm, manage and fulfil your booking, including assigning a driver and vehicle.</li>
          <li>To contact you about your booking status, or with important updates.</li>
          <li>To request feedback after your trip, and — only with your explicit submission — to display an approved summary of that feedback as a testimonial.</li>
          <li>To improve our services, fleet planning and customer support.</li>
          <li>To meet legal, tax and regulatory record-keeping requirements.</li>
        </ul>
      </Section>

      <Section title="4. How We Share Your Information">
        <p>
          We do not sell your personal information. We share it only with: our driver assigned to
          your trip (name, phone, pickup details); our email/SMS/WhatsApp delivery providers,
          solely to send booking and feedback messages; our payment gateway partner, once online
          payments are enabled, solely to process that transaction; and government authorities
          where required by law.
        </p>
      </Section>

      <Section title="5. Data Retention">
        <p>
          Booking records are retained for as long as needed to fulfil the service, resolve
          disputes, and meet accounting/tax obligations, after which they are archived or deleted.
          Feedback that has been approved as a public testimonial is retained until you request its
          removal.
        </p>
      </Section>

      <Section title="KYC Documents">
        <p>
          For cab bookings, we collect an Aadhaar card photo for KYC verification. The document is stored privately outside the public website, is used only for booking verification, and is scheduled for deletion within 30 days after the end of the trip.
        </p>
      </Section>

      <Section title="6. Your Choices">
        <p>
          You can ask us to correct inaccurate details, request a copy of the information we hold
          about you, ask us to remove a testimonial, or opt out of feedback requests, by contacting
          us using the details below.
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          This website uses only the minimal technical storage needed for it to function (such as
          keeping you signed in to the admin panel). We do not use third-party advertising
          cookies.
        </p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>
          We may update this Privacy Policy periodically. Material changes will be reflected here
          with an updated date.
        </p>
      </Section>

      <Section title="9. Contact Us">
        <p>
          Accord Tours &amp; Travels, OMBR Layout, Bengaluru – 560043, Karnataka, India
          <br />
          Phone/WhatsApp: +91 81235 52002 · Email: info@accordtoursandtravels.com
        </p>
      </Section>
    </LegalLayout>
  );
}
