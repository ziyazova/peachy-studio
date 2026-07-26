import React from 'react';
import styled from 'styled-components';
import { RefreshCw, Shield, Clock, XCircle, CreditCard, Download, Archive, AlertTriangle, Mail } from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { Footer } from '../components/shared/Footer';

const Page = styled.div`
  min-height: 100vh;
  background: #fff;
  font-family: ${({ theme }) => theme.typography.fonts.primary};
`;

const Hero = styled.section`
  padding: 120px 32px 56px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.hairline};
  background:
    radial-gradient(ellipse at 20% 30%, rgba(99,102,241,0.06) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 70%, rgba(236,72,153,0.04) 0%, transparent 55%),
    #fff;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) { padding: 88px 20px 40px; }
`;

const HeroInner = styled.div`
  max-width: 760px;
  margin: 0 auto;
`;

const Kicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background: rgba(99,102,241,0.08);
  margin-bottom: 20px;

  svg { width: 12px; height: 12px; }
`;

const Title = styled.h1`
  font-size: 56px;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 16px;
  line-height: 1;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) { font-size: 40px; }
`;

const Lead = styled.p`
  font-size: 16px;
  line-height: 1.65;
  color: #444;
  margin: 0 0 24px;
  letter-spacing: -0.005em;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #999;
  flex-wrap: wrap;

  span + span::before {
    content: '·';
    margin-right: 16px;
    color: #ccc;
  }
`;

const Body = styled.section`
  padding: 48px 32px 96px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) { padding: 32px 20px 64px; }
`;

const BodyInner = styled.article`
  max-width: 760px;
  margin: 0 auto;
`;

const Section = styled.section`
  padding: 32px 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);

  &:first-child { padding-top: 8px; }
  &:last-child { border-bottom: none; }
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const SectionIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(135deg, rgba(237,228,255,0.7), rgba(232,237,255,0.5));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { width: 18px; height: 18px; color: ${({ theme }) => theme.colors.accent}; }
`;

const H2 = styled.h2`
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const P = styled.p`
  font-size: 14px;
  line-height: 1.65;
  color: #444;
  margin: 0 0 14px;

  &:last-child { margin-bottom: 0; }

  strong { color: ${({ theme }) => theme.colors.text.primary}; font-weight: 600; }
`;

const List = styled.ul`
  margin: 4px 0 14px;
  padding-left: 24px;

  li {
    font-size: 14px;
    line-height: 1.65;
    color: #444;
    margin-bottom: 8px;
  }
  strong { color: ${({ theme }) => theme.colors.text.primary}; font-weight: 600; }
`;

const ContactLink = styled.a`
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  border-bottom: 1px solid rgba(99,102,241,0.25);
  transition: border-color ${({ theme }) => theme.transitions.fast};
  &:hover { border-bottom-color: ${({ theme }) => theme.colors.accent}; }
`;

const Callout = styled.div`
  background: linear-gradient(135deg, rgba(99,102,241,0.05), rgba(236,72,153,0.03));
  border: 1px solid rgba(99,102,241,0.12);
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 18px 20px;
  margin: 8px 0 14px;

  p { font-size: 14px; line-height: 1.65; color: #333; margin: 0; }
  strong { color: ${({ theme }) => theme.colors.text.primary}; font-weight: 600; }
`;

export const RefundPage: React.FC = () => (
  <Page>
    <TopNav />

    <Hero>
      <HeroInner>
        <Kicker><RefreshCw /> Refunds &amp; cancellations</Kicker>
        <Title>Refund &amp; Cancellation Policy</Title>
        <Lead>
          How refunds, withdrawals, and cancellations work for Peachy Pro subscriptions
          and for one-time template purchases made directly on Peachy. If you bought a
          template on Etsy, Etsy's own refund policy applies — see section 7.
        </Lead>
        <MetaRow>
          <span>Last updated 18 April 2026</span>
          <span>Governed by Swedish law</span>
        </MetaRow>
      </HeroInner>
    </Hero>

    <Body>
      <BodyInner>
        <Section>
          <SectionHead>
            <SectionIcon><CreditCard /></SectionIcon>
            <H2>1. Who you're paying</H2>
          </SectionHead>
          <P>
            Payments on Peachy are processed by <strong>Polar Software Inc.</strong>, acting as
            our Merchant of Record (MoR). Your card statement will show a charge like
            <strong> POLAR*PEACHY</strong>. Polar handles VAT / sales tax, invoices, and
            chargeback disputes on our behalf.
          </P>
          <P>
            We (Peachy Studio) remain responsible for the service you receive, for honouring
            this policy, and for meeting our obligations under EU consumer law.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><Shield /></SectionIcon>
            <H2>2. Your 14-day right of withdrawal (EU consumers)</H2>
          </SectionHead>
          <P>
            Under the EU Consumer Rights Directive, consumers in the EU have a right to withdraw
            from a distance contract within <strong>14 days</strong> without giving a reason. By
            default, this right applies to both Pro subscriptions and one-time template purchases.
          </P>
          <P>
            <strong>Important — the waiver:</strong> Peachy Pro unlocks immediately after payment,
            and template downloads are delivered instantly. At checkout we ask you to tick a box
            acknowledging that:
          </P>
          <Callout>
            <p>
              <strong>"I consent to immediate performance and acknowledge that I will lose my
              14-day right of withdrawal once the service begins / the download starts."</strong>
            </p>
          </Callout>
          <P>
            If you tick this box, the statutory 14-day withdrawal right no longer applies to
            that purchase. This is permitted under CRD Art. 16(m) and is standard for digital
            content delivered on demand.
          </P>
          <P>
            If you do <strong>not</strong> tick the box, you have 14 days from the date of purchase
            to withdraw by emailing <ContactLink href="mailto:yourpeachyplanner@gmail.com">yourpeachyplanner@gmail.com</ContactLink>{' '}
            — we will refund you in full within 14 days of receiving your notice, and your access
            will be revoked.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><Clock /></SectionIcon>
            <H2>3. Goodwill refund window (7 days after first payment)</H2>
          </SectionHead>
          <P>
            Beyond the statutory withdrawal right, we offer a goodwill refund to first-time
            subscribers. If within <strong>7 days</strong> of your first Pro payment you are
            unsatisfied for any reason, email us at{' '}
            <ContactLink href="mailto:yourpeachyplanner@gmail.com">yourpeachyplanner@gmail.com</ContactLink>{' '}
            and we'll refund that payment, no questions asked.
          </P>
          <P>
            This goodwill window applies only to the <strong>first</strong> Pro payment. Renewal
            payments are non-refundable — to stop them, cancel before the next billing date
            (section 4 below).
          </P>
          <P>
            For one-time template purchases: goodwill refunds are considered case-by-case if
            the template is materially not as described. Contact us within 14 days of purchase.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><XCircle /></SectionIcon>
            <H2>4. How to cancel your Pro subscription</H2>
          </SectionHead>
          <P>Two ways, both equivalent:</P>
          <List>
            <li>
              <strong>In the app:</strong> Settings → Subscription → <em>Cancel or manage
              subscription</em>. This opens the Polar customer portal in a new tab. Click
              <em> Cancel</em> and confirm.
            </li>
            <li>
              <strong>Footer link:</strong> the <em>Cancel subscription</em> link at the bottom
              of every page (for Pro users) opens the same portal directly.
            </li>
          </List>
          <P>
            Cancellation is effective at the <strong>end of your current billing period</strong>.
            You keep Pro access until that date (which is fair — you already paid for the period).
            No further charges are taken.
          </P>
          <P>
            You will receive a cancellation confirmation email from Polar. Keep it for your records.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><Archive /></SectionIcon>
            <H2>5. What happens to your widgets when you cancel or downgrade</H2>
          </SectionHead>
          <P>We grandfather everything you've already created. Specifically:</P>
          <List>
            <li><strong>Your widgets stay.</strong> We do not delete anything.</li>
            <li>
              <strong>Your embeds keep working in Notion (and anywhere else they're embedded)
              forever.</strong> Widget configuration is URL-encoded — they don't depend on an
              active Pro subscription to render.
            </li>
            <li>
              <strong>Pro-only widget styles keep working on existing embeds.</strong> You can
              still view, share, and use widgets in Pro styles you created while subscribed.
            </li>
            <li>
              <strong>You cannot create <em>new</em> widgets past the 3-widget free cap</strong>,
              and you cannot switch an existing widget to a Pro-only style until you resubscribe.
            </li>
          </List>
          <P>
            Resubscribe any time and the limits lift instantly.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><Download /></SectionIcon>
            <H2>6. One-time template purchases on Peachy (Polar)</H2>
          </SectionHead>
          <P>
            When you buy a Notion template directly on Peachy through Polar checkout, delivery is
            immediate — you'll receive a download link by email within about a minute of payment.
            At checkout you'll tick the waiver in section 2. Because the product is delivered at
            once, the 14-day withdrawal right is waived and refunds are not available once the
            download link has been sent.
          </P>
          <P>
            Exception — if the template does not work as described (broken links, missing pages,
            an error that makes it unusable), email us within 14 days and we will either fix the
            issue or refund you.
          </P>
          <P>
            Note: today, most templates on Peachy link out to Etsy for checkout. If you bought
            through Etsy, see section 7.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><AlertTriangle /></SectionIcon>
            <H2>7. Templates bought on Etsy</H2>
          </SectionHead>
          <P>
            When you click <strong>Buy on Etsy</strong> on a template page, the sale is processed
            by Etsy — Etsy is the seller of record. Their terms, privacy policy, and{' '}
            <ContactLink href="https://www.etsy.com/help/article/6503" target="_blank" rel="noopener noreferrer">
              Etsy Purchase Protection
            </ContactLink>
            {' '}apply. This Peachy Refund Policy does not cover Etsy purchases.
          </P>
          <P>
            For questions about an Etsy order, open a case with the seller (us) via Etsy's
            messaging system, or use Etsy's help center. Prices and VAT on Etsy may differ from
            prices shown on Peachy — Etsy handles regional pricing itself.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><RefreshCw /></SectionIcon>
            <H2>8. Chargebacks — please contact us first</H2>
          </SectionHead>
          <P>
            If you see a charge you don't recognise or are unhappy with, email{' '}
            <ContactLink href="mailto:yourpeachyplanner@gmail.com">yourpeachyplanner@gmail.com</ContactLink>{' '}
            before opening a chargeback with your bank. In almost every case we'll resolve it
            faster than your bank would (often within a day). Filing a chargeback without
            contacting us costs us a fixed fee even if we're not at fault, and it slows the
            resolution for you — email is better for both of us.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><Shield /></SectionIcon>
            <H2>9. Your other consumer rights</H2>
          </SectionHead>
          <P>
            Nothing in this policy limits rights you have under mandatory consumer-protection law
            in your country of residence. EU consumers retain a 2-year conformity right for digital
            content under Directive 2019/770 — if a subscription feature or template materially
            fails to match its description, we'll repair, replace, or refund.
          </P>
          <P>
            EU online dispute resolution:{' '}
            <ContactLink href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
              ec.europa.eu/consumers/odr
            </ContactLink>. We're not required to participate in alternative dispute resolution
            but will respond promptly to any ODR complaint.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><Mail /></SectionIcon>
            <H2>10. Contact</H2>
          </SectionHead>
          <P>
            Refund requests, cancellation help, or questions about this policy:{' '}
            <ContactLink href="mailto:yourpeachyplanner@gmail.com">yourpeachyplanner@gmail.com</ContactLink>.
            We aim to respond within 2 business days.
          </P>
        </Section>
      </BodyInner>
    </Body>

    <Footer />
  </Page>
);
