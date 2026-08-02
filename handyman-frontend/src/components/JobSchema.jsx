// src/components/JobSchema.jsx
import { Helmet } from "react-helmet-async";

const JobSchema = ({ job }) => {
  if (!job) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt,
    validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    hiringOrganization: {
      "@type": "Organization",
      name: job.clientName || "Handyman",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.district,
        addressCountry: "GE",
      },
    },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "GEL",
      value: {
        "@type": "QuantitativeValue",
        value: job.budget,
        unitText: "DAY",
      },
    },
    employmentType: "CONTRACTOR",
    workHours: "Flexible",
    industry: job.category,
    jobBenefits: "Flexible schedule",
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default JobSchema;
