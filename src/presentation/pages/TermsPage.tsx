import React from 'react';
import styled from 'styled-components';
import { FileText, UserCheck, Shield, Ban, Layers, Link2, CreditCard, Activity, XCircle, AlertCircle, FileEdit, Scale, Mail } from 'lucide-react';
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

export const TermsPage: React.FC = () => (
  <Page>
    <TopNav />

    <Hero>
      <HeroInner>
        <Kicker><FileText /> Legal</Kicker>
        <Title>Terms of Use</Title>
        <Lead>
          The agreement between you and Peachy Studio when you use our service to create widgets
          and embed them in Notion. Please read these carefully.
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
          <SectionIcon><UserCheck /></SectionIcon>
          <H2>1. Eligibility</H2>
        </SectionHead>
        <P>
          You must be at least 16 years old to use Peachy. By using the service you confirm that you
          meet this requirement and that the information you provide is accurate.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Shield /></SectionIcon>
          <H2>2. Your account</H2>
        </SectionHead>
        <List>
          <li>You are responsible for keeping your login credentials secure.</li>
          <li>You must not share your account or use another user's account without permission.</li>
          <li>You must notify us if you become aware of any unauthorised use of your account.</li>
        </List>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Ban /></SectionIcon>
          <H2>3. Acceptable use</H2>
        </SectionHead>
        <P>When using Peachy you agree not to:</P>
        <List>
          <li>Use the service for any unlawful, fraudulent, harmful or abusive purpose.</li>
          <li>Upload or embed content that is illegal, defamatory, infringing, or violates the rights of others.</li>
          <li>Attempt to probe, scan, or test the vulnerability of the service or bypass any authentication.</li>
          <li>Reverse engineer, decompile, or attempt to extract the source code of Peachy, beyond what is permitted by law.</li>
          <li>Interfere with the operation of Peachy, including by sending excessive requests or disrupting other users.</li>
        </List>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Layers /></SectionIcon>
          <H2>4. Your content</H2>
        </SectionHead>
        <P>
          You retain all rights to the widgets and content you create in Peachy ("Your Content").
          By using the service, you grant us a limited, worldwide, non-exclusive licence to host,
          display, and deliver Your Content solely for the purpose of providing the service to you
          (for example, rendering your widget inside Notion through an embed URL).
        </P>
        <P>You are responsible for Your Content and must ensure you have the right to use it.</P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><FileText /></SectionIcon>
          <H2>5. Our intellectual property</H2>
        </SectionHead>
        <P>
          The Peachy name, logo, website, and the underlying software are the property of
          Peachy Studio. Nothing in these terms grants you ownership of any of them.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Link2 /></SectionIcon>
          <H2>6. Third-party services</H2>
        </SectionHead>
        <P>
          Peachy uses third-party providers (for example Supabase, Vercel, and Google) to operate.
          When you embed a widget in Notion, you are also subject to Notion's terms. We are not
          responsible for third-party services or their content.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><CreditCard /></SectionIcon>
          <H2>7. Paid plans and subscriptions</H2>
        </SectionHead>

        <P><strong>Peachy Pro</strong> is a recurring monthly subscription at $4/month (or the local
        currency equivalent at purchase time). It unlocks unlimited widgets and Pro-only widget styles.</P>

        <P>
          <strong>Merchant of Record.</strong> Payments are processed by{' '}
          <strong>Polar Software Inc.</strong>, acting as our reseller and Merchant of Record. Polar
          collects and remits all applicable VAT, GST, and sales tax on our behalf. Your card
          statement will show a charge like <strong>POLAR*PEACHY</strong>. Polar's own{' '}
          <ContactLink href="https://polar.sh" target="_blank" rel="noopener noreferrer">terms</ContactLink>{' '}
          apply to the payment transaction itself; these Peachy Terms apply to the service you receive.
        </P>

        <P>
          <strong>Automatic renewal.</strong> Your subscription renews every month at the then-current
          price until you cancel. We will not change the price during an active billing period without
          at least 30 days' advance notice and an opportunity to cancel before the new price applies.
        </P>

        <P>
          <strong>14-day right of withdrawal — and the waiver.</strong> Under the EU Consumer Rights
          Directive, consumers have 14 days to withdraw from a distance contract. Because Pro access
          begins immediately after payment, at checkout we ask you to tick a box confirming:{' '}
          <em>"I consent to immediate performance and acknowledge that I will lose my 14-day right
          of withdrawal once the service begins."</em> Ticking the box waives the statutory withdrawal
          right (CRD Art. 16(m)). If you do not tick it, you keep the 14-day right. See our{' '}
          <ContactLink href="/refund">Refund &amp; Cancellation Policy</ContactLink> for details.
        </P>

        <P>
          <strong>Cancellation.</strong> You may cancel at any time from Settings → Subscription, or
          from the persistent <em>Cancel subscription</em> link in the site footer when signed in as
          Pro. Both open Polar's customer portal where the cancellation is processed. After cancelling,
          Pro access continues until the end of the current billing period — no further charges are
          taken.
        </P>

        <P>
          <strong>What happens when Pro ends (cancel or downgrade).</strong> Your widgets stay. Existing
          embeds — including those using Pro-only styles — keep rendering forever (widget configuration
          is URL-encoded, so there is no ongoing hosting cost). You will not be able to create{' '}
          <em>new</em> widgets past the 3-widget free limit, and you cannot switch an existing widget
          to a Pro-only style until you resubscribe.
        </P>

        <P>
          Refund rules and dispute handling are covered in our{' '}
          <ContactLink href="/refund">Refund Policy</ContactLink>.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Activity /></SectionIcon>
          <H2>8. Service availability</H2>
        </SectionHead>
        <P>
          We aim for Peachy to be available at all times but do not guarantee uninterrupted access.
          The service is provided on an "as is" and "as available" basis. We may modify, suspend,
          or discontinue features at any time, with reasonable notice where possible.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><XCircle /></SectionIcon>
          <H2>9. Termination</H2>
        </SectionHead>
        <P>
          You can stop using Peachy and delete your account at any time from your account settings.
          We may suspend or terminate your account if you breach these terms or use the service in a
          way that harms us or other users.
        </P>
        <P>
          On termination your widgets and profile are removed from our systems as described in our{' '}
          <ContactLink href="/privacy">Privacy Policy</ContactLink>.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><AlertCircle /></SectionIcon>
          <H2>10. Disclaimer and liability</H2>
        </SectionHead>
        <P>
          To the maximum extent permitted by law, Peachy is provided without warranties of any kind,
          either express or implied. We are not liable for any indirect, incidental, or consequential
          damages arising out of your use of the service. Nothing in these terms limits liability for
          matters that cannot be excluded under applicable law.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><FileEdit /></SectionIcon>
          <H2>11. Changes to these terms</H2>
        </SectionHead>
        <P>
          We may update these terms from time to time. If we make material changes, we will update the
          "Last updated" date above and, where appropriate, notify you by email or inside the product
          before the changes take effect.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Scale /></SectionIcon>
          <H2>12. Governing law and consumer protection</H2>
        </SectionHead>
        <P>
          These terms are governed by the laws of Sweden. Any disputes will be resolved in the
          competent courts of Stockholm, Sweden.
        </P>
        <P>
          <strong>EU consumers</strong> retain the protection of mandatory consumer-protection
          rules of their country of residence — nothing in this clause overrides those rights.
          If you bought as a consumer in the EU, you may also bring an action in the courts of
          your home country.
        </P>
        <P>
          <strong>EU online dispute resolution:</strong> the European Commission hosts an
          online dispute resolution platform at{' '}
          <ContactLink href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            ec.europa.eu/consumers/odr
          </ContactLink>.
          We prefer to resolve complaints directly — please email us first at{' '}
          <ContactLink href="mailto:yourpeachyplanner@gmail.com">yourpeachyplanner@gmail.com</ContactLink>.
        </P>
        <P>
          Additional disclosures required under the e-Commerce Directive (operator identity,
          registration, supervisory authority) are listed in our{' '}
          <ContactLink href="/legal">Legal Notice</ContactLink>.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Mail /></SectionIcon>
          <H2>13. Contact</H2>
        </SectionHead>
        <P>
          Questions about these terms:{' '}
          <ContactLink href="mailto:yourpeachyplanner@gmail.com">yourpeachyplanner@gmail.com</ContactLink>.
        </P>
      </Section>
      </BodyInner>
    </Body>

    <Footer />
  </Page>
);
