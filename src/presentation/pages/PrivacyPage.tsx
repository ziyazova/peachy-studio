import React from 'react';
import styled from 'styled-components';
import { Shield, Database, MapPin, Users, Clock, UserCheck, Cookie, Baby, FileEdit, Mail, Lock } from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { Footer } from '../components/shared/Footer';

const Page = styled.div`
  min-height: 100vh;
  background: #fff;
  font-family: ${({ theme }) => theme.typography.fonts.primary};
`;

/* ── Hero ── */

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

/* ── Body (single column, no TOC) ── */

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

/* ── Fact cards ── */

const FactCard = styled.div<{ $accent?: 'purple' | 'green' | 'blue' }>`
  margin: 16px 0 4px;
  padding: 18px 20px;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ $accent }) =>
    $accent === 'green' ? 'rgba(34,197,94,0.18)' :
    $accent === 'blue' ? 'rgba(51,132,244,0.18)' :
    'rgba(99,102,241,0.15)'};
  background: ${({ $accent }) =>
    $accent === 'green' ? 'linear-gradient(135deg, rgba(34,197,94,0.06) 0%, rgba(34,197,94,0.02) 100%)' :
    $accent === 'blue' ? 'linear-gradient(135deg, rgba(51,132,244,0.06) 0%, rgba(51,132,244,0.02) 100%)' :
    'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(99,102,241,0.02) 100%)'};

  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

const FactIcon = styled.div<{ $accent?: 'purple' | 'green' | 'blue' }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { width: 16px; height: 16px; color: ${({ $accent, theme }) =>
    $accent === 'green' ? '#16A34A' :
    $accent === 'blue' ? theme.colors.state.active :
    theme.colors.accent}; }
`;

const FactTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
  letter-spacing: -0.01em;
`;

const FactText = styled.div`
  font-size: 13px;
  color: #555;
  line-height: 1.5;
`;

/* ── Processor grid ── */

const ProcessorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 16px 0 8px;

  @media (max-width: 520px) { grid-template-columns: 1fr; }
`;

const ProcessorCard = styled.div`
  padding: 14px 16px;
  background: ${({ theme }) => theme.colors.background.surfaceAlt};
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: ${({ theme }) => theme.radii.md};

  div:first-child {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 2px;
  }
  div:last-child {
    font-size: 12px;
    color: #777;
    line-height: 1.5;
  }
`;

/* ── Links ── */

const ContactLink = styled.a`
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  border-bottom: 1px solid rgba(99,102,241,0.25);
  transition: border-color ${({ theme }) => theme.transitions.fast};
  &:hover { border-bottom-color: ${({ theme }) => theme.colors.accent}; }
`;

export const PrivacyPage: React.FC = () => (
  <Page>
    <TopNav />

    <Hero>
      <HeroInner>
        <Kicker><Shield /> Legal</Kicker>
        <Title>Privacy Policy</Title>
        <Lead>
          How Peachy Studio collects, uses and protects your personal data.
          We collect as little as possible, keep it in the EU, and give you full control
          to export or delete it at any time.
        </Lead>
        <MetaRow>
          <span>Last updated 18 April 2026</span>
          <span>GDPR-compliant</span>
          <span>Stored in EU (Ireland)</span>
        </MetaRow>
      </HeroInner>
    </Hero>

    <Body>
      <BodyInner>
      <Section>
        <SectionHead>
          <SectionIcon><UserCheck /></SectionIcon>
          <H2>1. Who we are</H2>
        </SectionHead>
        <P>
          Peachy Studio is operated from Stockholm, Sweden, and acts as the data controller for any
          personal data you provide. For any question about this policy or your data, contact{' '}
          <ContactLink href="mailto:yourpeachyplanner@gmail.com">yourpeachyplanner@gmail.com</ContactLink>.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Database /></SectionIcon>
          <H2>2. What we collect</H2>
        </SectionHead>
        <List>
          <li><strong>Account data.</strong> Email, display name, and — if you sign in with Google — the avatar URL provided by Google.</li>
          <li><strong>Widget data.</strong> The widgets you create and their settings (colors, layout, style) so you can edit them later and embed them in Notion.</li>
          <li><strong>Technical data.</strong> Standard server logs (IP address, timestamp, user agent) retained by our hosting providers for security and reliability. We do not use them for advertising.</li>
        </List>
        <FactCard $accent="green">
          <FactIcon $accent="green"><Lock /></FactIcon>
          <div>
            <FactTitle>What we do NOT collect</FactTitle>
            <FactText>No payment data (handled by third-party processors when applicable), no tracking pixels, no advertising cookies, no behavioural profiles, no sale of data.</FactText>
          </div>
        </FactCard>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><FileEdit /></SectionIcon>
          <H2>3. Why we collect it</H2>
        </SectionHead>
        <P>Our legal bases under GDPR Article 6:</P>
        <List>
          <li><strong>Performance of a contract</strong> — to create your account, save your widgets, and let you embed them.</li>
          <li><strong>Legitimate interest</strong> — to keep the service secure, prevent abuse and fix bugs.</li>
          <li><strong>Consent</strong> — for anything beyond the above. If we ever add optional analytics, you will be asked first.</li>
        </List>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><MapPin /></SectionIcon>
          <H2>4. Where your data lives</H2>
        </SectionHead>
        <FactCard $accent="blue">
          <FactIcon $accent="blue"><MapPin /></FactIcon>
          <div>
            <FactTitle>EU West — Ireland (eu-west-1)</FactTitle>
            <FactText>Account and widget data are stored with Supabase in the EU West (Ireland) region. Data stays inside the European Economic Area.</FactText>
          </div>
        </FactCard>
        <P>
          Static files (the website itself) are delivered through Vercel's global CDN. Vercel does
          not receive your account or widget contents — only standard web requests.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Users /></SectionIcon>
          <H2>5. Who we share data with</H2>
        </SectionHead>
        <P>We share data only with processors needed to run the service. We do not sell your data
        and we will never share it with advertisers.</P>
        <ProcessorGrid>
          <ProcessorCard>
            <div>Supabase</div>
            <div>Authentication &amp; database · EU Ireland</div>
          </ProcessorCard>
          <ProcessorCard>
            <div>Vercel</div>
            <div>Static hosting &amp; CDN · global</div>
          </ProcessorCard>
          <ProcessorCard>
            <div>Google</div>
            <div>Only if you choose "Sign in with Google"</div>
          </ProcessorCard>
          <ProcessorCard>
            <div>Polar</div>
            <div>Payments &amp; Merchant of Record · USA</div>
          </ProcessorCard>
          <ProcessorCard>
            <div>No one else</div>
            <div>No advertisers, no analytics, no data brokers</div>
          </ProcessorCard>
        </ProcessorGrid>
        <P>
          <strong>International transfers.</strong> Polar Software Inc. and some sub-processors
          used by Supabase and Vercel are based in the United States. These transfers rely on the
          EU-US Data Privacy Framework (DPF) adequacy decision, to which Supabase, Vercel, Google
          and Polar are all certified. Where the DPF does not apply, transfers use the European
          Commission's Standard Contractual Clauses (SCCs, 2021/914).
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Clock /></SectionIcon>
          <H2>6. How long we keep it</H2>
        </SectionHead>
        <List>
          <li><strong>Account &amp; widgets</strong> — for as long as your account is active.</li>
          <li><strong>After you delete your account</strong> — your profile and all saved widgets are permanently removed within 24 hours.</li>
          <li><strong>Server logs</strong> — retained by our hosting providers for up to 30 days.</li>
          <li><strong>Billing records</strong> — if you subscribed to Pro, Swedish bookkeeping law (Bokföringslagen 1999:1078) requires us (and Polar as Merchant of Record) to retain invoice and payment records for <strong>7 years</strong>. Account deletion does not erase this minimum retention — we keep only what the law requires.</li>
        </List>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Shield /></SectionIcon>
          <H2>7. Your rights</H2>
        </SectionHead>
        <P>Under GDPR you have the right to:</P>
        <List>
          <li><strong>Access</strong> — see what data we hold about you. Use <em>Download my data</em> in account settings to export everything as JSON.</li>
          <li><strong>Correction</strong> — update your name or email in settings.</li>
          <li><strong>Deletion</strong> — permanently erase your data. Use <em>Delete account</em> in settings, or email us.</li>
          <li><strong>Portability</strong> — our JSON export is designed for this.</li>
          <li><strong>Objection</strong> — to how we process your data, by contacting us.</li>
          <li>
            <strong>Complaint</strong> — you can complain to the Swedish Authority for Privacy
            Protection (IMY) at{' '}
            <ContactLink href="https://www.imy.se" target="_blank" rel="noopener noreferrer">
              imy.se
            </ContactLink>, or to the supervisory authority in your EU country of residence.
          </li>
        </List>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Cookie /></SectionIcon>
          <H2>8. Cookies and storage</H2>
        </SectionHead>
        <P>We use browser storage (localStorage) only for things that are strictly necessary:</P>
        <List>
          <li>Your login session (so you stay signed in between visits).</li>
          <li>Your storage consent choice.</li>
          <li>Guest mode preferences, if you use Peachy without an account.</li>
        </List>
        <P>We do not set tracking cookies and do not use third-party analytics.</P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Baby /></SectionIcon>
          <H2>9. Children</H2>
        </SectionHead>
        <P>
          Peachy is not directed at children under 16. If you believe a child has given us personal
          data, please contact us and we will delete it.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><FileEdit /></SectionIcon>
          <H2>10. Changes to this policy</H2>
        </SectionHead>
        <P>
          If we make material changes, we will update the "Last updated" date above and, where
          appropriate, notify you by email.
        </P>
      </Section>

      <Section>
        <SectionHead>
          <SectionIcon><Mail /></SectionIcon>
          <H2>11. Contact</H2>
        </SectionHead>
        <P>
          Questions, concerns or data requests:{' '}
          <ContactLink href="mailto:yourpeachyplanner@gmail.com">yourpeachyplanner@gmail.com</ContactLink>.
          We respond within 14 days.
        </P>
      </Section>
      </BodyInner>
    </Body>

    <Footer />
  </Page>
);
