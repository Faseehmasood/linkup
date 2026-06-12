import {Body,Button,Container,Head,Heading,Hr,Html,Preview,Section,Text,} from "@react-email/components";

interface MagicLinkEmailProps {
  clientName: string;
  freelancerName: string;
  magicLink: string;
}

export default function MagicLinkEmail({
  clientName,
  freelancerName,
  magicLink,
}: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your project portal access — LinkUp</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Heading style={headerText}>LinkUp</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>Hello {clientName},</Text>
            <Text style={paragraph}>
              <strong>{freelancerName}</strong> has invited you to their
              project portal on LinkUp. You can use this portal to view
              project progress, files, and invoices — all in one place.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={magicLink}>
                Access Your Portal
              </Button>
            </Section>

            <Text style={smallText}>
              This link will expire in 24 hours and can only be used once.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              If you did not expect this invitation, you can safely ignore
              this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}


const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden" as const,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const header = {
  backgroundColor: "#000000",
  padding: "24px 32px",
};

const headerText = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const content = {
  padding: "32px",
};

const greeting = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "15px",
  color: "#444",
  lineHeight: "1.6",
  margin: "0 0 24px",
};

const buttonSection = {
  textAlign: "center" as const,
  marginBottom: "16px",
};

const button = {
  backgroundColor: "#000000",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
};

const smallText = {
  fontSize: "13px",
  color: "#888",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const hr = {
  borderColor: "#e9ecef",
  margin: "0 0 20px",
};

const footer = {
  fontSize: "13px",
  color: "#888",
  textAlign: "center" as const,
};