import { Metadata } from 'next';
import { ContactForm } from '@/components/ui/contact-form';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with me. I\'d love to hear from you!',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have a question, suggestion, or just want to say hello? I&apos;d love to hear from you. 
            Send me a message and I&apos;ll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <ContactForm />
        </div>

        {/* Additional Contact Information */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Other Ways to Connect
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Response Time
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  I typically respond to messages within 24-48 hours. For urgent matters, 
                  please mention it in your subject line.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  What to Expect
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Whether you have feedback, collaboration ideas, or technical questions, 
                  I&apos;m always excited to connect with fellow developers and readers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}