import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

interface InvoiceEmailProps {
  clientName: string;
  freelancerName: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate?: string;
  projectTitle: string;
  wiseEmail?: string;
  payoneerEmail?: string;
  portalUrl: string;
}

export default function InvoiceEmail({
  clientName,
  freelancerName,
  invoiceNumber,
  amount,
  currency,
  dueDate,
  projectTitle,
  wiseEmail,
  payoneerEmail,
  portalUrl,
}: InvoiceEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Invoice {invoiceNumber} — {amount.toString()} {currency} due
      </Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Heading style={headerText}>LinkUp</Heading>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Text style={greeting}>Hello {clientName},</Text>
            <Text style={paragraph}>
              You have received a new invoice from{" "}
              <strong>{freelancerName}</strong> for the project{" "}
              <strong>{projectTitle}</strong>.
            </Text>

            {/* Invoice details */}
            <Section style={invoiceBox}>
              <Row>
                <Column>
                  <Text style={invoiceLabel}>Invoice Number</Text>
                  <Text style={invoiceValue}>{invoiceNumber}</Text>
                </Column>
                <Column>
                  <Text style={invoiceLabel}>Amount Due</Text>
                  <Text style={invoiceValueLarge}>
                    {currency} {amount}
                  </Text>
                </Column>
              </Row>
              {dueDate && (
                <Row>
                  <Column>
                    <Text style={invoiceLabel}>Due Date</Text>
                    <Text style={invoiceValue}>
                      {new Date(dueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Payment details */}
            {(wiseEmail || payoneerEmail) && (
              <Section style={paymentSection}>
                <Text style={paymentTitle}>Payment Details</Text>
                {wiseEmail && (
                  <Text style={paymentDetail}>
                    💳 <strong>Wise:</strong> {wiseEmail}
                  </Text>
                )}
                {payoneerEmail && (
                  <Text style={paymentDetail}>
                    💳 <strong>Payoneer:</strong> {payoneerEmail}
                  </Text>
                )}
              </Section>
            )}

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={button} href={portalUrl}>
                View Invoice in Portal
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              If you have any questions, please contact {freelancerName}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
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

const invoiceBox = {
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  padding: "20px 24px",
  marginBottom: "24px",
  border: "1px solid #e9ecef",
};

const invoiceLabel = {
  fontSize: "12px",
  color: "#888",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 4px",
};

const invoiceValue = {
  fontSize: "15px",
  color: "#1a1a1a",
  fontWeight: "500",
  margin: "0",
};

const invoiceValueLarge = {
  fontSize: "24px",
  color: "#000",
  fontWeight: "700",
  margin: "0",
};

const paymentSection = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "16px 20px",
  marginBottom: "24px",
  border: "1px solid #bbf7d0",
};

const paymentTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#166534",
  margin: "0 0 8px",
};

const paymentDetail = {
  fontSize: "14px",
  color: "#166534",
  margin: "0 0 4px",
};

const buttonSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
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

const hr = {
  borderColor: "#e9ecef",
  margin: "0 0 20px",
};

const footer = {
  fontSize: "13px",
  color: "#888",
  textAlign: "center" as const,
};