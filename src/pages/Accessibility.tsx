import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Keyboard,
  Eye,
  Monitor,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

/**
 * Accessibility Statement Page
 *
 * This page documents ENVault's commitment to accessibility and compliance
 * with WCAG 2.1 AA standards and ADA requirements.
 */
export default function Accessibility() {
  useDocumentTitle("Accessibility Statement");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <nav aria-label="Breadcrumb" className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back to Home
            </Link>
          </nav>
          <h1 className="text-3xl font-bold text-foreground">
            Accessibility Statement
          </h1>
          <p className="mt-2 text-muted-foreground">
            Our commitment to digital accessibility for all users
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 py-12" tabIndex={-1}>
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Commitment Section */}
          <section aria-labelledby="commitment-heading">
            <h2 id="commitment-heading" className="text-2xl font-semibold mb-4">
              Our Commitment
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              ENVault is committed to ensuring digital accessibility for people with
              disabilities. We are continually improving the user experience for
              everyone and applying the relevant accessibility standards to ensure we
              provide equal access to all users.
            </p>
          </section>

          {/* Conformance Status */}
          <section aria-labelledby="conformance-heading">
            <h2 id="conformance-heading" className="text-2xl font-semibold mb-4">
              Conformance Status
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-foreground">
                      WCAG 2.1 Level AA Conformance
                    </p>
                    <p className="text-muted-foreground mt-1">
                      The Web Content Accessibility Guidelines (WCAG) defines requirements
                      for designers and developers to improve accessibility for people with
                      disabilities. ENVault aims to conform to WCAG 2.1 Level AA standards.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Accessibility Features */}
          <section aria-labelledby="features-heading">
            <h2 id="features-heading" className="text-2xl font-semibold mb-6">
              Accessibility Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Keyboard className="h-5 w-5 text-primary" aria-hidden="true" />
                    Keyboard Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Full keyboard accessibility throughout the application</li>
                    <li>• Skip navigation links for quick content access</li>
                    <li>• Visible focus indicators on all interactive elements</li>
                    <li>• Logical tab order following visual layout</li>
                    <li>• Keyboard shortcuts for common actions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" aria-hidden="true" />
                    Visual Accessibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Sufficient color contrast ratios (4.5:1 minimum)</li>
                    <li>• Resizable text up to 200% without loss of functionality</li>
                    <li>• Color is not the sole means of conveying information</li>
                    <li>• Support for high contrast mode</li>
                    <li>• Reduced motion support for vestibular disorders</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-primary" aria-hidden="true" />
                    Screen Reader Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Semantic HTML structure with proper landmarks</li>
                    <li>• ARIA labels and descriptions where needed</li>
                    <li>• Live regions for dynamic content updates</li>
                    <li>• Descriptive link and button text</li>
                    <li>• Proper heading hierarchy</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                    Forms & Inputs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Clear labels associated with all form inputs</li>
                    <li>• Descriptive error messages with suggestions</li>
                    <li>• Focus management in modal dialogs</li>
                    <li>• Sufficient touch target sizes (44x44px minimum)</li>
                    <li>• Autocomplete attributes for common fields</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section aria-labelledby="shortcuts-heading">
            <h2 id="shortcuts-heading" className="text-2xl font-semibold mb-4">
              Keyboard Shortcuts
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full" role="table">
                    <caption className="sr-only">
                      Available keyboard shortcuts in ENVault
                    </caption>
                    <thead>
                      <tr className="border-b">
                        <th scope="col" className="text-left py-3 px-4 font-medium">
                          Action
                        </th>
                        <th scope="col" className="text-left py-3 px-4 font-medium">
                          Windows / Linux
                        </th>
                        <th scope="col" className="text-left py-3 px-4 font-medium">
                          macOS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Toggle Sidebar</td>
                        <td className="py-3 px-4">
                          <kbd className="px-2 py-1 bg-muted rounded text-sm">Ctrl</kbd>
                          {" + "}
                          <kbd className="px-2 py-1 bg-muted rounded text-sm">B</kbd>
                        </td>
                        <td className="py-3 px-4">
                          <kbd className="px-2 py-1 bg-muted rounded text-sm">⌘</kbd>
                          {" + "}
                          <kbd className="px-2 py-1 bg-muted rounded text-sm">B</kbd>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Open Search</td>
                        <td className="py-3 px-4">
                          <kbd className="px-2 py-1 bg-muted rounded text-sm">Ctrl</kbd>
                          {" + "}
                          <kbd className="px-2 py-1 bg-muted rounded text-sm">K</kbd>
                        </td>
                        <td className="py-3 px-4">
                          <kbd className="px-2 py-1 bg-muted rounded text-sm">⌘</kbd>
                          {" + "}
                          <kbd className="px-2 py-1 bg-muted rounded text-sm">K</kbd>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Skip to Main Content</td>
                        <td className="py-3 px-4" colSpan={2}>
                          <kbd className="px-2 py-1 bg-muted rounded text-sm">Tab</kbd>
                          {" (first focusable element)"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Close Dialog</td>
                        <td className="py-3 px-4" colSpan={2}>
                          <kbd className="px-2 py-1 bg-muted rounded text-sm">Escape</kbd>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Technologies Used */}
          <section aria-labelledby="technologies-heading">
            <h2 id="technologies-heading" className="text-2xl font-semibold mb-4">
              Compatibility
            </h2>
            <p className="text-muted-foreground mb-4">
              ENVault is designed to be compatible with the following assistive technologies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
              <li>Screen magnification software</li>
              <li>Speech recognition software</li>
              <li>Keyboard-only navigation</li>
              <li>Browser zoom and text-only zoom</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Our website is designed to work with modern web browsers including Chrome,
              Firefox, Safari, and Edge.
            </p>
          </section>

          {/* Known Limitations */}
          <section aria-labelledby="limitations-heading">
            <h2 id="limitations-heading" className="text-2xl font-semibold mb-4">
              Known Limitations
            </h2>
            <Card className="border-amber-500/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" aria-hidden="true" />
                  <div>
                    <p className="text-muted-foreground">
                      While we strive for full accessibility, some limitations may exist:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                      <li>
                        Third-party integrations may have varying levels of accessibility
                      </li>
                      <li>
                        Some complex data visualizations may require alternative text descriptions
                      </li>
                      <li>
                        PDF exports may require additional accessibility remediation
                      </li>
                    </ul>
                    <p className="text-muted-foreground mt-3">
                      We are actively working to address these limitations and improve
                      accessibility across all features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Feedback */}
          <section aria-labelledby="feedback-heading">
            <h2 id="feedback-heading" className="text-2xl font-semibold mb-4">
              Feedback & Contact
            </h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  We welcome your feedback on the accessibility of ENVault. If you
                  encounter accessibility barriers or have suggestions for improvement,
                  please contact us:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild>
                    <a href="mailto:accessibility@envault.net">
                      <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
                      Email Accessibility Team
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a
                      href="https://github.com/dj-pearson/vault-verse/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Report an Issue on GitHub
                    </a>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  We aim to respond to accessibility feedback within 5 business days.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Legal Compliance */}
          <section aria-labelledby="legal-heading">
            <h2 id="legal-heading" className="text-2xl font-semibold mb-4">
              Legal Compliance
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                ENVault is committed to compliance with the following accessibility
                standards and regulations:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Americans with Disabilities Act (ADA)</strong> - Title III
                  requirements for public accommodations
                </li>
                <li>
                  <strong>Section 508</strong> - Federal accessibility requirements
                  for electronic and information technology
                </li>
                <li>
                  <strong>Web Content Accessibility Guidelines (WCAG) 2.1</strong> -
                  Level AA conformance target
                </li>
                <li>
                  <strong>EN 301 549</strong> - European accessibility requirements
                  for ICT products and services
                </li>
              </ul>
            </div>
          </section>

          {/* Assessment Methods */}
          <section aria-labelledby="assessment-heading">
            <h2 id="assessment-heading" className="text-2xl font-semibold mb-4">
              Assessment Methods
            </h2>
            <p className="text-muted-foreground mb-4">
              ENVault assesses the accessibility of our platform through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Automated accessibility testing with industry-standard tools</li>
              <li>Manual testing with assistive technologies</li>
              <li>Keyboard-only navigation testing</li>
              <li>Color contrast analysis</li>
              <li>User testing with people who have disabilities</li>
              <li>Regular code reviews with accessibility focus</li>
            </ul>
          </section>

          {/* Last Updated */}
          <footer className="border-t pt-8 mt-12">
            <p className="text-sm text-muted-foreground">
              This accessibility statement was last updated on{" "}
              <time dateTime="2026-01-12">January 12, 2026</time>.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This statement is reviewed and updated annually, or when significant
              changes are made to our platform.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
