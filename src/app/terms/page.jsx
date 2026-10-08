import LegalLayout from "@/components/legal/LegalLayout";

export const metadata = { title: "Terms & Conditions | Accord Tours & Travels" };

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-heading mb-3 text-[1.1rem] font-bold text-slate-800">{title}</h2>
      {children}
    </section>
  );
}

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" updated="1 September 2026">
      <Section title="1. About Us">
        <p>
          Accord Tours &amp; Travels (operated by Jetmobility Private Limited) is a Bengaluru-based
          car rental company offering outstation, local, airport transfer and corporate travel
          services across Karnataka and other Indian cities. By booking a trip with us, whether
          through this website, phone, or WhatsApp, you agree to the terms below.
        </p>
      </Section>

      <Section title="2. Booking & Confirmation">
        <p>
          A booking request submitted through this website is provisional until our team confirms
          it — typically within 3 hours of submission. You will receive a call, SMS or email
          confirming the vehicle, driver and fare. Please double-check the pickup location, date
          and time in your confirmation; we are not responsible for delays caused by incorrect
          details supplied at the time of booking.
        </p>
      </Section>

      <Section title="3. Fares & Payment">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Quoted fares include fuel and driver charges unless stated otherwise.</li>
          <li>GST is charged extra at the applicable rate (currently 5%) on all bookings.</li>
          <li>Outstation trips are billed on actual kilometres run or the minimum daily kilometres, whichever is higher, plus applicable toll, parking and state permit charges.</li>
          <li>Driver Bata for outstation and multi-day trips is charged per trip day and shown upfront. Night Bata is a separate overnight allowance for applicable overnight stays between 9:00 PM and 6:00 AM.</li>
          <li>Payment can currently be made in cash or via UPI/bank transfer directly to our team. Online payment through the website will be enabled in a future update; where it is, the payment provider's own terms will also apply to that transaction.</li>
        </ul>
      </Section>

      <Section title="Toll & Airport Parking">
        <p>
          Toll charges are not included in the quoted trip fare. Customers may pay directly at the toll counter, or settle the actual toll after it is reflected in the FASTag statement. Airport parking charges, where applicable, are separate from the trip fare and are payable directly to the concerned authority.
        </p>
      </Section>

      <Section title="4. Cancellations & No-Shows">
        <p>
          You may cancel or reschedule a confirmed booking by calling us or writing in at least a
          few hours before the scheduled pickup for local/airport trips, and at least 24 hours
          before for outstation trips, to avoid a cancellation charge. A vehicle that has already
          been dispatched, or a no-show at the pickup point, may be charged in full at our
          discretion.
        </p>
      </Section>

      <Section title="5. Luggage & Passengers">
        <p>
          Each vehicle has a stated seating and luggage capacity shown on our Fleet page. Please
          book a vehicle suited to your group size and luggage; we reserve the right to refuse
          boarding or request an additional/larger vehicle if the load significantly exceeds what
          was booked.
        </p>
      </Section>

      <Section title="6. Conduct, Safety & Vehicle Condition">
        <p>
          Our vehicles carry standard safety equipment (GPS tracking, first-aid kit, fire
          extinguisher) and are maintained on a regular schedule. Passengers are expected to
          behave respectfully towards drivers and fellow passengers, follow seatbelt and safety
          instructions, and refrain from smoking, consuming alcohol, or carrying prohibited items
          inside the vehicle. We may end a trip without a refund if these terms are violated.
        </p>
      </Section>

      <Section title="7. Liability">
        <p>
          While we take reasonable care in vehicle maintenance and driver selection, Accord Tours
          &amp; Travels is not liable for delays, losses or damages arising from traffic
          conditions, weather, natural disasters, government restrictions, mechanical failure
          beyond our reasonable control, or the loss of personal belongings left in the vehicle.
          Any claim must be raised within 48 hours of the trip.
        </p>
      </Section>

      <Section title="8. Feedback & Testimonials">
        <p>
          After a completed trip, we may contact you by email or WhatsApp to request feedback.
          With your consent (via a star rating and comment you submit), a summary of your feedback
          may be featured as a testimonial on this website. You can request removal at any time by
          contacting us.
        </p>
      </Section>

      <Section title="9. Changes to These Terms">
        <p>
          We may update these Terms from time to time to reflect changes in our services or
          applicable law. The updated version will be posted on this page with a revised date.
        </p>
      </Section>

      <Section title="10. Contact Us">
        <p>
          Accord Tours &amp; Travels, OMBR Layout, Bengaluru – 560043, Karnataka, India
          <br />
          Phone/WhatsApp: +91 81235 52002 · Email: info@accordtoursandtravels.com
        </p>
      </Section>
    </LegalLayout>
  );
}
