import "./globals.css";

export const metadata = {
  title: "Nextern — AI Internship Matcher",
  description: "Upload your resume and get AI-matched internships with a personalized action plan.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
