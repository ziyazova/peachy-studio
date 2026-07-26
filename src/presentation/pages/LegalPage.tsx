import React from 'react';
import styled from 'styled-components';
import { Building2, MapPin, Mail, Receipt, Scale, Shield, AlertCircle, Globe, CreditCard } from 'lucide-react';
import { TopNav } from '../components/layout/TopNav';
import { Footer } from '../components/shared/Footer';

/**
 * Impressum / Legal Notice — required for EU online traders under the
 * e-Commerce Directive 2000/31/EC Art. 5 (Sweden: E-handelslagen SFS 2002:562).
 *
 * Some fields are placeholders pending owner decision D7 (business form
 * A/B/C — see docs/SUBSCRIPTION-LAUNCH-PLAN.md §6). Search for TODO below
 * to find what needs the real value before launch.
 */

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

const Row = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px 24px;
  padding: 10px 0;
  border-top: 1px solid rgba(0,0,0,0.04);

  &:first-of-type { border-top: none; }

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
    gap: 4px;
    padding: 12px 0;
  }
`;

const RowLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.tertiary};
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const RowValue = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.primary};

  em {
    color: #B4623A;
    font-style: normal;
    background: rgba(255, 160, 110, 0.1);
    padding: 2px 8px;
    border-radius: ${({ theme }) => theme.radii.xs};
    font-size: 13px;
  }
`;

const ContactLink = styled.a`
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  border-bottom: 1px solid rgba(99,102,241,0.25);
  transition: border-color ${({ theme }) => theme.transitions.fast};
  &:hover { border-bottom-color: ${({ theme }) => theme.colors.accent}; }
`;

export const LegalPage: React.FC = () => (
  <Page>
    <TopNav />

    <Hero>
      <HeroInner>
        <Kicker><Building2 /> Legal notice</Kicker>
        <Title>Impressum</Title>
        <Lead>
          Disclosures required for online service providers operating in the EU,
          per the e-Commerce Directive 2000/31/EC Article 5 and the Swedish
          E-handelslagen (SFS 2002:562).
        </Lead>
        <MetaRow>
          <span>Last updated 18 April 2026</span>
          <span>Peachy Studio · Sweden</span>
        </MetaRow>
      </HeroInner>
    </Hero>

    <Body>
      <BodyInner>
        <Section>
          <SectionHead>
            <SectionIcon><Building2 /></SectionIcon>
            <H2>1. Operator of this website</H2>
          </SectionHead>
          <Row>
            <RowLabel>Name</RowLabel>
            {/* TODO(D7): once business form (A/B/C) is decided, replace with
                either the personal name (option A — unregistered sole trader)
                or the registered business name (option B — enskild
                näringsverksamhet / option C — aktiebolag). */}
            <RowValue><em>TODO: owner name or registered business name</em></RowValue>
          </Row>
          <Row>
            <RowLabel>Trading as</RowLabel>
            <RowValue>Peachy Studio</RowValue>
          </Row>
          <Row>
            <RowLabel>Country</RowLabel>
            <RowValue>Sweden</RowValue>
          </Row>
          <Row>
            <RowLabel>Business form</RowLabel>
            {/* TODO(D7): fill one of:
                - "Individual (enskild firma, unregistered)"
                - "Enskild näringsverksamhet (registered sole trader)"
                - "Aktiebolag (AB)" */}
            <RowValue><em>TODO: business form</em></RowValue>
          </Row>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><MapPin /></SectionIcon>
            <H2>2. Contact address</H2>
          </SectionHead>
          <Row>
            <RowLabel>Postal address</RowLabel>
            {/* TODO(D7): If option A/B chosen without a virtual office, use a
                business-address-as-a-service (Sverigehuset or similar — see
                §6 of the launch plan). DO NOT publish a personnummer or
                home address. */}
            <RowValue><em>TODO: postal address (use a business-address-as-a-service; do not publish home address)</em></RowValue>
          </Row>
          <Row>
            <RowLabel>Email</RowLabel>
            <RowValue>
              <ContactLink href="mailto:yourpeachyplanner@gmail.com">yourpeachyplanner@gmail.com</ContactLink>
            </RowValue>
          </Row>
          <Row>
            <RowLabel>Response time</RowLabel>
            <RowValue>Typically within 2 business days.</RowValue>
          </Row>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><Receipt /></SectionIcon>
            <H2>3. Registration and tax identifiers</H2>
          </SectionHead>
          <Row>
            <RowLabel>Organisationsnummer</RowLabel>
            {/* TODO(D7): if B or C is chosen and registered at Bolagsverket,
                paste organisationsnummer here. If A (unregistered), write
                "Not applicable — operating as an individual under Swedish
                personal tax (NE-bilaga)." */}
            <RowValue><em>TODO: organisationsnummer if registered, otherwise "Not applicable"</em></RowValue>
          </Row>
          <Row>
            <RowLabel>VAT / momsregistreringsnummer</RowLabel>
            {/* Sweden's VAT threshold is SEK 120,000/year. Under that, no
                VAT registration is required — Polar (Merchant of Record)
                handles VAT on customer sales regardless. */}
            <RowValue><em>TODO: VAT number if registered; otherwise "Not VAT-registered — below SEK 120,000/year threshold. VAT on customer sales is collected and remitted by Polar Software Inc. as Merchant of Record."</em></RowValue>
          </Row>
          <Row>
            <RowLabel>F-skatt</RowLabel>
            {/* TODO(D7): Once F-skatt is approved at Skatteverket, change to
                "Approved (F-skattsedel issued)." */}
            <RowValue><em>TODO: "Approved" once F-skatt is issued by Skatteverket</em></RowValue>
          </Row>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><CreditCard /></SectionIcon>
            <H2>4. Payments — Merchant of Record</H2>
          </SectionHead>
          <P>
            All payments on Peachy are processed by <strong>Polar Software Inc.</strong> acting as
            our Merchant of Record. Polar is the seller of record on your invoice and collects /
            remits VAT, sales tax and any applicable consumption taxes on our behalf.
          </P>
          <P>
            Polar Software Inc., 548 Market Street PMB 72296, San Francisco, CA 94104, USA.
            See{' '}
            <ContactLink href="https://polar.sh" target="_blank" rel="noopener noreferrer">
              polar.sh
            </ContactLink>{' '}
            for Polar's terms and privacy notice. Your card statement will show a charge like
            <strong> POLAR*PEACHY</strong>.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><Scale /></SectionIcon>
            <H2>5. Consumer protection authority</H2>
          </SectionHead>
          <P>
            The supervisory authority for consumer protection in Sweden is the Swedish Consumer
            Agency (<strong>Konsumentverket</strong>). Consumer complaints can be directed to{' '}
            <ContactLink href="https://www.konsumentverket.se" target="_blank" rel="noopener noreferrer">
              konsumentverket.se
            </ContactLink>{' '}
            or the Swedish Consumer Guidance Service,{' '}
            <ContactLink href="https://www.hallakonsument.se" target="_blank" rel="noopener noreferrer">
              hallakonsument.se
            </ContactLink>.
          </P>
          <P>
            Peachy Studio is not currently registered in any supervised professional body beyond
            standard Swedish business registration.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><Globe /></SectionIcon>
            <H2>6. EU online dispute resolution (ODR)</H2>
          </SectionHead>
          <P>
            Under EU Regulation 524/2013, online traders must provide a link to the EU's ODR
            platform:{' '}
            <ContactLink href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
              ec.europa.eu/consumers/odr
            </ContactLink>.
          </P>
          <P>
            We prefer to resolve complaints directly — please email us first at{' '}
            <ContactLink href="mailto:yourpeachyplanner@gmail.com">yourpeachyplanner@gmail.com</ContactLink>.
            We are not required to participate in alternative dispute resolution procedures
            but will respond promptly to any ODR submission.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><Shield /></SectionIcon>
            <H2>7. Data protection</H2>
          </SectionHead>
          <P>
            For how we collect, process, and protect personal data, see our{' '}
            <ContactLink href="/privacy">Privacy Policy</ContactLink>. The supervisory authority
            for data protection in Sweden is Integritetsskyddsmyndigheten (IMY),{' '}
            <ContactLink href="https://www.imy.se" target="_blank" rel="noopener noreferrer">
              imy.se
            </ContactLink>.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><AlertCircle /></SectionIcon>
            <H2>8. Liability for content and external links</H2>
          </SectionHead>
          <P>
            We take reasonable care to ensure content on this site is accurate. External links
            (for example to Etsy, Notion, or Supabase) are provided for convenience — we are not
            responsible for the content, terms, or privacy practices of external sites. When
            you click an external link you leave Peachy's area of control.
          </P>
        </Section>

        <Section>
          <SectionHead>
            <SectionIcon><Mail /></SectionIcon>
            <H2>9. Contact</H2>
          </SectionHead>
          <P>
            Questions about any of the above:{' '}
            <ContactLink href="mailto:yourpeachyplanner@gmail.com">yourpeachyplanner@gmail.com</ContactLink>.
          </P>
        </Section>
      </BodyInner>
    </Body>

    <Footer />
  </Page>
);
